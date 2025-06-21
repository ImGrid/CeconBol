/**
 * Servicio de Salones
 * Lógica de negocio para CRUD de salones
 */

const { Venue, ServiceCategory, EventType } = require('../modelos');
const { createError } = require('../middlewares/manejoErrores');
const { logBusiness } = require('../utilidades/logs');

/**
 * Crear nuevo salón
 */
const createSalon = async (salonData, propietarioId) => {
  const salon = new Venue({
    ...salonData,
    propietario: propietarioId
  });
  
  await salon.save();
  
  logBusiness('SALON_CREATED', { 
    salonId: salon._id, 
    propietarioId, 
    nombre: salon.nombre 
  });
  
  return salon.getDatosPublicos();
};

/**
 * Obtener salones con filtros básicos
 */
const getSalones = async (filtros = {}, paginacion = {}) => {
  const { 
    ciudad, 
    capacidadMinima, 
    precioMaximo, 
    estado = 'aprobado',
    search 
  } = filtros;
  
  const { page = 1, limit = 10 } = paginacion;
  const skip = (page - 1) * limit;
  
  // Construir query
  const query = { estado };
  
  if (ciudad) query.ciudad = ciudad;
  if (capacidadMinima) query.capacidadMaxima = { $gte: parseInt(capacidadMinima) };
  if (precioMaximo) query.precioBase = { $lte: parseFloat(precioMaximo) };
  
  // Búsqueda por texto si se proporciona
  if (search) {
    query.$text = { $search: search };
  }
  
  // Ejecutar consultas
  const [salones, total] = await Promise.all([
    Venue.find(query)
      .populate('propietario', 'nombre apellido email')
      .sort({ destacado: -1, calificacionPromedio: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Venue.countDocuments(query)
  ]);
  
  const salonesPublicos = salones.map(salon => salon.getDatosPublicos());
  
  return {
    salones: salonesPublicos,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Obtener salón por ID
 */
const getSalonById = async (salonId) => {
  const salon = await Venue.findById(salonId)
    .populate('propietario', 'nombre apellido email telefono')
    .populate('especializacionesEvento.tipoEvento', 'nombre icono')
    .populate('servicios.categoriaServicio', 'nombre icono');
  
  if (!salon) {
    throw createError('Salón no encontrado', 404);
  }
  
  return salon.getDatosPublicos();
};

/**
 * Obtener salón por slug
 */
const getSalonBySlug = async (slug) => {
  const salon = await Venue.findOne({ slug, estado: 'aprobado' })
    .populate('propietario', 'nombre apellido email')
    .populate('especializacionesEvento.tipoEvento', 'nombre icono')
    .populate('servicios.categoriaServicio', 'nombre icono');
  
  if (!salon) {
    throw createError('Salón no encontrado', 404);
  }
  
  return salon.getDatosPublicos();
};

/**
 * Obtener salones del propietario
 */
const getSalonesByPropietario = async (propietarioId, filtros = {}) => {
  const { estado } = filtros;
  const query = { propietario: propietarioId };
  
  if (estado) query.estado = estado;
  
  const salones = await Venue.find(query)
    .sort({ createdAt: -1 });
  
  return salones.map(salon => salon.getDatosPublicos());
};

/**
 * Actualizar salón
 */
const updateSalon = async (salonId, updateData, propietarioId) => {
  const salon = await Venue.findById(salonId);
  
  if (!salon) {
    throw createError('Salón no encontrado', 404);
  }
  
  // Verificar propiedad (admin puede editar cualquiera)
  if (salon.propietario.toString() !== propietarioId) {
    throw createError('No tienes permisos para editar este salón', 403);
  }
  
  // Campos que se pueden actualizar
  const allowedFields = [
    'nombre', 'descripcion', 'direccion', 'ciudad', 'distrito',
    'coordenadas', 'capacidadMinima', 'capacidadMaxima', 
    'precioBase', 'modeloPrecio', 'telefonoContacto', 
    'whatsapp', 'emailContacto'
  ];
  
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      salon[field] = updateData[field];
    }
  });
  
  // Si se cambia el nombre, regenerar slug
  if (updateData.nombre && updateData.nombre !== salon.nombre) {
    salon.slug = undefined; // Esto triggereará la regeneración automática
  }
  
  await salon.save();
  
  logBusiness('SALON_UPDATED', { 
    salonId: salon._id, 
    propietarioId, 
    changes: Object.keys(updateData) 
  });
  
  return salon.getDatosPublicos();
};

/**
 * Agregar fotos al salón
 */
const addPhotosToSalon = async (salonId, fotosData, propietarioId) => {
  const salon = await Venue.findById(salonId);
  
  if (!salon) {
    throw createError('Salón no encontrado', 404);
  }
  
  if (salon.propietario.toString() !== propietarioId) {
    throw createError('No tienes permisos para editar este salón', 403);
  }
  
  // Agregar fotos
  fotosData.forEach((foto, index) => {
    salon.fotos.push({
      url: foto.url,
      textoAlternativo: foto.textoAlternativo || `Foto ${index + 1} de ${salon.nombre}`,
      esPrincipal: foto.esPrincipal || false,
      ordenVisualizacion: salon.fotos.length + index
    });
  });
  
  await salon.save();
  
  logBusiness('SALON_PHOTOS_ADDED', { 
    salonId, 
    propietarioId, 
    fotosCount: fotosData.length 
  });
  
  return salon.getDatosPublicos();
};

/**
 * Eliminar salón (soft delete - cambiar estado)
 */
const deleteSalon = async (salonId, propietarioId) => {
  const salon = await Venue.findById(salonId);
  
  if (!salon) {
    throw createError('Salón no encontrado', 404);
  }
  
  if (salon.propietario.toString() !== propietarioId) {
    throw createError('No tienes permisos para eliminar este salón', 403);
  }
  
  // Soft delete - cambiar estado en lugar de eliminar
  salon.estado = 'suspendido';
  await salon.save();
  
  logBusiness('SALON_DELETED', { salonId, propietarioId });
  
  return { message: 'Salón eliminado exitosamente' };
};

/**
 * Cambiar estado del salón (solo admin)
 */
const changeSalonStatus = async (salonId, nuevoEstado) => {
  const salon = await Venue.findById(salonId);
  
  if (!salon) {
    throw createError('Salón no encontrado', 404);
  }
  
  const estadosValidos = ['borrador', 'pendiente', 'aprobado', 'rechazado', 'suspendido'];
  if (!estadosValidos.includes(nuevoEstado)) {
    throw createError('Estado inválido', 400);
  }
  
  salon.estado = nuevoEstado;
  await salon.save();
  
  logBusiness('SALON_STATUS_CHANGED', { 
    salonId, 
    oldStatus: salon.estado, 
    newStatus: nuevoEstado 
  });
  
  return salon.getDatosPublicos();
};

module.exports = {
  createSalon,
  getSalones,
  getSalonById,
  getSalonBySlug,
  getSalonesByPropietario,
  updateSalon,
  addPhotosToSalon,
  deleteSalon,
  changeSalonStatus
};