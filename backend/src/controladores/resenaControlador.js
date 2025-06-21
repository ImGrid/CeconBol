/**
 * Controlador de Reseñas
 * Maneja requests y responses para reseñas
 */

const resenaService = require('../servicios/resenaServicio');
const { asyncHandler } = require('../middlewares/manejoErrores');

/**
 * POST /resenas
 * Crear nueva reseña (público)
 */
const createResena = asyncHandler(async (req, res) => {
  const resena = await resenaService.createResena(req.body);
  
  res.created('Reseña enviada exitosamente', resena);
});

/**
 * GET /resenas/salon/:salonId
 * Obtener reseñas de un salón (público)
 */
const getResenasSalon = asyncHandler(async (req, res) => {
  const { salonId } = req.params;
  
  const filtros = {
    calificacionMinima: req.query.calificacionMinima
  };
  
  const paginacion = {
    page: req.query.page,
    limit: req.query.limit
  };
  
  const result = await resenaService.getResenasSalon(salonId, filtros, paginacion);
  
  res.success('Reseñas del salón obtenidas', {
    resenas: result.resenas,
    estadisticas: result.estadisticas,
    pagination: result.pagination
  });
});

/**
 * GET /resenas/mis-resenas
 * Obtener reseñas del proveedor (todas sus salones)
 */
const getMisResenas = asyncHandler(async (req, res) => {
  const filtros = {
    estado: req.query.estado,
    calificacionMinima: req.query.calificacionMinima
  };
  
  const paginacion = {
    page: req.query.page,
    limit: req.query.limit
  };
  
  const result = await resenaService.getResenasProveedor(
    req.user.id, 
    filtros, 
    paginacion
  );
  
  res.paginated('Mis reseñas obtenidas', result.resenas, result.pagination);
});

/**
 * GET /resenas/:resenaId
 * Obtener reseña específica
 */
const getResenaById = asyncHandler(async (req, res) => {
  const resena = await resenaService.getResenaById(
    req.params.resenaId,
    req.user?.id,
    req.user?.rol || 'guest'
  );
  
  res.success('Reseña obtenida', resena);
});

/**
 * POST /resenas/:resenaId/responder
 * Responder a una reseña (proveedor)
 */
const responderResena = asyncHandler(async (req, res) => {
  const { resenaId } = req.params;
  const { respuesta } = req.body;
  
  const resena = await resenaService.responderResena(
    resenaId,
    respuesta,
    req.user.id
  );
  
  res.success('Respuesta agregada exitosamente', resena);
});

/**
 * PUT /resenas/:resenaId/moderar
 * Moderar reseña (aprobar/rechazar) - solo admin
 */
const moderarResena = asyncHandler(async (req, res) => {
  const { resenaId } = req.params;
  const { decision, motivoRechazo } = req.body;
  
  const resena = await resenaService.moderarResena(
    resenaId,
    decision,
    req.user.id,
    motivoRechazo
  );
  
  res.success('Reseña moderada exitosamente', resena);
});

/**
 * GET /resenas/stats
 * Obtener estadísticas de reseñas del proveedor
 */
const getEstadisticasResenas = asyncHandler(async (req, res) => {
  const stats = await resenaService.getEstadisticasProveedor(req.user.id);
  
  res.success('Estadísticas de reseñas', stats);
});

/**
 * GET /resenas/pendientes
 * Obtener reseñas pendientes de moderación (solo admin)
 */
const getResenasPendientes = asyncHandler(async (req, res) => {
  const paginacion = {
    page: req.query.page,
    limit: req.query.limit
  };
  
  const result = await resenaService.getResenasPendientes(paginacion);
  
  res.paginated('Reseñas pendientes obtenidas', result.resenas, result.pagination);
});

/**
 * GET /resenas/dashboard
 * Dashboard con resumen de reseñas para proveedor
 */
