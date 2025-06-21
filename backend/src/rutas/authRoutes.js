/**
 * Rutas de Autenticación
 */

const express = require('express');
const authController = require('../controladores/authController');
const { requireAuth } = require('../middlewares/autenticacion');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validatePasswordChange
} = require('../validadores/validacion');

const router = express.Router();

/**
 * Rutas públicas (no requieren autenticación)
 */

// POST /auth/register - Registrar usuario
router.post('/register', validateUserRegistration, authController.register);

// POST /auth/login - Login
router.post('/login', validateUserLogin, authController.login);

// POST /auth/refresh - Renovar token
router.post('/refresh', authController.refreshToken);

/**
 * Rutas protegidas (requieren autenticación)
 */

// GET /auth/profile - Obtener perfil
router.get('/profile', requireAuth, authController.getProfile);

// PUT /auth/profile - Actualizar perfil
router.put('/profile', requireAuth, validateUserUpdate, authController.updateProfile);

// PUT /auth/change-password - Cambiar contraseña
router.put('/change-password', requireAuth, validatePasswordChange, authController.changePassword);

// GET /auth/verify - Verificar token
router.get('/verify', requireAuth, authController.verifyToken);

// POST /auth/logout - Logout
router.post('/logout', requireAuth, authController.logout);

module.exports = router;