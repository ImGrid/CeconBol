/**
 * Rutas de Búsqueda
 * Endpoints para búsquedas avanzadas y filtros
 */

const express = require('express');
const busquedaController = require('../controladores/busquedaControlador');
const { 
  requireAuth, 
  requireAdmin,
  optionalAuth 
} = require('../middlewares/autenticacion');
const {
  validateBusquedaBasica,
  validateBusquedaAvanzada,
  validateUbicacion,
  validateAutocompletado,
  validateBusquedaRapida
} = require('../validadores/busquedaValidador');

const router = express.Router();

/**
 * Rutas públicas de búsqueda
 */

// GET /busqueda/salones - Búsqueda principal de salones
router.get('/salones',
  validateBusquedaAvanzada,
  busquedaController.buscarSalones
);

// GET /busqueda/sugerencias - Sugerir salones
router.get('/sugerencias',
  validateBusquedaBasica,
  busquedaController.sugerirSalones
);

// GET /busqueda/populares - Salones más populares
router.get('/populares',
  busquedaController.getSalonesPopulares
);

// GET /busqueda/destacados - Salones destacados
router.get('/destacados',
  busquedaController.getSalonesDestacados
);

// GET /busqueda/ubicacion - Búsqueda por ubicación
router.get('/ubicacion',
  validateUbicacion,
  busquedaController.buscarPorUbicacion
);

// GET /busqueda/filtros - Opciones de filtros disponibles
router.get('/filtros',
  busquedaController.getOpcionesFiltros
);

// GET /busqueda/autocompletado - Autocompletado de búsqueda
router.get('/autocompletado',
  validateAutocompletado,
  busquedaController.autocompletado
);

// GET /busqueda/estadisticas - Estadísticas públicas
router.get('/estadisticas',
  busquedaController.getEstadisticasBusqueda
);

// POST /busqueda/busqueda-rapida - Búsqueda rápida
router.post('/busqueda-rapida',
  validateBusquedaRapida,
  busquedaController.busquedaRapida
);

module.exports = router;