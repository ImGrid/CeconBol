/**
 * Validaciones para Reseñas
 */

const { body, param, query, validationResult } = require('express-validator');
const { createError } = require('../middlewares/manejoErrores');

/**
 * Estados válidos para reseñas
 */
const ESTADOS_RESENA_VALIDOS = ['pendiente', 'aprobado', 'rechazado'];

/**
 * Decisiones de moderación válidas
 */
const DECISIONES_MODERACION_VALIDAS = ['aprobado', 'rechazado'];

/**
 * Validaciones para crear reseña
 */
const validateResenaCreation = [
  body('evento')
    .isMongoId()
    .withMessage('ID de evento inválido'),
    
  body('nombreRevisor')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre del revisor debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombre solo puede contener letras'),
    
  body('emailRevisor')
    .isEmail()
    .withMessage('Email del revisor inválido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email muy largo'),
    
  // Calificaciones (1-5 estrellas)
  body('calificacionGeneral')
    .isInt({ min: 1, max: 5 })
    .withMessage('Calificación general debe ser entre 1 y 5 estrellas'),
    
  body('calificacionSalon')
    .isInt({ min: 1, max: 5 })
    .withMessage('Calificación del salón debe ser entre 1 y 5 estrellas'),
    
  body('calificacionServicio')
    .isInt({ min: 1, max: 5 })
    .withMessage('Calificación del servicio debe ser entre 1 y 5 estrellas'),
    
  body('calificacionValor')
    .isInt({ min: 1, max: 5 })
    .withMessage('Calificación del valor debe ser entre 1 y 5 estrellas'),
    
  // Comentarios
  body('titulo')
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage('Título debe tener entre 5 y 150 caracteres'),
    
  body('comentario')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comentario debe tener entre 10 y 1000 caracteres'),
    
  body('aspectosPositivos')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Aspectos positivos muy largos (máximo 500 caracteres)'),
    
  body('aspectosNegativos')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Aspectos negativos muy largos (máximo 500 caracteres)'),
    
  // Recomendación
  body('recomendaria')
    .isBoolean()
    .withMessage('Recomendación debe ser true o false'),
    
  // Validación de contenido ofensivo básica
  body('titulo')
    .custom((value) => {
      const palabrasOfensivas = ['idiota', 'estupido', 'mierda', 'basura'];
      const tituloLower = value.toLowerCase();
      
      for (const palabra of palabrasOfensivas) {
        if (tituloLower.includes(palabra)) {
          throw new Error('El título contiene lenguaje inapropiado');
        }
      }
      return true;
    }),
    
  body('comentario')
    .custom((value) => {
      const palabrasOfensivas = ['idiota', 'estupido', 'mierda', 'basura'];
      const comentarioLower = value.toLowerCase();
      
      for (const palabra of palabrasOfensivas) {
        if (comentarioLower.includes(palabra)) {
          throw new Error('El comentario contiene lenguaje inapropiado');
        }
      }
      return true;
    })
];

/**
 * Validaciones para filtros de reseñas
 */
const validateResenaFilters = [
  query('estado')
    .optional()
    .isIn(ESTADOS_RESENA_VALIDOS)
    .withMessage(`Estado debe ser uno de: ${ESTADOS_RESENA_VALIDOS.join(', ')}`),
    
  query('calificacionMinima')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Calificación mínima debe ser entre 1 y 5'),
    
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número positivo'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Límite debe estar entre 1 y 50')
];

/**
 * Validación para ID de reseña
 */
const validateResenaId = [
  param('resenaId')
    .isMongoId()
    .withMessage('ID de reseña inválido')
];

/**
 * Validación para ID de salón en parámetros
 */
const validateSalonIdParam = [
  param('salonId')
    .isMongoId()
    .withMessage('ID de salón inválido')
];

/**
 * Validación para ID de evento en parámetros
 */
const validateEventoIdParam = [
  param('eventoId')
    .isMongoId()
    .withMessage('ID de evento inválido')
];

/**
 * Validaciones para respuesta del proveedor
 */
