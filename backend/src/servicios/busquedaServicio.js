/**
 * Servicio de Búsqueda
 * Lógica avanzada para búsquedas y filtros de salones
 */

const { Venue, Resena, EventType } = require('../modelos');
const { createError } = require('../middlewares/manejoErrores');
const { logBusiness } = require('../utilidades/logs');

/**
 * Búsqueda avanzada de salones
 */
const buscarSalones = async (criterios = {}, paginacion = {}) => {
  const {
    texto,           // Búsqueda por texto
    ciudad,          // Filtro por ciudad
    capacidadMinima, // Capacidad mínima requerida
    capacidadMaxima, // Capacidad máxima requerida
    precioMin,       // Precio mínimo
    precioMax,       // Precio máximo
    calificacion,    // Calificación mínima
    tipoEvento,      // Especialización en tipo de evento
    ordenarPor,      // Campo para ordenar
    orden            // Dirección del ordenamiento
  } = criterios;

  const { page = 1, limit = 12 } = paginacion;
  const skip = (page - 1) * limit;

  // Construir query de MongoDB
  const query = { estado: 'aprobado' };

  // Filtro por texto (búsqueda en nombre y descripción)
  if (texto) {
    query.$or = [
      { nombre: { $regex: texto, $options: 'i' } },
      { descripcion: { $regex: texto, $options: 'i' } }
    ];
  }

  // Filtros básicos
  if (ciudad) query.ciudad = ciudad;
  if (calificacion) query.calificacionPromedio = { $gte: parseFloat(calificacion) };

  // Filtros de capacidad
  if (capacidadMinima) {
    query.capacidadMaxima = { $gte: parseInt(capacidadMinima) };
  }
  if (capacidadMaxima) {
    query.capacidadMinima = { $lte: parseInt(capacidadMaxima) };
  }

  // Filtros de precio
  if (precioMin || precioMax) {
    query.precioBase = {};
    if (precioMin) query.precioBase.$gte = parseFloat(precioMin);
    if (precioMax) query.precioBase.$lte = parseFloat(precioMax);
  }

  // Configurar ordenamiento
  let sortConfig = {};
  
  switch (ordenarPor) {
    case 'precio':
      sortConfig.precioBase = orden === 'desc' ? -1 : 1;
      break;
    case 'calificacion':
      sortConfig.calificacionPromedio = -1;
      sortConfig.totalResenas = -1;
      break;
    case 'capacidad':
      sortConfig.capacidadMaxima = orden === 'desc' ? -1 : 1;
      break;
    case 'nombre':
      sortConfig.nombre = orden === 'desc' ? -1 : 1;
      break;
    case 'fecha':
      sortConfig.createdAt = -1;
      break;
    default:
      // Ordenamiento por defecto: destacados primero, luego por calificación
      sortConfig.destacado = -1;
      sortConfig.calificacionPromedio = -1;
      sortConfig.totalResenas = -1;
  }

  // Ejecutar búsqueda
  const [salones, total] = await Promise.all([
    Venue.find(query)
      .populate('propietario', 'nombre apellido')
      .sort(sortConfig)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    Venue.countDocuments(query)
  ]);

  // Log de búsqueda para analytics
  logBusiness('BUSQUEDA_REALIZADA', {
    criterios: criterios,
    resultados: salones.length,
    total
  });

  return {
    salones: salones.map(salon => formatSalonResult(salon)),
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    },
    filtrosAplicados: {
      texto: texto || null,
      ciudad: ciudad || null,
      capacidadMinima: capacidadMinima || null,
      capacidadMaxima: capacidadMaxima || null,
      precioMin: precioMin || null,
      precioMax: precioMax || null,
      calificacion: calificacion || null,
      ordenarPor: ordenarPor || 'relevancia'
    }
  };
};

/**
 * Sugerir salones basado en criterios
 */
const sugerirSalones = async (criterios = {}) => {
  const { capacidad, ciudad, presupuesto } = criterios;
  
  const query = { estado: 'aprobado' };
  
  // Filtros básicos para sugerencias
  if (ciudad) query.ciudad = ciudad;
  if (capacidad) {
    query.capacidadMinima = { $lte: parseInt(capacidad) };
    query.capacidadMaxima = { $gte: parseInt(capacidad) };
  }
  if (presupuesto) {
    query.precioBase = { $lte: parseFloat(presupuesto) };
  }

  const salones = await Venue.find(query)
    .sort({ 
      calificacionPromedio: -1, 
      totalResenas: -1,
      destacado: -1 
    })
    .limit(6)
    .lean();

  return salones.map(salon => formatSalonResult(salon));
};

/**
 * Obtener salones populares
 */
const getSalonesPopulares = async (limite = 8) => {
  const salones = await Venue.find({ 
    estado: 'aprobado',
    totalResenas: { $gte: 1 } // Solo salones con al menos una reseña
  })
    .sort({ 
      calificacionPromedio: -1,
      totalResenas: -1 
    })
    .limit(limite)
    .lean();

  return salones.map(salon => formatSalonResult(salon));
};

/**
 * Obtener salones destacados
 */
const getSalonesDestacados = async (limite = 6) => {
  const salones = await Venue.find({ 
    estado: 'aprobado',
    destacado: true 
  })
    .sort({ 
      calificacionPromedio: -1,
      totalResenas: -1 
    })
    .limit(limite)
    .lean();

  return salones.map(salon => formatSalonResult(salon));
};

