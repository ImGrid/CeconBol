/**
 * Servicio de Consultas
 * Lógica de negocio para lead management
 */

const { Consulta, Venue } = require('../modelos');
const { createError } = require('../middlewares/manejoErrores');
const { logBusiness } = require('../utilidades/logs');

/**
 * Crear nueva consulta
 */
const createConsulta = async (consultaData) => {
  const { salon: salonId } = consultaData;
  
  // Verificar que el salón existe y está aprobado
  const salon = await Venue.findOne({ _id: salonId, estado: 'aprobado' });
  if (!salon) {
    throw createError('Salón no encontrado o no disponible', 404);
  }
  
  // Verificar que la fecha preferida no sea en el pasado
  const fechaPreferida = new Date(consultaData.fechaPreferida);
  if (fechaPreferida < new Date()) {
    throw createError('La fecha del evento no puede ser en el pasado', 400);
  }
  
  // Verificar capacidad del salón
  if (consultaData.numeroInvitados > salon.capacidadMaxima) {
    throw createError(
      `El número de invitados (${consultaData.numeroInvitados}) excede la capacidad máxima del salón (${salon.capacidadMaxima})`,
      400
    );
  }
  
  if (consultaData.numeroInvitados < salon.capacidadMinima) {
    throw createError(
      `El número de invitados (${consultaData.numeroInvitados}) es menor a la capacidad mínima del salón (${salon.capacidadMinima})`,
      400
    );
  }
  
  // Crear consulta
  const consulta = new Consulta(consultaData);
  await consulta.save();
  
  // Popular datos del salón
  await consulta.populate('salon', 'nombre slug propietario');
  
  logBusiness('CONSULTA_CREATED', {
    consultaId: consulta._id,
    salonId,
    clienteEmail: consulta.emailCliente,
    tipoEvento: consulta.tipoEvento,
    fechaEvento: consulta.fechaPreferida
  });
  
  return consulta.getDatosPublicos();
};

/**
 * Obtener consultas por salón (para proveedores)
 */
