/**
 * Rutas de Salones
 */

const express = require('express');
const salonController = require('../controladores/salonControlador');
const { 
  requireAuth, 
  requireProvider, 
  requireAdmin, 
} = require('../middlewares/autenticacion');
const {
  validateSalonCreation,
  validateSalonUpdate,
  validateSalonFilters,
  validateSalonId,
  validateSalonSlug,
  validateStatusChange
} = require('../validadores/salonValidador');
const { 
  uploadSalonPhotos, 
  processUploadedFiles 
} = require('../middlewares/subirArchivos');

const router = express.Router();

/**
 * Rutas públicas y específicas (van primero para evitar conflictos)
 */

// GET /salones/stats - Estadísticas (solo admin)
router.get('/stats', requireAuth, requireAdmin, salonController.getSalonStats);

// GET /salones/mis-salones - Mis salones (usuario autenticado)
router.get('/mis-salones', requireAuth, requireProvider, salonController.getMySalones);

// GET /salones/slug/:slug - Obtener salón por slug (URLs amigables)
router.get('/slug/:slug', validateSalonSlug, salonController.getSalonBySlug);

// GET /salones/propietario/:propietarioId - Salones de propietario específico (admin)
router.get('/propietario/:propietarioId',
  requireAuth,
  requireAdmin,
  salonController.getSalonesByPropietario
);

// GET /salones - Buscar salones con filtros (ruta pública)
router.get('/', validateSalonFilters, salonController.getSalones);

// POST /salones - Crear salón (solo proveedores)
router.post('/', 
  requireAuth, 
  requireProvider, 
  validateSalonCreation, 
  salonController.createSalon
);

/**
 * Rutas con parámetro :salonId
 * Estas van después de las rutas estáticas
 */

// GET /salones/:salonId - Obtener salón específico
router.get('/:salonId', validateSalonId, salonController.getSalonById);

// PUT /salones/:salonId - Actualizar salón
router.put('/:salonId', 
  requireAuth, 
  requireProvider,
  validateSalonId,
  validateSalonUpdate,
  salonController.updateSalon
);

// DELETE /salones/:salonId - Eliminar salón
router.delete('/:salonId',
  requireAuth,
  requireProvider,
  validateSalonId,
  salonController.deleteSalon
);

// POST /salones/:salonId/fotos - Subir fotos
router.post('/:salonId/fotos',
  requireAuth,
  requireProvider,
  validateSalonId,
  uploadSalonPhotos,
  processUploadedFiles,
  salonController.uploadPhotos
);

/**
 * Rutas solo para administradores
 */

// PUT /salones/:salonId/estado - Cambiar estado del salón
router.put('/:salonId/estado',
  requireAuth,
  requireAdmin,
  validateSalonId,
  validateStatusChange,
  salonController.changeSalonStatus
);

module.exports = router;