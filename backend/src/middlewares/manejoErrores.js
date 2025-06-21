/**
 * Middleware de Manejo de Errores
 */

const { logger } = require('../utilidades/logs');
const { HTTP_STATUS } = require('../utilidades/responses');

/**
 * Manejo de errores de validación de Mongoose
 */
const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map(err => ({
    field: err.path,
    message: err.message,
    value: err.value
  }));
  
  return {
    message: 'Error de validación',
    details: errors,
    status: HTTP_STATUS.VALIDATION_ERROR
  };
};

/**
 * Manejo de errores de duplicado (E11000)
 */
const handleDuplicateError = (error) => {
  const field = Object.keys(error.keyValue)[0];
  const value = error.keyValue[field];
  
  return {
    message: `El ${field} '${value}' ya está en uso`,
    details: { field, value },
    status: HTTP_STATUS.CONFLICT
  };
};

/**
 * Manejo de errores de cast (ObjectId inválido)
 */
const handleCastError = (error) => {
  return {
    message: 'ID inválido',
    details: { field: error.path, value: error.value },
    status: HTTP_STATUS.BAD_REQUEST
  };
};

/**
 * Manejo de errores JWT
 */
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return {
      message: 'Token inválido',
      status: HTTP_STATUS.UNAUTHORIZED
    };
  }
  
  if (error.name === 'TokenExpiredError') {
    return {
      message: 'Token expirado',
      status: HTTP_STATUS.UNAUTHORIZED
    };
  }
  
  return {
    message: 'Error de autenticación',
    status: HTTP_STATUS.UNAUTHORIZED
  };
};

/**
 * Determinar tipo de error y formatear respuesta
 */
const determineErrorResponse = (error) => {
  // Error de validación de Mongoose
  if (error.name === 'ValidationError') {
    return handleValidationError(error);
  }
  
  // Error de duplicado
  if (error.code === 11000) {
    return handleDuplicateError(error);
  }
  
  // Error de cast (ObjectId inválido)
  if (error.name === 'CastError') {
    return handleCastError(error);
  }
  
  // Errores JWT
  if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
    return handleJWTError(error);
  }
  
  // Error personalizado con status
  if (error.statusCode || error.status) {
    return {
      message: error.message || 'Error del servidor',
      status: error.statusCode || error.status,
      details: error.details || null
    };
  }
  
  // Error genérico
  return {
    message: 'Error interno del servidor',
    status: HTTP_STATUS.INTERNAL_ERROR,
    details: process.env.NODE_ENV === 'development' ? error.message : null
  };
};

/**
 * Middleware principal de manejo de errores
 */
const errorHandler = (error, req, res, next) => {
  // Log del error
  logger.error('Error caught by middleware', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  // Determinar respuesta
  const errorResponse = determineErrorResponse(error);
  
  // Enviar respuesta
  return res.status(errorResponse.status).json({
    success: false,
    message: errorResponse.message,
    details: errorResponse.details,
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack 
    })
  });
};

/**
 * Middleware para rutas no encontradas
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  error.statusCode = HTTP_STATUS.NOT_FOUND;
  next(error);
};

/**
 * Wrapper para funciones async que pueden lanzar errores
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Crear error personalizado
 */
const createError = (message, statusCode = HTTP_STATUS.INTERNAL_ERROR, details = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createError
};