/**
 * Middleware de Autenticación
 */

const { verifyToken, extractTokenFromHeader } = require('../utilidades/encriptacion');
const { User } = require('../modelos');
const { createError } = require('./manejoErrores');

/**
 * Middleware para verificar autenticación
 */
const requireAuth = async (req, res, next) => {
  try {
    // Extraer token del header
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      throw createError('Token de acceso requerido', 401);
    }
    
    // Verificar token
    const decoded = verifyToken(token);
    
    // Buscar usuario en base de datos
    const user = await User.findById(decoded.id).select('+activo');
    
    if (!user) {
      throw createError('Usuario no encontrado', 401);
    }
    
    if (!user.activo) {
      throw createError('Cuenta desactivada', 401);
    }
    
    // Agregar usuario a request
    req.user = user;
    req.token = token;
    
    next();
    
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar rol específico
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError('Autenticación requerida', 401));
    }
    
    if (!roles.includes(req.user.rol)) {
      return next(createError('Permisos insuficientes', 403));
    }
    
    next();
  };
};

/**
 * Middleware para verificar que sea admin
 */
const requireAdmin = requireRole('admin');

/**
 * Middleware para verificar que sea proveedor
 */
const requireProvider = requireRole('proveedor', 'admin');

/**
 * Middleware para verificar que sea cliente o proveedor
 */
const requireClientOrProvider = requireRole('cliente', 'proveedor', 'admin');

/**
 * Middleware opcional de autenticación (no lanza error si no hay token)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id).select('+activo');
      
      if (user && user.activo) {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
    
  } catch (error) {
    // En autenticación opcional, ignoramos errores de token
    next();
  }
};

/**
 * Middleware para verificar propiedad de recurso
 */
const requireOwnership = (resourceField = 'propietario') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(createError('Autenticación requerida', 401));
    }
    
    // Admin puede acceder a todo
    if (req.user.rol === 'admin') {
      return next();
    }
    
    // Verificar en params (ej: /users/:userId)
    if (req.params.userId && req.params.userId === req.user.id.toString()) {
      return next();
    }
    
    // Verificar en el recurso cargado (se debe cargar antes en el controlador)
    if (req.resource && req.resource[resourceField]) {
      const ownerId = req.resource[resourceField].toString();
      if (ownerId === req.user.id.toString()) {
        return next();
      }
    }
    
    return next(createError('No tienes permisos para acceder a este recurso', 403));
  };
};

/**
 * Middleware para verificar email verificado
 */
const requireVerifiedEmail = (req, res, next) => {
  if (!req.user) {
    return next(createError('Autenticación requerida', 401));
  }
  
  if (!req.user.emailVerificado) {
    return next(createError('Email no verificado', 403));
  }
  
  next();
};

module.exports = {
  requireAuth,
  requireRole,
  requireAdmin,
  requireProvider,
  requireClientOrProvider,
  optionalAuth,
  requireOwnership,
  requireVerifiedEmail
};