/**
 * Búsqueda por ubicación (básica)
 */
const buscarPorUbicacion = async (latitud, longitud, radioKm = 10, limite = 20) => {
  // Conversión básica de km a grados (aproximada)
  const radioGrados = radioKm / 111; // 1 grado ≈ 111 km

  const query = {
    estado: 'aprobado',
    'coordenadas.latitud': {
      $gte: latitud - radioGrados,
      $lte: latitud + radioGrados
    },
    'coordenadas.longitud': {
      $gte: longitud - radioGrados,
      $lte: longitud + radioGrados
    }
  };

  const salones = await Venue.find(query)
    .sort({ calificacionPromedio: -1 })
    .limit(limite)
    .lean();

  return salones.map(salon => {
    // Calcular distancia aproximada
    const distancia = calcularDistanciaAproximada(
      latitud, longitud,
      salon.coordenadas?.latitud, salon.coordenadas?.longitud
    );
    
    return {
      ...formatSalonResult(salon),
      distanciaKm: distancia
    };
  });
};

/**
 * Obtener opciones de filtros disponibles
 */
const getOpcionesFiltros = async () => {
  const [ciudades, rangosCapacidad, rangosPrecios, tiposEvento] = await Promise.all([
    // Ciudades disponibles
    Venue.distinct('ciudad', { estado: 'aprobado' }),
    
    // Rangos de capacidad
    Venue.aggregate([
      { $match: { estado: 'aprobado' } },
      {
        $group: {
          _id: null,
          minCapacidad: { $min: '$capacidadMinima' },
          maxCapacidad: { $max: '$capacidadMaxima' }
        }
      }
    ]),
    
    // Rangos de precios
    Venue.aggregate([
      { $match: { estado: 'aprobado' } },
      {
        $group: {
          _id: null,
          minPrecio: { $min: '$precioBase' },
          maxPrecio: { $max: '$precioBase' }
        }
      }
    ]),
    
    // Tipos de eventos disponibles
    EventType.find({ activo: true }).select('nombre slug icono').lean()
  ]);

  const capacidadData = rangosCapacidad[0] || { minCapacidad: 0, maxCapacidad: 1000 };
  const precioData = rangosPrecios[0] || { minPrecio: 0, maxPrecio: 50000 };

  return {
    ciudades: ciudades.sort(),
    capacidad: {
      minimo: capacidadData.minCapacidad,
      maximo: capacidadData.maxCapacidad
    },
    precios: {
      minimo: precioData.minPrecio,
      maximo: precioData.maxPrecio
    },
    tiposEvento: tiposEvento,
    ordenamiento: [
      { value: 'relevancia', label: 'Más relevantes' },
      { value: 'calificacion', label: 'Mejor calificados' },
      { value: 'precio', label: 'Precio menor a mayor' },
      { value: 'precio-desc', label: 'Precio mayor a menor' },
      { value: 'capacidad', label: 'Capacidad menor a mayor' },
      { value: 'capacidad-desc', label: 'Capacidad mayor a menor' },
      { value: 'nombre', label: 'Nombre A-Z' },
      { value: 'fecha', label: 'Más recientes' }
    ]
  };
};

/**
 * Búsqueda de autocompletado
 */
const buscarAutocompletado = async (texto, limite = 5) => {
  if (!texto || texto.length < 2) {
    return [];
  }

  const salones = await Venue.find({
    estado: 'aprobado',
    nombre: { $regex: texto, $options: 'i' }
  })
    .select('nombre ciudad')
    .limit(limite)
    .lean();

  return salones.map(salon => ({
    id: salon._id,
    nombre: salon.nombre,
    ciudad: salon.ciudad,
    texto: `${salon.nombre} - ${salon.ciudad}`
  }));
};

/**
 * Formatear resultado de salón para respuestas
 */
const formatSalonResult = (salon) => {
  return {
    id: salon._id,
    nombre: salon.nombre,
    slug: salon.slug,
    descripcion: salon.descripcion,
    ciudad: salon.ciudad,
    direccion: salon.direccion,
    capacidadMinima: salon.capacidadMinima,
    capacidadMaxima: salon.capacidadMaxima,
    precioBase: salon.precioBase,
    modeloPrecio: salon.modeloPrecio,
    calificacionPromedio: salon.calificacionPromedio || 0,
    totalResenas: salon.totalResenas || 0,
    destacado: salon.destacado || false,
    fotoPrincipal: salon.fotos?.find(f => f.esPrincipal)?.url || salon.fotos?.[0]?.url || null,
    propietario: salon.propietario ? {
      nombre: salon.propietario.nombre,
      apellido: salon.propietario.apellido
    } : null
  };
};

/**
 * Calcular distancia aproximada entre dos puntos (fórmula simple)
 */
const calcularDistanciaAproximada = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distancia = R * c;
  
  return Math.round(distancia * 10) / 10; // Redondear a 1 decimal
};

module.exports = {
  buscarSalones,
  sugerirSalones,
  getSalonesPopulares,
  getSalonesDestacados,
  buscarPorUbicacion,
  getOpcionesFiltros,
  buscarAutocompletado
};