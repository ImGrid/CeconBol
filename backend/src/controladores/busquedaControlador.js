/**
 * Controlador de Búsqueda
 * Maneja requests y responses para búsquedas avanzadas
 */

const busquedaService = require('../servicios/busquedaServicio');
const { asyncHandler } = require('../middlewares/manejoErrores');

/**
 * GET /busqueda/salones
 * Búsqueda principal de salones con filtros
 */
const buscarSalones = asyncHandler(async (req, res) => {
  const criterios = {
    texto: req.query.q || req.query.texto,
    ciudad: req.query.ciudad,
    capacidadMinima: req.query.capacidadMinima,
    capacidadMaxima: req.query.capacidadMaxima,
    precioMin: req.query.precioMin,
    precioMax: req.query.precioMax,
    calificacion: req.query.calificacion,
    tipoEvento: req.query.tipoEvento,
    ordenarPor: req.query.ordenarPor,
    orden: req.query.orden
  };

  const paginacion = {
    page: req.query.page,
    limit: req.query.limit
  };

  const resultado = await busquedaService.buscarSalones(criterios, paginacion);

  res.success('Búsqueda realizada exitosamente', {
    salones: resultado.salones,
    pagination: resultado.pagination,
    filtros: resultado.filtrosAplicados
  });
});

/**
 * GET /busqueda/sugerencias
 * Sugerir salones basado en criterios básicos
 */
const sugerirSalones = asyncHandler(async (req, res) => {
  const criterios = {
    capacidad: req.query.capacidad,
    ciudad: req.query.ciudad,
    presupuesto: req.query.presupuesto
  };

  const sugerencias = await busquedaService.sugerirSalones(criterios);

  res.success('Sugerencias obtenidas', sugerencias);
});

/**
 * GET /busqueda/populares
 * Obtener salones más populares
 */
const getSalonesPopulares = asyncHandler(async (req, res) => {
  const limite = parseInt(req.query.limite) || 8;
  const salones = await busquedaService.getSalonesPopulares(limite);

  res.success('Salones populares obtenidos', salones);
});

/**
 * GET /busqueda/destacados
 * Obtener salones destacados
 */
const getSalonesDestacados = asyncHandler(async (req, res) => {
  const limite = parseInt(req.query.limite) || 6;
  const salones = await busquedaService.getSalonesDestacados(limite);

  res.success('Salones destacados obtenidos', salones);
});

/**
 * GET /busqueda/ubicacion
 * Búsqueda por ubicación geográfica
 */
const buscarPorUbicacion = asyncHandler(async (req, res) => {
  const { latitud, longitud } = req.query;

  if (!latitud || !longitud) {
    return res.badRequest('Latitud y longitud son requeridas');
  }

  const lat = parseFloat(latitud);
  const lng = parseFloat(longitud);

  // Validar coordenadas básicas para Bolivia
  if (lat < -22.8 || lat > -9.6 || lng < -69.6 || lng > -57.4) {
    return res.badRequest('Coordenadas fuera del rango de Bolivia');
  }

  const radioKm = parseInt(req.query.radio) || 10;
  const limite = parseInt(req.query.limite) || 20;

  const salones = await busquedaService.buscarPorUbicacion(lat, lng, radioKm, limite);

  res.success('Búsqueda por ubicación realizada', {
    salones,
    criterios: {
      latitud: lat,
      longitud: lng,
      radioKm,
      encontrados: salones.length
    }
  });
});

/**
 * GET /busqueda/filtros
 * Obtener opciones disponibles para filtros
 */
const getOpcionesFiltros = asyncHandler(async (req, res) => {
  const opciones = await busquedaService.getOpcionesFiltros();

  res.success('Opciones de filtros obtenidas', opciones);
});

/**
 * GET /busqueda/autocompletado
 * Autocompletado para búsqueda rápida
 */
const autocompletado = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 2) {
    return res.success('Autocompletado', []);
  }

  const limite = parseInt(req.query.limite) || 5;
  const sugerencias = await busquedaService.buscarAutocompletado(q, limite);

  res.success('Sugerencias de autocompletado', sugerencias);
});