const validateResenaResponse = [
  body('respuesta')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Respuesta debe tener entre 10 y 500 caracteres')
    .custom((value) => {
      // Validación básica de contenido profesional
      const palabrasOfensivas = ['idiota', 'estupido', 'mierda', 'basura'];
      const respuestaLower = value.toLowerCase();
      
      for (const palabra of palabrasOfensivas) {
        if (respuestaLower.includes(palabra)) {
          throw new Error('La respuesta contiene lenguaje inapropiado');
        }
      }
      
      // Verificar que la respuesta sea profesional (debe incluir agradecimiento o saludo)
      const esProfesional = /gracias|agradec|salud|apreci|disculp|lament/i.test(value);
      if (!esProfesional) {
        throw new Error('La respuesta debe mantener un tono profesional y cortés');
      }
      
      return true;
    })
];

/**
 * Validaciones para moderación de reseñas
 */
const validateResenaModeration = [
  body('decision')
    .isIn(DECISIONES_MODERACION_VALIDAS)
    .withMessage(`Decisión debe ser: ${DECISIONES_MODERACION_VALIDAS.join(' o ')}`),
    
  body('motivoRechazo')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Motivo de rechazo debe tener entre 5 y 200 caracteres')
    .custom((value, { req }) => {
      if (req.body.decision === 'rechazado' && !value) {
        throw new Error('Motivo de rechazo es obligatorio cuando se rechaza una reseña');
      }
      return true;
    })
];

/**
 * Validaciones para verificar elegibilidad
 */
const validateElegibilidad = [
  query('emailCliente')
    .isEmail()
    .withMessage('Email del cliente es requerido y debe ser válido')
    .normalizeEmail()
];

/**
 * Validaciones para búsqueda de reseñas
 */
const validateResenaSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Búsqueda debe tener entre 3 y 100 caracteres'),
    
  query('ordenarPor')
    .optional()
    .isIn(['fecha', 'calificacion', 'utilidad'])
    .withMessage('Ordenar por debe ser: fecha, calificacion o utilidad'),
    
  query('orden')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden debe ser: asc o desc')
];

/**
 * Validaciones para reportar reseña
 */
const validateReportarResena = [
  body('motivo')
    .isIn(['spam', 'ofensivo', 'falso', 'irrelevante', 'otro'])
    .withMessage('Motivo debe ser: spam, ofensivo, falso, irrelevante u otro'),
    
  body('descripcion')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Descripción muy larga (máximo 300 caracteres)')
    .custom((value, { req }) => {
      if (req.body.motivo === 'otro' && !value) {
        throw new Error('Descripción es obligatoria cuando el motivo es "otro"');
      }
      return true;
    })
];

/**
 * Validaciones para votación de utilidad
 */
const validateVotarUtilidad = [
  body('esUtil')
    .isBoolean()
    .withMessage('Voto de utilidad debe ser true o false')
];

/**
 * Middleware para procesar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));
    
    throw createError('Errores de validación', 422, formattedErrors);
  }
  
  next();
};

/**
 * Crear validador completo
 */
const createValidator = (rules) => {
  return [...rules, handleValidationErrors];
};

module.exports = {
  // Validadores completos
  validateResenaCreation: createValidator(validateResenaCreation),
  validateResenaFilters: createValidator(validateResenaFilters),
  validateResenaId: createValidator(validateResenaId),
  validateSalonIdParam: createValidator(validateSalonIdParam),
  validateEventoIdParam: createValidator(validateEventoIdParam),
  validateResenaResponse: createValidator(validateResenaResponse),
  validateResenaModeration: createValidator(validateResenaModeration),
  validateElegibilidad: createValidator(validateElegibilidad),
  validateResenaSearch: createValidator(validateResenaSearch),
  validateReportarResena: createValidator(validateReportarResena),
  validateVotarUtilidad: createValidator(validateVotarUtilidad),
  
  // Constantes útiles
  ESTADOS_RESENA_VALIDOS,
  DECISIONES_MODERACION_VALIDAS,
  
  // Middleware independiente
  handleValidationErrors
};