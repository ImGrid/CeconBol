/**
 * Rutas de Consultas
 */
const express = require('express');
const consultaController = require('../controladores/consultaControlador');
const { 
  requireAuth, 
  requireProvider, 
  optionalAuth 
} = require('../middlewares/autenticacion');
const {
  validateConsultaCreation,
  validateConsultaStatusUpdate,
  validateAddMessage,
  validateConsultaFilters,
  validateConsultaId,
  validateSalonIdParam,
  validateMarkAsRead
} = require('../validadores/consultaValidador');

const router = express.Router();

/**
 * Rutas públicas
 */
// POST /consultas - Crear consulta (público)
router.post('/', validateConsultaCreation, consultaController.createConsulta);

/**
 * Rutas protegidas
 */
// GET /consultas/dashboard - Dashboard de proveedor
router.get('/dashboard', requireAuth, requireProvider, consultaController.getDashboard);

// GET /consultas/mis-consultas - Mis consultas
router.get('/mis-consultas', 
  requireAuth, 
  requireProvider, 
  validateConsultaFilters, 
  consultaController.getMisConsultas
);

// GET /consultas/stats - Estadísticas
router.get('/stats', requireAuth, requireProvider, consultaController.getConsultaStats);

// GET /consultas/salon/:salonId - Consultas por salón
router.get('/salon/:salonId',
  requireAuth,
  requireProvider,
  validateSalonIdParam,
  validateConsultaFilters,
  consultaController.getConsultasBySalon
);

// GET /consultas/:consultaId - Consulta específica
router.get('/:consultaId',
  optionalAuth,
  validateConsultaId,
  consultaController.getConsultaById
);

// PUT /consultas/:consultaId/estado - Actualizar estado
router.put('/:consultaId/estado',
  requireAuth,
  requireProvider,
  validateConsultaId,
  validateConsultaStatusUpdate,
  consultaController.updateConsultaStatus
);

// POST /consultas/:consultaId/mensajes - Agregar mensaje
router.post('/:consultaId/mensajes',
  requireAuth,
  validateConsultaId,
  validateAddMessage,
  consultaController.addMessage
);

// PUT /consultas/:consultaId/mensajes/leer - Marcar como leído
router.put('/:consultaId/mensajes/leer',
  requireAuth,
  requireProvider,
  validateConsultaId,
  validateMarkAsRead,
  consultaController.markMessagesAsRead
);

module.exports = router;