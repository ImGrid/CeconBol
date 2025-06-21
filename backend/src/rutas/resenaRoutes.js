/**
 * Rutas de Reseñas
 */

const express = require('express');
const resenaController = require('../controladores/resenaControlador');
const { 
  requireAuth, 
  requireProvider, 
  requireAdmin,
  optionalAuth
} = require('../middlewares/autenticacion');
const {
  validateResenaCreation,
  validateResenaId,
  validateSalonIdParam,
  validateResenaFilters,
  validateResenaResponse,
  validateResenaModeration,
  validateEventoIdParam
} = require('../validadores/resenaValidador');

const router = express.Router();

/**
 * Rutas específicas (van primero para evitar conflictos)
 */

// GET /resenas/dashboard - Dashboard de reseñas (proveedor)
router.get('/dashboard', 
  requireAuth, 
  requireProvider, 
  resenaController.getDashboard
);

// GET /resenas/mis-resenas - Reseñas del proveedor
router.get('/mis-resenas', 
  requireAuth, 
  requireProvider, 
  validateResenaFilters,
  resenaController.getMisResenas
);

// GET /resenas/stats - Estadísticas de reseñas
router.get('/stats', 
  requireAuth, 
  requireProvider, 
  resenaController.getEstadisticasResenas
);

// GET /resenas/pendientes - Reseñas pendientes de moderación (solo admin)
router.get('/pendientes', 
  requireAuth, 
  requireAdmin, 
  resenaController.getResenasPendientes
);

// GET /resenas/verificar-eligibilidad/:eventoId - Verificar elegibilidad
router.get('/verificar-eligibilidad/:eventoId',
  validateEventoIdParam,
  resenaController.verificarElegibilidad
);

// GET /resenas/salon/:salonId - Reseñas de un salón (público)
router.get('/salon/:salonId',
  validateSalonIdParam,
  validateResenaFilters,
  resenaController.getResenasSalon
);

/**
 * Rutas de creación
 */

// POST /resenas - Crear nueva reseña (público)
router.post('/',
  validateResenaCreation,
  resenaController.createResena
);

/**
 * Rutas con parámetro :resenaId
 */

// GET /resenas/:resenaId - Obtener reseña específica
router.get('/:resenaId',
  optionalAuth,
  validateResenaId,
  resenaController.getResenaById
);

// POST /resenas/:resenaId/responder - Responder a reseña (proveedor)
router.post('/:resenaId/responder',
  requireAuth,
  requireProvider,
  validateResenaId,
  validateResenaResponse,
  resenaController.responderResena
);

// PUT /resenas/:resenaId/moderar - Moderar reseña (solo admin)
router.put('/:resenaId/moderar',
  requireAuth,
  requireAdmin,
  validateResenaId,
  validateResenaModeration,
  resenaController.moderarResena
);

module.exports = router;