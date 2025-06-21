/**
 * Servicio de Pagos y Comisiones
 * Manejo de cálculos financieros y comisiones
 */

const { Evento, Venue, User } = require('../modelos');
const { createError } = require('../middlewares/manejoErrores');
const { logBusiness } = require('../utilidades/logs');

/**
 * Configuración de comisiones por defecto
 */
const CONFIGURACION_COMISIONES = {
  tasaBasica: 10, // 10% comisión estándar
  tasaPremium: 8,  // 8% para proveedores premium (futuro)
  montoMinimo: 100, // Monto mínimo de comisión en BOB
  moneda: 'BOB'
};

/**
 * Calcular comisión para un evento
 */
const calcularComision = (montoTotal, tasaComision = null) => {
  const tasa = tasaComision || CONFIGURACION_COMISIONES.tasaBasica;
  const comision = (montoTotal * tasa) / 100;
  
  // Aplicar monto mínimo si es necesario
  const comisionFinal = Math.max(comision, CONFIGURACION_COMISIONES.montoMinimo);
  const montoProveedor = montoTotal - comisionFinal;
  
  return {
    montoTotal,
    tasaComision: tasa,
    montoComision: comisionFinal,
    montoProveedor: Math.max(montoProveedor, 0),
    moneda: CONFIGURACION_COMISIONES.moneda
  };
};

/**
 * Procesar pago de evento (simulado por ahora)
 */
const procesarPagoEvento = async (eventoId, datosTransaccion) => {
  const evento = await Evento.findById(eventoId).populate('salon');
  
  if (!evento) {
    throw createError('Evento no encontrado', 404);
  }
  
  if (evento.estadoPago === 'completado') {
    throw createError('El pago ya ha sido procesado', 400);
  }
  
  if (evento.estado === 'cancelado') {
    throw createError('No se puede procesar pago de un evento cancelado', 400);
  }
  
  // Simular procesamiento de pago
  // En una implementación real, aquí se integraría con una pasarela de pagos
  const resultadoPago = await simularProcesamentoPago(evento, datosTransaccion);
  
  if (resultadoPago.exito) {
    // Actualizar estado del evento
    evento.estadoPago = 'completado';
    
    // Si el evento no está completado, marcarlo como en progreso
    if (evento.estado === 'confirmado') {
      evento.estado = 'en_progreso';
    }
    
    await evento.save();
    
    logBusiness('PAGO_PROCESADO', {
      eventoId,
      montoTotal: evento.montoTotal,
      montoComision: evento.montoComision,
      transaccionId: resultadoPago.transaccionId
    });
    
    return {
      exito: true,
      transaccionId: resultadoPago.transaccionId,
      evento: evento.getDatosProveedor(),
      detallePago: {
        montoTotal: evento.montoTotal,
        montoComision: evento.montoComision,
        montoProveedor: evento.montoProveedor,
        fechaProcesamiento: new Date()
      }
    };
  } else {
    throw createError(`Error en el pago: ${resultadoPago.error}`, 400);
  }
};

/**
 * Obtener reporte de ingresos por proveedor
 */
const getReporteIngresos = async (propietarioId, filtros = {}) => {
  // Obtener salones del proveedor
  const salones = await Venue.find({ propietario: propietarioId }).select('_id nombre');
  const salonIds = salones.map(salon => salon._id);
  
  if (salonIds.length === 0) {
    return {
      resumen: {
        ingresosTotales: 0,
        comisionesTotales: 0,
        ingresosBrutos: 0,
        eventosCompletados: 0
      },
      porPeriodo: [],
      porSalon: []
    };
  }
  
  // Construir filtros de fecha
  const matchQuery = {
    salon: { $in: salonIds },
    estadoPago: 'completado'
  };
  
  if (filtros.fechaDesde || filtros.fechaHasta) {
    matchQuery.fechaEvento = {};
    if (filtros.fechaDesde) matchQuery.fechaEvento.$gte = new Date(filtros.fechaDesde);
    if (filtros.fechaHasta) matchQuery.fechaEvento.$lte = new Date(filtros.fechaHasta);
  }
  
  // Agregaciones para obtener estadísticas
  const [resumen, porMes, porSalon] = await Promise.all([
    // Resumen general
    Evento.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          ingresosTotales: { $sum: '$montoProveedor' },
          comisionesTotales: { $sum: '$montoComision' },
          ingresosBrutos: { $sum: '$montoTotal' },
          eventosCompletados: { $sum: 1 }
        }
      }
    ]),
    
    // Ingresos por mes
    Evento.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$fechaEvento' },
            month: { $month: '$fechaEvento' }
          },
          ingresosBrutos: { $sum: '$montoTotal' },
          comisiones: { $sum: '$montoComision' },
          ingresosNetos: { $sum: '$montoProveedor' },
          eventos: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    
    // Ingresos por salón
    Evento.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$salon',
          ingresosBrutos: { $sum: '$montoTotal' },
          comisiones: { $sum: '$montoComision' },
          ingresosNetos: { $sum: '$montoProveedor' },
          eventos: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'venues',
          localField: '_id',
          foreignField: '_id',
          as: 'salonInfo'
        }
      },
      { $sort: { ingresosBrutos: -1 } }
    ])
  ]);
  
  // Formatear resultados
  const resumenData = resumen[0] || {
    ingresosTotales: 0,
    comisionesTotales: 0,
    ingresosBrutos: 0,
    eventosCompletados: 0
  };
  
  const porPeriodoData = porMes.map(periodo => ({
    año: periodo._id.year,
    mes: periodo._id.month,
    ingresosBrutos: periodo.ingresosBrutos,
    comisiones: periodo.comisiones,
    ingresosNetos: periodo.ingresosNetos,
    eventos: periodo.eventos
  }));
  
  const porSalonData = porSalon.map(salon => ({
    salonId: salon._id,
    nombreSalon: salon.salonInfo[0]?.nombre || 'Salón no encontrado',
    ingresosBrutos: salon.ingresosBrutos,
    comisiones: salon.comisiones,
    ingresosNetos: salon.ingresosNetos,
    eventos: salon.eventos,
    promedioEvento: Math.round(salon.ingresosBrutos / salon.eventos)
  }));
  
  return {
    resumen: resumenData,
    porPeriodo: porPeriodoData,
    porSalon: porSalonData
  };
};

