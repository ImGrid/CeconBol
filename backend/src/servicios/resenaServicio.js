/**
 * Servicio de Reseñas
 * Lógica de negocio para sistema de calificaciones
 */

const { Resena, Evento, Venue, User } = require('../modelos');
const { createError } = require('../middlewares/manejoErrores');
const { logBusiness } = require('../utilidades/logs');

/**
 * Crear nueva reseña
 */
const createResena = async (resenaData) => {
  const { evento: eventoId, emailRevisor } = resenaData;
  
  // Verificar que el evento existe y está completado
  const evento = await Evento.findById(eventoId)
    .populate('salon', 'nombre propietario');
  
  if (!evento) {
    throw createError('Evento no encontrado', 404);
  }
  
  if (evento.estado !== 'completado') {
    throw createError('Solo se pueden reseñar eventos completados', 400);
  }
  
  // Verificar que el email del revisor coincide con el cliente del evento
  if (evento.emailCliente.toLowerCase() !== emailRevisor.toLowerCase()) {
    throw createError('Solo el cliente del evento puede crear la reseña', 403);
  }
  
  // Verificar que no existe ya una reseña para este evento del mismo cliente
  const resenaExistente = await Resena.findOne({ 
    evento: eventoId, 
    emailRevisor: emailRevisor.toLowerCase() 
  });
  
  if (resenaExistente) {
    throw createError('Ya existe una reseña para este evento', 409);
  }
  
  // Validar que el evento fue hace no más de 6 meses (para evitar reseñas muy tardías)
  const seiseMesesAtras = new Date();
  seiseMesesAtras.setMonth(seiseMesesAtras.getMonth() - 6);
  
  if (evento.fechaEvento < seiseMesesAtras) {
    throw createError('No se pueden crear reseñas para eventos de hace más de 6 meses', 400);
  }
  
  // Crear reseña
  const resena = new Resena({
    ...resenaData,
    salon: evento.salon._id,
    evento: eventoId,
    emailRevisor: emailRevisor.toLowerCase()
  });
  
  await resena.save();
  
  // Popular datos para respuesta
  await resena.populate('evento', 'nombreEvento fechaEvento');
  await resena.populate('salon', 'nombre');
  
  logBusiness('RESENA_CREATED', {
    resenaId: resena._id,
    eventoId,
    salonId: evento.salon._id,
    calificacionGeneral: resena.calificacionGeneral
  });
  
  return resena.getDatosPublicos();
};

/**
 * Obtener reseñas de un salón (público)
 */