const getConsultasBySalon = async (salonId, propietarioId, filtros = {}, paginacion = {}) => {
  // Verificar que el salón pertenece al proveedor
  const salon = await Venue.findOne({ _id: salonId, propietario: propietarioId });
  if (!salon) {
    throw createError('Salón no encontrado o no tienes permisos', 404);
  }
  
  const { page = 1, limit = 10 } = paginacion;
  const skip = (page - 1) * limit;
  
  // Construir query con filtros
  const queryFiltros = {
    estado: filtros.estado,
    fechaDesde: filtros.fechaDesde,
    fechaHasta: filtros.fechaHasta
  };
  
  // Obtener consultas
  const [consultas, total] = await Promise.all([
    Consulta.buscarPorSalon(salonId, queryFiltros)
      .skip(skip)
      .limit(parseInt(limit)),
    Consulta.countDocuments({ salon: salonId })
  ]);
  
  const consultasData = consultas.map(consulta => consulta.getDatosProveedor());
  
  return {
    consultas: consultasData,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Obtener consulta específica
 */
const getConsultaById = async (consultaId, userId, userRole) => {
  const consulta = await Consulta.findById(consultaId)
    .populate('salon', 'nombre slug propietario ciudad')
    .populate('tipoEventoId', 'nombre icono')
    .populate('mensajes.remitente', 'nombre apellido email');
  
  if (!consulta) {
    throw createError('Consulta no encontrada', 404);
  }
  
  // Verificar permisos
  if (userRole === 'proveedor') {
    // El proveedor debe ser dueño del salón
    if (consulta.salon.propietario.toString() !== userId) {
      throw createError('No tienes permisos para ver esta consulta', 403);
    }
    return consulta.getDatosProveedor();
  }
  
  if (userRole === 'admin') {
    return consulta.getDatosProveedor();
  }
  
  // Para clientes u otros roles, datos públicos
  return consulta.getDatosPublicos();
};

/**
 * Actualizar estado de consulta
 */
const updateConsultaStatus = async (consultaId, nuevoEstado, propietarioId, datosAdicionales = {}) => {
  const consulta = await Consulta.findById(consultaId).populate('salon');
  
  if (!consulta) {
    throw createError('Consulta no encontrada', 404);
  }
  
  // Verificar permisos del proveedor
  if (consulta.salon.propietario.toString() !== propietarioId) {
    throw createError('No tienes permisos para modificar esta consulta', 403);
  }
  
  const estadosValidos = ['nueva', 'contactado', 'cotizado', 'negociando', 'ganada', 'perdida'];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw createError('Estado inválido', 400);
  }
  
  const estadoAnterior = consulta.estado;
  consulta.estado = nuevoEstado;
  
  // Actualizar datos adicionales según el estado
  if (nuevoEstado === 'cotizado' && datosAdicionales.montoCotizado) {
    consulta.montoCotizado = datosAdicionales.montoCotizado;
  }
  
  if (nuevoEstado === 'ganada' && datosAdicionales.montoFinal) {
    consulta.montoFinal = datosAdicionales.montoFinal;
  }
  
  if (datosAdicionales.proximaFechaSeguimiento) {
    consulta.proximaFechaSeguimiento = new Date(datosAdicionales.proximaFechaSeguimiento);
  }
  
  await consulta.save();
  
  logBusiness('CONSULTA_STATUS_UPDATED', {
    consultaId,
    estadoAnterior,
    estadoNuevo: nuevoEstado,
    propietarioId
  });
  
  return consulta.getDatosProveedor();
};

/**
 * Agregar mensaje a la consulta
 */
const addMessageToConsulta = async (consultaId, mensaje, remitenteId, tipoRemitente, tipoMensaje = 'mensaje') => {
  const consulta = await Consulta.findById(consultaId).populate('salon');
  
  if (!consulta) {
    throw createError('Consulta no encontrada', 404);
  }
  
  // Verificar permisos según el tipo de remitente
  if (tipoRemitente === 'proveedor') {
    if (consulta.salon.propietario.toString() !== remitenteId) {
      throw createError('No tienes permisos para responder esta consulta', 403);
    }
  }
  
  // Agregar mensaje
  await consulta.agregarMensaje(mensaje, remitenteId, tipoRemitente, tipoMensaje);
  
  // Si el estado es 'nueva' y el proveedor responde, cambiar a 'contactado'
  if (consulta.estado === 'nueva' && tipoRemitente === 'proveedor') {
    consulta.estado = 'contactado';
    await consulta.save();
  }
  
  logBusiness('MESSAGE_ADDED_TO_CONSULTA', {
    consultaId,
    remitenteId,
    tipoRemitente,
    tipoMensaje
  });
  
  // Retornar consulta actualizada
  await consulta.populate('mensajes.remitente', 'nombre apellido email');
  return consulta.getDatosProveedor();
};

/**
 * Obtener consultas del proveedor (todas sus salones)
 */
const getConsultasProveedor = async (propietarioId, filtros = {}, paginacion = {}) => {
  // Obtener IDs de salones del proveedor
  const salones = await Venue.find({ propietario: propietarioId }).select('_id');
  const salonIds = salones.map(salon => salon._id);
  
  if (salonIds.length === 0) {
    return {
      consultas: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  }
  
  const { page = 1, limit = 10 } = paginacion;
  const skip = (page - 1) * limit;
  
  // Construir query
  const query = { salon: { $in: salonIds } };
  
  if (filtros.estado) query.estado = filtros.estado;
  if (filtros.fechaDesde) query.fechaPreferida = { $gte: new Date(filtros.fechaDesde) };
  if (filtros.fechaHasta) {
    query.fechaPreferida = query.fechaPreferida 
      ? { ...query.fechaPreferida, $lte: new Date(filtros.fechaHasta) }
      : { $lte: new Date(filtros.fechaHasta) };
  }
  
  // Ejecutar consultas
  const [consultas, total] = await Promise.all([
    Consulta.find(query)
      .populate('salon', 'nombre slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Consulta.countDocuments(query)
  ]);
  
  const consultasData = consultas.map(consulta => consulta.getDatosProveedor());
  
  return {
    consultas: consultasData,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Obtener estadísticas de consultas
 */
const getConsultaStats = async (propietarioId) => {
  // Obtener IDs de salones del proveedor
  const salones = await Venue.find({ propietario: propietarioId }).select('_id');
  const salonIds = salones.map(salon => salon._id);
  
  if (salonIds.length === 0) {
    return {
      total: 0,
      porEstado: {},
      tasaConversion: 0,
      ingresosPotenciales: 0
    };
  }
  
  // Estadísticas agregadas
  const stats = await Consulta.aggregate([
    { $match: { salon: { $in: salonIds } } },
    {
      $group: {
        _id: '$estado',
        count: { $sum: 1 },
        montoTotal: { $sum: { $ifNull: ['$montoFinal', 0] } }
      }
    }
  ]);
  
  // Formatear resultados
  const porEstado = {};
  let total = 0;
  let ganadas = 0;
  let ingresosTotales = 0;
  
  stats.forEach(stat => {
    porEstado[stat._id] = stat.count;
    total += stat.count;
    if (stat._id === 'ganada') {
      ganadas = stat.count;
      ingresosTotales = stat.montoTotal;
    }
  });
  
  const tasaConversion = total > 0 ? (ganadas / total * 100) : 0;
  
  return {
    total,
    porEstado,
    tasaConversion: Math.round(tasaConversion * 100) / 100,
    ingresosTotales
  };
};

module.exports = {
  createConsulta,
  getConsultasBySalon,
  getConsultaById,
  updateConsultaStatus,
  addMessageToConsulta,
  getConsultasProveedor,
  getConsultaStats
};