/**
 * Obtener comisiones pendientes de pago
 */
const getComisionesPendientes = async (filtros = {}) => {
  const matchQuery = {
    estadoPago: 'completado',
    estado: 'completado'
  };
  
  if (filtros.fechaDesde || filtros.fechaHasta) {
    matchQuery.fechaEvento = {};
    if (filtros.fechaDesde) matchQuery.fechaEvento.$gte = new Date(filtros.fechaDesde);
    if (filtros.fechaHasta) matchQuery.fechaEvento.$lte = new Date(filtros.fechaHasta);
  }
  
  const comisiones = await Evento.aggregate([
    { $match: matchQuery },
    {
      $lookup: {
        from: 'venues',
        localField: 'salon',
        foreignField: '_id',
        as: 'salonInfo'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'salonInfo.propietario',
        foreignField: '_id',
        as: 'proveedorInfo'
      }
    },
    {
      $group: {
        _id: '$salonInfo.propietario',
        proveedor: { $first: '$proveedorInfo' },
        totalComisiones: { $sum: '$montoComision' },
        totalEventos: { $sum: 1 },
        eventos: {
          $push: {
            eventoId: '$_id',
            nombreEvento: '$nombreEvento',
            fechaEvento: '$fechaEvento',
            montoComision: '$montoComision',
            salon: { $arrayElemAt: ['$salonInfo.nombre', 0] }
          }
        }
      }
    },
    { $sort: { totalComisiones: -1 } }
  ]);
  
  return comisiones.map(comision => ({
    proveedorId: comision._id,
    proveedor: {
      nombre: comision.proveedor[0]?.nombre,
      apellido: comision.proveedor[0]?.apellido,
      email: comision.proveedor[0]?.email
    },
    totalComisiones: comision.totalComisiones,
    totalEventos: comision.totalEventos,
    eventos: comision.eventos
  }));
};

/**
 * Simular procesamiento de pago (placeholder)
 */
const simularProcesamentoPago = async (evento, datosTransaccion) => {
  // Simulación básica - en producción se integraría con pasarela real
  const exito = Math.random() > 0.05; // 95% de éxito
  
  if (exito) {
    return {
      exito: true,
      transaccionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      mensaje: 'Pago procesado exitosamente',
      fechaProcesamiento: new Date()
    };
  } else {
    return {
      exito: false,
      error: 'Error en la validación de la tarjeta',
      codigo: 'CARD_DECLINED'
    };
  }
};

/**
 * Obtener configuración de comisiones
 */
const getConfiguracionComisiones = () => {
  return {
    ...CONFIGURACION_COMISIONES,
    descripcion: {
      tasaBasica: 'Comisión estándar para todos los proveedores',
      tasaPremium: 'Comisión reducida para proveedores premium (futuro)',
      montoMinimo: 'Monto mínimo de comisión por evento'
    }
  };
};

/**
 * Calcular proyección de ingresos
 */
const calcularProyeccionIngresos = async (propietarioId, meses = 3) => {
  // Obtener eventos confirmados para los próximos meses
  const salones = await Venue.find({ propietario: propietarioId }).select('_id');
  const salonIds = salones.map(salon => salon._id);
  
  const fechaInicio = new Date();
  const fechaFin = new Date();
  fechaFin.setMonth(fechaFin.getMonth() + meses);
  
  const eventosProyectados = await Evento.find({
    salon: { $in: salonIds },
    estado: { $in: ['confirmado', 'en_progreso'] },
    fechaEvento: {
      $gte: fechaInicio,
      $lte: fechaFin
    }
  });
  
  const proyeccion = {
    totalEventos: eventosProyectados.length,
    ingresosBrutosProyectados: 0,
    comisionesProyectadas: 0,
    ingresosNetosProyectados: 0,
    porMes: {}
  };
  
  eventosProyectados.forEach(evento => {
    const mes = evento.fechaEvento.getMonth() + 1;
    const año = evento.fechaEvento.getFullYear();
    const clave = `${año}-${mes.toString().padStart(2, '0')}`;
    
    if (!proyeccion.porMes[clave]) {
      proyeccion.porMes[clave] = {
        eventos: 0,
        ingresosBrutos: 0,
        comisiones: 0,
        ingresosNetos: 0
      };
    }
    
    proyeccion.porMes[clave].eventos++;
    proyeccion.porMes[clave].ingresosBrutos += evento.montoTotal;
    proyeccion.porMes[clave].comisiones += evento.montoComision;
    proyeccion.porMes[clave].ingresosNetos += evento.montoProveedor;
    
    proyeccion.ingresosBrutosProyectados += evento.montoTotal;
    proyeccion.comisionesProyectadas += evento.montoComision;
    proyeccion.ingresosNetosProyectados += evento.montoProveedor;
  });
  
  return proyeccion;
};

module.exports = {
  calcularComision,
  procesarPagoEvento,
  getReporteIngresos,
  getComisionesPendientes,
  getConfiguracionComisiones,
  calcularProyeccionIngresos
};