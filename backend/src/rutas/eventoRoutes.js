/**
 * Rutas de Eventos
 */

const express = require('express');
const eventoController = require('../controladores/eventoControlador');
const { 
  requireAuth, 
  requireProvider, 
  requireAdmin,
  optionalAuth
} = require('../middlewares/autenticacion');
const {
  validateEventoCreation,
  validateEventoStatusUpdate,
  validateEventoId,
  validateSalonIdParam,
  validateEventoFilters,
  validatePagoData,
  validateComisionCalculo
} = require('../validadores/eventoValidador');

const router = express.Router();

/**
 * Rutas específicas (van primero para evitar conflictos)
 */

// GET /eventos/dashboard - Dashboard de eventos (proveedor)
router.get('/dashboard', 
  requireAuth, 
  requireProvider, 
  eventoController.getDashboard
);

// GET /eventos/mis-eventos - Eventos del proveedor
router.get('/mis-eventos', 
  requireAuth, 
  requireProvider, 
  validateEventoFilters,
  eventoController.getMisEventos
);

// GET /eventos/stats - Estadísticas de eventos
router.get('/stats', 
  requireAuth, 
  requireProvider, 
  eventoController.getEventoStats
);

// GET /eventos/reporte-ingresos - Reporte de ingresos
router.get('/reporte-ingresos', 
  requireAuth, 
  requireProvider, 
  eventoController.getReporteIngresos
);

// GET /eventos/proyeccion-ingresos - Proyección de ingresos
router.get('/proyeccion-ingresos', 
  requireAuth, 
  requireProvider, 
  eventoController.getProyeccionIngresos
);

// GET /eventos/comisiones - Comisiones pendientes (solo admin)
router.get('/comisiones', 
  requireAuth, 
  requireAdmin, 
  eventoController.getComisionesPendientes
);

// GET /eventos/configuracion-comisiones - Configuración comisiones (solo admin)
router.get('/configuracion-comisiones', 
  requireAuth, 
  requireAdmin, 
  eventoController.getConfiguracionComisiones
);

// POST /eventos/calcular-comision - Calcular comisión
router.post('/calcular-comision', 
  requireAuth, 
  requireProvider,
  validateComisionCalculo,
  eventoController.calcularComision
);

// GET /eventos/disponibilidad/:salonId - Verificar disponibilidad
router.get('/disponibilidad/:salonId',
  requireAuth,
  requireProvider,
  validateSalonIdParam,
  eventoController.verificarDisponibilidad
);

/**
 * Rutas de creación
 */

// POST /eventos/from-consulta/:consultaId - Crear evento desde consulta
router.post('/from-consulta/:consultaId',
  requireAuth,
  requireProvider,
  validateEventoCreation,
  eventoController.createEventoFromConsulta
);

/**
 * Rutas con parámetro :eventoId
 */

// GET /eventos/:eventoId - Obtener evento específico
router.get('/:eventoId',
  optionalAuth,
  validateEventoId,
  eventoController.getEventoById
);

// PUT /eventos/:eventoId/estado - Actualizar estado del evento
router.put('/:eventoId/estado',
  requireAuth,
  requireProvider,
  validateEventoId,
  validateEventoStatusUpdate,
  eventoController.updateEventoStatus
);

// POST /eventos/:eventoId/procesar-pago - Procesar pago del evento
router.post('/:eventoId/procesar-pago',
  requireAuth,
  requireProvider,
  validateEventoId,
  validatePagoData,
  eventoController.procesarPago
);

module.exports = router;