/**
 * GET /busqueda/estadisticas
 * Estadísticas de búsqueda para el dashboard
 */
const getEstadisticasBusqueda = asyncHandler(async (req, res) => {
  const { Venue } = require('../modelos');

  const [totalSalones, porCiudad, porCapacidad, porPrecio] = await Promise.all([
    // Total de salones disponibles
    Venue.countDocuments({ estado: 'aprobado' }),

    // Distribución por ciudad
    Venue.aggregate([
      { $match: { estado: 'aprobado' } },
      { $group: { _id: '$ciudad', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),

    // Distribución por rangos de capacidad
    Venue.aggregate([
      { $match: { estado: 'aprobado' } },
      {
        $bucket: {
          groupBy: '$capacidadMaxima',
          boundaries: [0, 50, 100, 200, 500, 1000, 10000],
          default: 'Más de 1000',
          output: { count: { $sum: 1 } }
        }
      }
    ]),

    // Distribución por rangos de precio
    Venue.aggregate([
      { $match: { estado: 'aprobado' } },
      {
        $bucket: {
          groupBy: '$precioBase',
          boundaries: [0, 1000, 3000, 5000, 10000, 20000, 100000],
          default: 'Más de 20000',
          output: { count: { $sum: 1 } }
        }
      }
    ])
  ]);

  const estadisticas = {
    totalSalones,
    distribucion: {
      porCiudad: porCiudad.map(item => ({
        ciudad: item._id,
        cantidad: item.count
      })),
      porCapacidad: porCapacidad.map(item => ({
        rango: getRangoCapacidadLabel(item._id),
        cantidad: item.count
      })),
      porPrecio: porPrecio.map(item => ({
        rango: getRangoPrecioLabel(item._id),
        cantidad: item.count
      }))
    }
  };

  res.success('Estadísticas de búsqueda', estadisticas);
});

/**
 * POST /busqueda/busqueda-rapida
 * Búsqueda rápida con criterios simples
 */
const busquedaRapida = asyncHandler(async (req, res) => {
  const { texto, ciudad, capacidad, fecha } = req.body;

  // Construir criterios básicos
  const criterios = {};
  
  if (texto) criterios.texto = texto;
  if (ciudad) criterios.ciudad = ciudad;
  if (capacidad) {
    criterios.capacidadMinima = capacidad;
    criterios.capacidadMaxima = capacidad;
  }

  // Búsqueda simple con límite de resultados
  const resultado = await busquedaService.buscarSalones(criterios, { page: 1, limit: 6 });

  res.success('Búsqueda rápida realizada', {
    salones: resultado.salones,
    total: resultado.pagination.total,
    criterios: {
      texto: texto || null,
      ciudad: ciudad || null,
      capacidad: capacidad || null,
      fecha: fecha || null
    }
  });
});

/**
 * Funciones auxiliares para formatear etiquetas
 */
const getRangoCapacidadLabel = (valor) => {
  if (valor === 0) return 'Hasta 50';
  if (valor === 50) return '50-100';
  if (valor === 100) return '100-200';
  if (valor === 200) return '200-500';
  if (valor === 500) return '500-1000';
  if (valor === 1000) return 'Más de 1000';
  return 'Otro';
};

const getRangoPrecioLabel = (valor) => {
  if (valor === 0) return 'Hasta Bs. 1,000';
  if (valor === 1000) return 'Bs. 1,000-3,000';
  if (valor === 3000) return 'Bs. 3,000-5,000';
  if (valor === 5000) return 'Bs. 5,000-10,000';
  if (valor === 10000) return 'Bs. 10,000-20,000';
  if (valor === 20000) return 'Más de Bs. 20,000';
  return 'Otro';
};

module.exports = {
  buscarSalones,
  sugerirSalones,
  getSalonesPopulares,
  getSalonesDestacados,
  buscarPorUbicacion,
  getOpcionesFiltros,
  autocompletado,
  getEstadisticasBusqueda,
  busquedaRapida
};