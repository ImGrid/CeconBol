/**
 * Utilidades para Respuestas del API
 */

/**
 * Códigos de estado HTTP comunes
 */
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR: 500
};

/**
 * Respuesta de éxito
 */
const successResponse = (res, message, data = null, status = HTTP_STATUS.OK) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (data !== null) {
    response.data = data;
  }
  
  return res.status(status).json(response);
};

/**
 * Respuesta de error
 */
const errorResponse = (res, message, status = HTTP_STATUS.INTERNAL_ERROR, details = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };
  
  if (details) {
    response.details = details;
  }
  
  // En desarrollo, agregar stack trace si details es un Error
  if (process.env.NODE_ENV === 'development' && details instanceof Error) {
    response.stack = details.stack;
  }
  
  return res.status(status).json(response);
};

/**
 * Respuestas específicas comunes
 */
const createdResponse = (res, message, data) => {
  return successResponse(res, message, data, HTTP_STATUS.CREATED);
};

const notFoundResponse = (res, message = 'Recurso no encontrado') => {
  return errorResponse(res, message, HTTP_STATUS.NOT_FOUND);
};

const unauthorizedResponse = (res, message = 'No autorizado') => {
  return errorResponse(res, message, HTTP_STATUS.UNAUTHORIZED);
};

const forbiddenResponse = (res, message = 'Acceso prohibido') => {
  return errorResponse(res, message, HTTP_STATUS.FORBIDDEN);
};

const badRequestResponse = (res, message = 'Solicitud incorrecta', details = null) => {
  return errorResponse(res, message, HTTP_STATUS.BAD_REQUEST, details);
};

const conflictResponse = (res, message = 'El recurso ya existe') => {
  return errorResponse(res, message, HTTP_STATUS.CONFLICT);
};

const validationErrorResponse = (res, message = 'Error de validación', errors = []) => {
  return errorResponse(res, message, HTTP_STATUS.VALIDATION_ERROR, errors);
};

const internalErrorResponse = (res, message = 'Error interno del servidor', details = null) => {
  return errorResponse(res, message, HTTP_STATUS.INTERNAL_ERROR, details);
};

/**
 * Respuesta con paginación
 */
const paginatedResponse = (res, message, data, pagination) => {
  const response = {
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.page || 1,
      limit: pagination.limit || 10,
      total: pagination.total || 0,
      totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
    },
    timestamp: new Date().toISOString()
  };
  
  return res.status(HTTP_STATUS.OK).json(response);
};

/**
 * Middleware para agregar métodos de respuesta al objeto res
 */
const responseMiddleware = (req, res, next) => {
  res.success = (message, data, status) => successResponse(res, message, data, status);
  res.error = (message, status, details) => errorResponse(res, message, status, details);
  res.created = (message, data) => createdResponse(res, message, data);
  res.notFound = (message) => notFoundResponse(res, message);
  res.unauthorized = (message) => unauthorizedResponse(res, message);
  res.forbidden = (message) => forbiddenResponse(res, message);
  res.badRequest = (message, details) => badRequestResponse(res, message, details);
  res.conflict = (message) => conflictResponse(res, message);
  res.validationError = (message, errors) => validationErrorResponse(res, message, errors);
  res.internalError = (message, details) => internalErrorResponse(res, message, details);
  res.paginated = (message, data, pagination) => paginatedResponse(res, message, data, pagination);
  
  next();
};

module.exports = {
  // Funciones principales
  successResponse,
  errorResponse,
  
  // Respuestas específicas
  createdResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  conflictResponse,
  validationErrorResponse,
  internalErrorResponse,
  paginatedResponse,
  
  // Middleware
  responseMiddleware,
  
  // Constantes
  HTTP_STATUS
};