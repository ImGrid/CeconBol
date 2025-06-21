/**
 * Controlador de Eventos
 * Maneja requests y responses para eventos
 */

const eventoService = require('../servicios/eventoServicio');
const pagoService = require('../servicios/pagoServicio');
const { asyncHandler } = require('../middlewares/manejoErrores');

/**
 * POST /eventos/from-consulta/:consultaId
 * Crear evento desde consulta
 */
const createEventoFromConsulta = asyncHandler(async (req, res) => {
  const { consultaId } = req.params;
  const evento = await eventoService.createEventoFromConsulta(
    consultaId, 
    req.body, 
    req.user.id
  );
  
  res.created('Evento creado exitosamente', evento);
});

/**
 * GET /eventos/mis-eventos
 * Obtener eventos del proveedor autenticado
 */
const getMisEventos = asyncHandler(async (req, res) => {
  const filtros = {
    estado: req.query.estado,
    estadoPago: req.query.estadoPago,
    fechaDesde: req.query.fechaDesde,
    fechaHasta: req.query.fechaHasta
  };
  
  const paginacion = {
    page: req.query.page,
    limit: req.query.limit
  };
  
  const result = await eventoService.getEventosProveedor(
    req.user.id, 
    filtros, 
    paginacion
  );
  
  res.paginated('Mis eventos obtenidos', result.eventos, result.pagination);
});

/**
 * GET /eventos/:eventoId
 * Obtener evento específico
 */
const getEventoById = asyncHandler(async (req, res) => {
  const evento = await eventoService.getEventoById(
    req.params.eventoId,
    req.user?.id,
    req.user?.rol || 'guest'
  );
  
  res.success('Evento obtenido', evento);
});

/**
 * PUT /eventos/:eventoId/estado
 * Actualizar estado del evento
 */
const updateEventoStatus = asyncHandler(async (req, res) => {
  const { eventoId } = req.params;
  const { estado, ...datosAdicionales } = req.body;
  
  const evento = await eventoService.updateEventoStatus(
    eventoId,
    estado,
    req.user.id,
    datosAdicionales
  );
  
  res.success('Estado del evento actualizado', evento);
});

/**
 * GET /eventos/stats
 * Obtener estadísticas de eventos del proveedor
 */
const getEventoStats = asyncHandler(async (req, res) => {
  const stats = await eventoService.getEventoStats(req.user.id);
  
  res.success('Estadísticas de eventos', stats);
});

/**
 * POST /eventos/:eventoId/procesar-pago
 * Procesar pago del evento
 */
const procesarPago = asyncHandler(async (req, res) => {
  const { eventoId } = req.params;
  const resultado = await pagoService.procesarPagoEvento(eventoId, req.body);
  
  res.success('Pago procesado exitosamente', resultado);
});

/**
 * GET /eventos/reporte-ingresos
 * Obtener reporte de ingresos del proveedor
 */
const getReporteIngresos = asyncHandler(async (req, res) => {
  const filtros = {
    fechaDesde: req.query.fechaDesde,
    fechaHasta: req.query.fechaHasta
  };
  
  const reporte = await pagoService.getReporteIngresos(req.user.id, filtros);
  
  res.success('Reporte de ingresos generado', reporte);
});

/**
 * GET /eventos/proyeccion-ingresos
 * Obtener proyección de ingresos
 */
const getProyeccionIngresos = asyncHandler(async (req, res) => {
  const meses = parseInt(req.query.meses) || 3;
  const proyeccion = await pagoService.calcularProyeccionIngresos(req.user.id, meses);
  
  res.success('Proyección de ingresos calculada', proyeccion);
});

/**
 * GET /eventos/disponibilidad/:salonId
 * Verificar disponibilidad de salón para una fecha
 */
const verificarDisponibilidad = asyncHandler(async (req, res) => {
  const { salonId } = req.params;
  const { fechaEvento, eventoId } = req.query;
  
  if (!fechaEvento) {
    return res.badRequest('La fecha del evento es requerida');
  }
  
  const disponibilidad = await eventoService.validarDisponibilidadSalon(
    salonId, 
    fechaEvento, 
    eventoId
  );
  
  res.success('Disponibilidad verificada', disponibilidad);
});

/**
 * GET /eventos/dashboard
 * Dashboard con resumen de eventos para proveedor
 */