const getResenasSalon = async (salonId, filtros = {}, paginacion = {}) => {
  // Verificar que el salón existe
  const salon = await Venue.findById(salonId);
  if (!salon) {
    throw createError('Salón no encontrado', 404);
  }
  
  const { page = 1, limit = 10 } = paginacion;
  const skip = (page - 1) * limit;
  
  // Usar método estático del modelo
  const resenasQuery = Resena.getResenasSalon(salonId, filtros)
    .skip(skip)
    .limit(parseInt(limit));
  
  const [resenas, total, estadisticas] = await Promise.all([
    resenasQuery.exec(),
    Resena.countDocuments({ salon: salonId, estado: 'aprobado' }),
    Resena.getEstadisticasSalon(salonId)
  ]);
  
  const resenasData = resenas.map(resena => resena.getDatosPublicos());
  
  return {
    resenas: resenasData,
    estadisticas,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Obtener reseñas del proveedor (todas sus salones)
 */
const getResenasProveedor = async (propietarioId, filtros = {}, paginacion = {}) => {
  // Obtener salones del proveedor
  const salones = await Venue.find({ propietario: propietarioId }).select('_id');
  const salonIds = salones.map(salon => salon._id);
  
  if (salonIds.length === 0) {
    return {
      resenas: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  }
  
  const { page = 1, limit = 10 } = paginacion;
  const skip = (page - 1) * limit;
  
  // Construir query
  const query = { salon: { $in: salonIds } };
  
  if (filtros.estado) query.estado = filtros.estado;
  if (filtros.calificacionMinima) query.calificacionGeneral = { $gte: filtros.calificacionMinima };
  
  // Ejecutar consultas
  const [resenas, total] = await Promise.all([
    Resena.find(query)
      .populate('salon', 'nombre')
      .populate('evento', 'nombreEvento fechaEvento')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Resena.countDocuments(query)
  ]);
  
  const resenasData = resenas.map(resena => resena.getDatosProveedor());
  
  return {
    resenas: resenasData,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Obtener reseña específica
 */
const getResenaById = async (resenaId, userId, userRole) => {
  const resena = await Resena.findById(resenaId)
    .populate('salon', 'nombre propietario')
    .populate('evento', 'nombreEvento fechaEvento')
    .populate('moderadoPor', 'nombre apellido');
  
  if (!resena) {
    throw createError('Reseña no encontrada', 404);
  }
  
  // Verificar permisos según rol
  if (userRole === 'proveedor') {
    // El proveedor debe ser dueño del salón
    if (resena.salon.propietario.toString() !== userId) {
      throw createError('No tienes permisos para ver esta reseña', 403);
    }
    return resena.getDatosProveedor();
  }
  
  if (userRole === 'admin') {
    return resena.getDatosAdmin();
  }
  
  // Para público, solo reseñas aprobadas
  if (resena.estado !== 'aprobado') {
    throw createError('Reseña no disponible', 404);
  }
  
  return resena.getDatosPublicos();
};

/**
 * Responder a una reseña (proveedor)
 */
const responderResena = async (resenaId, respuesta, propietarioId) => {
  const resena = await Resena.findById(resenaId).populate('salon');
  
  if (!resena) {
    throw createError('Reseña no encontrada', 404);
  }
  
  // Verificar que el proveedor es dueño del salón
  if (resena.salon.propietario.toString() !== propietarioId) {
    throw createError('No tienes permisos para responder esta reseña', 403);
  }
  
  // Solo se puede responder a reseñas aprobadas
  if (resena.estado !== 'aprobado') {
    throw createError('Solo se puede responder a reseñas aprobadas', 400);
  }
  
  // Verificar que no tenga ya una respuesta
  if (resena.respuestaProveedor.texto) {
    throw createError('Esta reseña ya tiene una respuesta', 400);
  }
  
  // Agregar respuesta
  resena.respuestaProveedor = {
    texto: respuesta,
    fechaRespuesta: new Date()
  };
  
  await resena.save();
  
  logBusiness('RESENA_RESPONDIDA', {
    resenaId,
    propietarioId,
    salonId: resena.salon._id
  });
  
  return resena.getDatosProveedor();
};

/**
 * Moderar reseña (aprobar/rechazar) - solo admin
 */
const moderarResena = async (resenaId, decision, moderadorId, motivoRechazo = null) => {
  const resena = await Resena.findById(resenaId);
  
  if (!resena) {
    throw createError('Reseña no encontrada', 404);
  }
  
  if (resena.estado !== 'pendiente') {
    throw createError('Solo se pueden moderar reseñas pendientes', 400);
  }
  
  const decisionesValidas = ['aprobado', 'rechazado'];
  if (!decisionesValidas.includes(decision)) {
    throw createError('Decisión inválida', 400);
  }
  
  if (decision === 'rechazado' && !motivoRechazo) {
    throw createError('El motivo de rechazo es obligatorio', 400);
  }
  
  // Actualizar estado
  resena.estado = decision;
  resena.fechaModeracion = new Date();
  resena.moderadoPor = moderadorId;
  
  if (decision === 'rechazado') {
    resena.motivoRechazo = motivoRechazo;
  }
  
  await resena.save();
  
  logBusiness('RESENA_MODERADA', {
    resenaId,
    decision,
    moderadorId,
    salonId: resena.salon
  });
  
  return resena.getDatosAdmin();
};

/**
 * Obtener estadísticas de reseñas para el proveedor
 */
const getEstadisticasProveedor = async (propietarioId) => {
  // Obtener salones del proveedor
  const salones = await Venue.find({ propietario: propietarioId }).select('_id nombre');
  const salonIds = salones.map(salon => salon._id);
  
  if (salonIds.length === 0) {
    return {
      resumenGeneral: {
        totalResenas: 0,
        calificacionPromedio: 0,
        porcentajeRecomendacion: 0
      },
      porSalon: [],
      resenasRecientes: []
    };
  }
  
  // Estadísticas agregadas
  const [resumenGeneral, porSalon, resenasRecientes] = await Promise.all([
    // Resumen general de todas las reseñas
    Resena.aggregate([
      { $match: { salon: { $in: salonIds }, estado: 'aprobado' } },
      {
        $group: {
          _id: null,
          totalResenas: { $sum: 1 },
          calificacionPromedio: { $avg: '$calificacionGeneral' },
          recomendaciones: { $sum: { $cond: ['$recomendaria', 1, 0] } }
        }
      }
    ]),
    
    // Estadísticas por salón
    Promise.all(
      salones.map(async (salon) => {
        const stats = await Resena.getEstadisticasSalon(salon._id);
        return {
          salonId: salon._id,
          nombreSalon: salon.nombre,
          ...stats
        };
      })
    ),
    
    // Reseñas recientes (últimas 5)
    Resena.find({
      salon: { $in: salonIds },
      estado: 'aprobado'
    })
      .populate('salon', 'nombre')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
  ]);
  
  // Formatear resumen general
  const resumenData = resumenGeneral[0] || {
    totalResenas: 0,
    calificacionPromedio: 0,
    recomendaciones: 0
  };
  
  const porcentajeRecomendacion = resumenData.totalResenas > 0 
    ? Math.round((resumenData.recomendaciones / resumenData.totalResenas) * 100)
    : 0;
  
  return {
    resumenGeneral: {
      totalResenas: resumenData.totalResenas,
      calificacionPromedio: Math.round(resumenData.calificacionPromedio * 10) / 10 || 0,
      porcentajeRecomendacion
    },
    porSalon: porSalon.filter(salon => salon.totalResenas > 0),
    resenasRecientes: resenasRecientes.map(resena => ({
      id: resena._id,
      salon: resena.salon.nombre,
      titulo: resena.titulo,
      calificacionGeneral: resena.calificacionGeneral,
      nombreRevisor: resena.nombreRevisor,
      fechaCreacion: resena.createdAt
    }))
  };
};

/**
 * Obtener reseñas pendientes de moderación (admin)
 */
const getResenasPendientes = async (paginacion = {}) => {
  const { page = 1, limit = 20 } = paginacion;
  const skip = (page - 1) * limit;
  
  const [resenas, total] = await Promise.all([
    Resena.find({ estado: 'pendiente' })
      .populate('salon', 'nombre')
      .populate('evento', 'nombreEvento fechaEvento')
      .sort({ createdAt: 1 }) // Más antiguos primero
      .skip(skip)
      .limit(parseInt(limit)),
    Resena.countDocuments({ estado: 'pendiente' })
  ]);
  
  const resenasData = resenas.map(resena => resena.getDatosAdmin());
  
  return {
    resenas: resenasData,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  createResena,
  getResenasSalon,
  getResenasProveedor,
  getResenaById,
  responderResena,
  moderarResena,
  getEstadisticasProveedor,
  getResenasPendientes
};