const getDashboard = asyncHandler(async (req, res) => {
  const { Resena, Venue } = require('../modelos');
  
  // Obtener salones del proveedor
  const salones = await Venue.find({ propietario: req.user.id }).select('_id nombre');
  const salonIds = salones.map(salon => salon._id);
  
  if (salonIds.length === 0) {
    return res.success('Dashboard de reseñas', {
      resumenEstados: {},
      resenasRecientes: [],
      calificacionPromedio: 0,
      totalResenas: 0
    });
  }
  
  const [resumenEstados, resenasRecientes, estadisticasGenerales] = await Promise.all([
    // Resumen por estados
    Resena.aggregate([
      { $match: { salon: { $in: salonIds } } },
      { $group: { _id: '$estado', count: { $sum: 1 } } }
    ]),
    
    // Reseñas recientes (últimas 5)
    Resena.find({ salon: { $in: salonIds } })
      .populate('salon', 'nombre')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    
    // Estadísticas generales
    Resena.aggregate([
      { $match: { salon: { $in: salonIds }, estado: 'aprobado' } },
      {
        $group: {
          _id: null,
          totalResenas: { $sum: 1 },
          calificacionPromedio: { $avg: '$calificacionGeneral' }
        }
      }
    ])
  ]);
  
  // Formatear resumen de estados
  const resumen = {};
  resumenEstados.forEach(item => {
    resumen[item._id] = item.count;
  });
  
  const statsData = estadisticasGenerales[0] || { 
    totalResenas: 0, 
    calificacionPromedio: 0 
  };
  
  res.success('Dashboard de reseñas', {
    resumenEstados: resumen,
    resenasRecientes: resenasRecientes.map(resena => ({
      id: resena._id,
      salon: resena.salon.nombre,
      titulo: resena.titulo,
      calificacionGeneral: resena.calificacionGeneral,
      nombreRevisor: resena.nombreRevisor,
      estado: resena.estado,
      fechaCreacion: resena.createdAt
    })),
    calificacionPromedio: Math.round(statsData.calificacionPromedio * 10) / 10 || 0,
    totalResenas: statsData.totalResenas,
    totalSalones: salones.length
  });
});

/**
 * GET /resenas/verificar-eligibilidad/:eventoId
 * Verificar si se puede crear reseña para un evento
 */
const verificarElegibilidad = asyncHandler(async (req, res) => {
  const { eventoId } = req.params;
  const { emailCliente } = req.query;
  
  if (!emailCliente) {
    return res.badRequest('Email del cliente es requerido');
  }
  
  const { Evento, Resena } = require('../modelos');
  
  // Verificar evento
  const evento = await Evento.findById(eventoId);
  
  if (!evento) {
    return res.notFound('Evento no encontrado');
  }
  
  const elegibilidad = {
    puedeCrearResena: false,
    motivo: null,
    evento: {
      id: evento._id,
      nombreEvento: evento.nombreEvento,
      fechaEvento: evento.fechaEvento,
      estado: evento.estado
    }
  };
  
  // Verificar estado del evento
  if (evento.estado !== 'completado') {
    elegibilidad.motivo = 'El evento debe estar completado para crear una reseña';
    return res.success('Elegibilidad verificada', elegibilidad);
  }
  
  // Verificar email del cliente
  if (evento.emailCliente.toLowerCase() !== emailCliente.toLowerCase()) {
    elegibilidad.motivo = 'Solo el cliente del evento puede crear la reseña';
    return res.success('Elegibilidad verificada', elegibilidad);
  }
  
  // Verificar reseña existente
  const resenaExistente = await Resena.findOne({
    evento: eventoId,
    emailRevisor: emailCliente.toLowerCase()
  });
  
  if (resenaExistente) {
    elegibilidad.motivo = 'Ya existe una reseña para este evento';
    return res.success('Elegibilidad verificada', elegibilidad);
  }
  
  // Verificar tiempo límite (6 meses)
  const seiseMesesAtras = new Date();
  seiseMesesAtras.setMonth(seiseMesesAtras.getMonth() - 6);
  
  if (evento.fechaEvento < seiseMesesAtras) {
    elegibilidad.motivo = 'No se pueden crear reseñas para eventos de hace más de 6 meses';
    return res.success('Elegibilidad verificada', elegibilidad);
  }
  
  // Todo está bien, puede crear reseña
  elegibilidad.puedeCrearResena = true;
  elegibilidad.motivo = 'Puede crear reseña para este evento';
  
  res.success('Elegibilidad verificada', elegibilidad);
});

module.exports = {
  createResena,
  getResenasSalon,
  getMisResenas,
  getResenaById,
  responderResena,
  moderarResena,
  getEstadisticasResenas,
  getResenasPendientes,
  getDashboard,
  verificarElegibilidad
};