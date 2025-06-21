/**
 * Servicio de Eventos
 * Lógica de negocio para gestión de eventos
 */

const { Evento, Consulta, Venue, EventType } = require('../modelos');
const { createError } = require('../middlewares/manejoErrores');
const { logBusiness } = require('../utilidades/logs');

/**
 * Crear evento desde consulta
 */
const createEventoFromConsulta = async (consultaId, eventoData, propietarioId) => {
  // Verificar que la consulta existe y pertenece al proveedor
  const consulta = await Consulta.findById(consultaId)
    .populate('salon')
    .populate('tipoEventoId');
  
  if (!consulta) {
    throw createError('Consulta no encontrada', 404);
  }
  
  // Verificar propiedad del salón
  if (consulta.salon.propietario.toString() !== propietarioId) {
    throw createError('No tienes permisos para crear eventos en este salón', 403);
  }
  
  // Verificar que la consulta está en estado válido para conversión
  const estadosValidos = ['cotizado', 'negociando', 'ganada'];
  if (!estadosValidos.includes(consulta.estado)) {
    throw createError('La consulta debe estar cotizada o en negociación para crear un evento', 400);
  }
  
  // Verificar que no existe ya un evento para esta consulta
  const eventoExistente = await Evento.findOne({ consulta: consultaId });
  if (eventoExistente) {
    throw createError('Ya existe un evento para esta consulta', 409);
  }
  
  // Validar fecha del evento
  const fechaEvento = new Date(eventoData.fechaEvento);
  if (fechaEvento < new Date()) {
    throw createError('La fecha del evento no puede ser en el pasado', 400);
  }
  
  // Verificar disponibilidad del salón (básica)
  const eventosExistentes = await Evento.find({
    salon: consulta.salon._id,
    fechaEvento: fechaEvento,
    estado: { $in: ['confirmado', 'en_progreso'] }
  });
  
  if (eventosExistentes.length > 0) {
    throw createError('El salón ya tiene un evento confirmado para esa fecha', 409);
  }
  
  // Crear evento con datos de la consulta
  const evento = new Evento({
    salon: consulta.salon._id,
    consulta: consultaId,
    tipoEvento: consulta.tipoEventoId || null,
    nombreEvento: eventoData.nombreEvento || `${consulta.tipoEvento} - ${consulta.nombreCliente}`,
    fechaEvento: fechaEvento,
    horaInicio: eventoData.horaInicio,
    horaFin: eventoData.horaFin,
    numeroInvitados: eventoData.numeroInvitados || consulta.numeroInvitados,
    nombreCliente: consulta.nombreCliente,
    emailCliente: consulta.emailCliente,
    telefonoCliente: consulta.telefonoCliente,
    montoTotal: eventoData.montoTotal,
    tasaComision: eventoData.tasaComision || 10,
    requisitosEspeciales: eventoData.requisitosEspeciales || consulta.requisitosEspeciales,
    notasInternas: eventoData.notasInternas
  });
  
  await evento.save();
  
  // Actualizar estado de la consulta a 'ganada'
  consulta.estado = 'ganada';
  consulta.montoFinal = eventoData.montoTotal;
  await consulta.save();
  
  // Popular datos para respuesta
  await evento.populate('salon', 'nombre ciudad direccion');
  await evento.populate('tipoEvento', 'nombre icono');
  
  logBusiness('EVENTO_CREATED', {
    eventoId: evento._id,
    consultaId,
    salonId: consulta.salon._id,
    propietarioId,
    montoTotal: evento.montoTotal,
    fechaEvento: evento.fechaEvento
  });
  
  return evento.getDatosProveedor();
};

/**
 * Obtener eventos del proveedor
 */