const getDashboard = asyncHandler(async (req, res) => {
  const { Evento, Venue } = require('../modelos');
  
  // Obtener salones del proveedor
  const salones = await Venue.find({ propietario: req.user.id }).select('_id nombre');
  const salonIds = salones.map(salon => salon._id);
  
  if (salonIds.length === 0) {
    return res.success('Dashboard de eventos', {
      resumenEventos: {},
      eventosProximos: [],
      ingresosMes: 0,
      eventosPendientesPago: 0
    });
  }
  
  const hoy = new Date();
  const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
  const proximosMes = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  
  const [resumenEventos, eventosProximos, ingresosMes, eventosPendientes] = await Promise.all([
    // Resumen por estados
    Evento.aggregate([
      { $match: { salon: { $in: salonIds } } },
      { $group: { _id: '$estado', count: { $sum: 1 } } }
    ]),
    
    // Eventos próximos (siguientes 30 días)
    Evento.find({
      salon: { $in: salonIds },
      estado: { $in: ['confirmado', 'en_progreso'] },
      fechaEvento: {
        $gte: hoy,
        $lte: proximosMes
      }
    })
      .populate('salon', 'nombre')
      .sort({ fechaEvento: 1 })
      .limit(5)
      .lean(),
    
    // Ingresos del mes actual
    Evento.aggregate([
      {
        $match: {
          salon: { $in: salonIds },
          estadoPago: 'completado',
          fechaEvento: {
            $gte: inicioMes,
            $lte: finMes
          }
        }
      },
      {
        $group: {
          _id: null,
          ingresosTotales: { $sum: '$montoProveedor' },
          eventos: { $sum: 1 }
        }
      }
    ]),
    
    // Eventos con pagos pendientes
    Evento.countDocuments({
      salon: { $in: salonIds },
      estado: { $in: ['completado'] },
      estadoPago: { $in: ['pendiente', 'parcial'] }
    })
  ]);
  
  // Formatear resumen de eventos
  const resumen = {};
  resumenEventos.forEach(item => {
    resumen[item._id] = item.count;
  });
  
  const ingresosMesData = ingresosMes[0] || { ingresosTotales: 0, eventos: 0 };
  
  res.success('Dashboard de eventos', {
    resumenEventos: resumen,
    eventosProximos: eventosProximos.map(evento => ({
      id: evento._id,
      salon: evento.salon.nombre,
      nombreEvento: evento.nombreEvento,
      fechaEvento: evento.fechaEvento,
      horaInicio: evento.horaInicio,
      numeroInvitados: evento.numeroInvitados,
      montoTotal: evento.montoTotal,
      estado: evento.estado,
      diasRestantes: Math.ceil((evento.fechaEvento - hoy) / (1000 * 60 * 60 * 24))
    })),
    ingresosMesActual: ingresosMesData.ingresosTotales,
    eventosMesActual: ingresosMesData.eventos,
    eventosPendientesPago: eventosPendientes,
    totalSalones: salones.length
  });
});

/**
 * GET /eventos/comisiones (solo admin)
 * Obtener comisiones pendientes de pago
 */
const getComisionesPendientes = asyncHandler(async (req, res) => {
  const filtros = {
    fechaDesde: req.query.fechaDesde,
    fechaHasta: req.query.fechaHasta
  };
  
  const comisiones = await pagoService.getComisionesPendientes(filtros);
  
  res.success('Comisiones pendientes obtenidas', comisiones);
});

/**
 * GET /eventos/configuracion-comisiones (solo admin)
 * Obtener configuración de comisiones
 */
const getConfiguracionComisiones = asyncHandler(async (req, res) => {
  const configuracion = pagoService.getConfiguracionComisiones();
  
  res.success('Configuración de comisiones', configuracion);
});

/**
 * POST /eventos/calcular-comision
 * Calcular comisión para un monto dado
 */
const calcularComision = asyncHandler(async (req, res) => {
  const { montoTotal, tasaComision } = req.body;
  
  if (!montoTotal || montoTotal <= 0) {
    return res.badRequest('Monto total es requerido y debe ser mayor a 0');
  }
  
  const calculo = pagoService.calcularComision(montoTotal, tasaComision);
  
  res.success('Comisión calculada', calculo);
});

module.exports = {
  createEventoFromConsulta,
  getMisEventos,
  getEventoById,
  updateEventoStatus,
  getEventoStats,
  procesarPago,
  getReporteIngresos,
  getProyeccionIngresos,
  verificarDisponibilidad,
  getDashboard,
  getComisionesPendientes,
  getConfiguracionComisiones,
  calcularComision
};