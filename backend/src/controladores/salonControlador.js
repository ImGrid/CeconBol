/**
 * Controlador de Salones
 * Maneja requests y responses para salones
 */

const salonService = require('../servicios/salonServicio');
const { asyncHandler } = require('../middlewares/manejoErrores');

/**
 * POST /salones
 * Crear nuevo salón
 */
const createSalon = asyncHandler(async (req, res) => {
  const salon = await salonService.createSalon(req.body, req.user.id);
  
  res.created('Salón creado exitosamente', salon);
});

/**
 * GET /salones
 * Obtener salones con filtros y paginación
 */
const getSalones = asyncHandler(async (req, res) => {
  const filtros = {
    ciudad: req.query.ciudad,
    capacidadMinima: req.query.capacidadMinima,
    precioMaximo: req.query.precioMaximo,
    estado: req.query.estado,
    search: req.query.search
  };
  
  const paginacion = {
    page: req.query.page,
    limit: req.query.limit
  };
  
  const result = await salonService.getSalones(filtros, paginacion);
  
  res.paginated('Salones obtenidos', result.salones, result.pagination);
});

/**
 * GET /salones/:salonId
 * Obtener salón por ID
 */
const getSalonById = asyncHandler(async (req, res) => {
  const salon = await salonService.getSalonById(req.params.salonId);
  
  res.success('Salón obtenido', salon);
});

/**
 * GET /salones/slug/:slug
 * Obtener salón por slug (para URLs amigables)
 */
const getSalonBySlug = asyncHandler(async (req, res) => {
  const salon = await salonService.getSalonBySlug(req.params.slug);
  
  res.success('Salón obtenido', salon);
});

/**
 * GET /salones/mis-salones
 * Obtener salones del usuario autenticado
 */
const getMySalones = asyncHandler(async (req, res) => {
  const filtros = {
    estado: req.query.estado
  };
  
  const salones = await salonService.getSalonesByPropietario(req.user.id, filtros);
  
  res.success('Mis salones obtenidos', salones);
});

/**
 * PUT /salones/:salonId
 * Actualizar salón
 */
const updateSalon = asyncHandler(async (req, res) => {
  const salon = await salonService.updateSalon(
    req.params.salonId, 
    req.body, 
    req.user.id
  );
  
  res.success('Salón actualizado', salon);
});

/**
 * DELETE /salones/:salonId
 * Eliminar salón (soft delete)
 */
const deleteSalon = asyncHandler(async (req, res) => {
  const result = await salonService.deleteSalon(req.params.salonId, req.user.id);
  
  res.success('Salón eliminado', result);
});

/**
 * POST /salones/:salonId/fotos
 * Subir fotos al salón
 */
const uploadPhotos = asyncHandler(async (req, res) => {
  // Las fotos ya fueron procesadas por el middleware de upload
  if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
    return res.badRequest('No se subieron archivos');
  }
  
  // Procesar datos de fotos
  const fotosData = req.uploadedFiles.map((file, index) => ({
    url: file.url,
    textoAlternativo: req.body.textoAlternativo || `Foto ${index + 1}`,
    esPrincipal: req.body.esPrincipal === 'true' && index === 0 // Solo la primera puede ser principal
  }));
  
  const salon = await salonService.addPhotosToSalon(
    req.params.salonId,
    fotosData,
    req.user.id
  );
  
  res.success('Fotos subidas exitosamente', {
    salon,
    fotosSubidas: req.uploadedFiles.length
  });
});

/**
 * PUT /salones/:salonId/estado
 * Cambiar estado del salón (solo admin)
 */
const changeSalonStatus = asyncHandler(async (req, res) => {
  const { estado } = req.body;
  
  const salon = await salonService.changeSalonStatus(req.params.salonId, estado);
  
  res.success('Estado del salón actualizado', salon);
});

/**
 * GET /salones/propietario/:propietarioId
 * Obtener salones de un propietario específico (solo admin)
 */
const getSalonesByPropietario = asyncHandler(async (req, res) => {
  const filtros = {
    estado: req.query.estado
  };
  
  const salones = await salonService.getSalonesByPropietario(
    req.params.propietarioId, 
    filtros
  );
  
  res.success('Salones del propietario obtenidos', salones);
});

/**
 * GET /salones/stats
 * Obtener estadísticas básicas de salones (solo admin)
 */
const getSalonStats = asyncHandler(async (req, res) => {
  const { Venue } = require('../modelos');
  
  const stats = await Promise.all([
    Venue.countDocuments({ estado: 'aprobado' }),
    Venue.countDocuments({ estado: 'pendiente' }),
    Venue.countDocuments({ estado: 'borrador' }),
    Venue.countDocuments({ estado: 'rechazado' }),
    Venue.aggregate([
      { $group: { _id: '$ciudad', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);
  
  const [aprobados, pendientes, borradores, rechazados, porCiudad] = stats;
  
  res.success('Estadísticas de salones', {
    estados: {
      aprobados,
      pendientes,
      borradores,
      rechazados,
      total: aprobados + pendientes + borradores + rechazados
    },
    porCiudad
  });
});

module.exports = {
  createSalon,
  getSalones,
  getSalonById,
  getSalonBySlug,
  getMySalones,
  updateSalon,
  deleteSalon,
  uploadPhotos,
  changeSalonStatus,
  getSalonesByPropietario,
  getSalonStats
};