const getEventosProveedor = async (propietarioId, filtros = {}, paginacion = {}) => {
  const { page = 1, limit = 10 } = paginacion;
  const skip = (page - 1) * limit;
  
  // Usar método estático del modelo
  const eventos = await Evento.buscarPorProveedor(propietarioId, filtros)
    .skip(skip)
    .limit(parseInt(limit));
  
  // Contar total para paginación
  const salones = await Venue.find({ propietario: propietarioId }).select('_id');
  const salonIds = salones.map(salon => salon._id);
  
  const query = { salon: { $in: salonIds } };
  if (filtros.estado) query.estado = filtros.estado;
  if (filtros.estadoPago) query.estadoPago = filtros.estadoPago;
  
  const total = await Evento.countDocuments(query);
  
  const eventosData = eventos.map(evento => evento.getDatosProveedor());
  
  return {
    eventos: eventosData,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Obtener evento por ID
 */
const getEventoById = async (eventoId, userId, userRole) => {
  const evento = await Evento.findById(eventoId)
    .populate('salon', 'nombre ciudad direccion propietario')
    .populate('tipoEvento', 'nombre icono')
    .populate('consulta', 'estado mensaje');
  
  if (!evento) {
    throw createError('Evento no encontrado', 404);
  }
  
  // Verificar permisos según rol
  if (userRole === 'proveedor') {
    if (evento.salon.propietario.toString() !== userId) {
      throw createError('No tienes permisos para ver este evento', 403);
    }
    return evento.getDatosProveedor();
  }
  
  if (userRole === 'admin') {
    return evento.getDatosAdmin();
  }
  
  // Para otros casos, datos públicos limitados
  return evento.getDatosPublicos();
};

/**
 * Actualizar estado del evento
 */
const updateEventoStatus = async (eventoId, nuevoEstado, propietarioId, datos = {}) => {
  const evento = await Evento.findById(eventoId).populate('salon');
  
  if (!evento) {
    throw createError('Evento no encontrado', 404);
  }
  
  // Verificar permisos
  if (evento.salon.propietario.toString() !== propietarioId) {
    throw createError('No tienes permisos para modificar este evento', 403);
  }
  
  const estadosValidos = ['confirmado', 'en_progreso', 'completado', 'cancelado'];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw createError('Estado inválido', 400);
  }
  
  // Validaciones de transición de estados
  if (evento.estado === 'completado' && nuevoEstado !== 'completado') {
    throw createError('No se puede cambiar el estado de un evento completado', 400);
  }
  
  if (evento.estado === 'cancelado' && nuevoEstado !== 'cancelado') {
    throw createError('No se puede cambiar el estado de un evento cancelado', 400);
  }
  
  const estadoAnterior = evento.estado;
  evento.estado = nuevoEstado;
  
  // Manejar datos específicos según el estado
  if (nuevoEstado === 'cancelado') {
    evento.fechaCancelacion = new Date();
    evento.motivoCancelacion = datos.motivoCancelacion || 'No especificado';
    evento.estadoPago = 'reembolsado'; // Trigger para procesar reembolso
  }
  
  if (nuevoEstado === 'completado') {
    evento.estadoPago = 'completado'; // Evento completado = pago procesado
  }
  
  // Actualizar notas internas si se proporcionan
  if (datos.notasInternas) {
    evento.notasInternas = datos.notasInternas;
  }
  
  await evento.save();
  
  logBusiness('EVENTO_STATUS_UPDATED', {
    eventoId,
    estadoAnterior,
    estadoNuevo: nuevoEstado,
    propietarioId
  });
  
  return evento.getDatosProveedor();
};

/**
 * Obtener estadísticas de eventos del proveedor
 */
const getEventoStats = async (propietarioId) => {
  // Obtener salones del proveedor
  const salones = await Venue.find({ propietario: propietarioId }).select('_id');
  const salonIds = salones.map(salon => salon._id);
  
  if (salonIds.length === 0) {
    return {
      total: 0,
      porEstado: {},
      porEstadoPago: {},
      ingresosTotales: 0,
      comisionesTotales: 0,
      eventosMesActual: 0,
      proximosEventos: []
    };
  }
  
  // Estadísticas agregadas
  const [statsEstado, statsEstadoPago, ingresos, eventosMes, proximosEventos] = await Promise.all([
    // Por estado
    Evento.aggregate([
      { $match: { salon: { $in: salonIds } } },
      { $group: { _id: '$estado', count: { $sum: 1 } } }
    ]),
    
    // Por estado de pago
    Evento.aggregate([
      { $match: { salon: { $in: salonIds } } },
      { $group: { _id: '$estadoPago', count: { $sum: 1 } } }
    ]),
    
    // Ingresos y comisiones
    Evento.aggregate([
      { 
        $match: { 
          salon: { $in: salonIds },
          estado: { $in: ['completado'] }
        } 
      },
      {
        $group: {
          _id: null,
          ingresosTotales: { $sum: '$montoTotal' },
          comisionesTotales: { $sum: '$montoComision' }
        }
      }
    ]),
    
    // Eventos del mes actual
    Evento.countDocuments({
      salon: { $in: salonIds },
      fechaEvento: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      }
    }),
    
    // Próximos eventos (siguientes 30 días)
    Evento.find({
      salon: { $in: salonIds },
      estado: { $in: ['confirmado', 'en_progreso'] },
      fechaEvento: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })
      .populate('salon', 'nombre')
      .sort({ fechaEvento: 1 })
      .limit(5)
      .lean()
  ]);
  
  // Formatear resultados
  const porEstado = {};
  statsEstado.forEach(stat => {
    porEstado[stat._id] = stat.count;
  });
  
  const porEstadoPago = {};
  statsEstadoPago.forEach(stat => {
    porEstadoPago[stat._id] = stat.count;
  });
  
  const ingresosData = ingresos[0] || { ingresosTotales: 0, comisionesTotales: 0 };
  
  return {
    total: Object.values(porEstado).reduce((a, b) => a + b, 0),
    porEstado,
    porEstadoPago,
    ingresosTotales: ingresosData.ingresosTotales,
    comisionesTotales: ingresosData.comisionesTotales,
    eventosMesActual: eventosMes,
    proximosEventos: proximosEventos.map(evento => ({
      id: evento._id,
      salon: evento.salon.nombre,
      nombreEvento: evento.nombreEvento,
      fechaEvento: evento.fechaEvento,
      horaInicio: evento.horaInicio,
      estado: evento.estado
    }))
  };
};

/**
 * Validar disponibilidad de salón
 */
const validarDisponibilidadSalon = async (salonId, fechaEvento, eventoIdExcluir = null) => {
  const query = {
    salon: salonId,
    fechaEvento: new Date(fechaEvento),
    estado: { $in: ['confirmado', 'en_progreso'] }
  };
  
  if (eventoIdExcluir) {
    query._id = { $ne: eventoIdExcluir };
  }
  
  const eventosExistentes = await Evento.find(query);
  
  return {
    disponible: eventosExistentes.length === 0,
    conflictos: eventosExistentes.map(evento => ({
      id: evento._id,
      nombreEvento: evento.nombreEvento,
      horaInicio: evento.horaInicio,
      horaFin: evento.horaFin
    }))
  };
};

module.exports = {
  createEventoFromConsulta,
  getEventosProveedor,
  getEventoById,
  updateEventoStatus,
  getEventoStats,
  validarDisponibilidadSalon
};