/**
 * Validaciones para Salones
 */

const { body, param, query, validationResult } = require('express-validator');
const { createError } = require('../middlewares/manejoErrores');

/**
 * Ciudades válidas (reutilizando de usuario)
 */
const CIUDADES_VALIDAS = ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Potosí', 'Oruro'];

/**
 * Estados válidos para salones
 */
const ESTADOS_VALIDOS = ['borrador', 'pendiente', 'aprobado', 'rechazado', 'suspendido'];

/**
 * Modelos de precio válidos
 */
const MODELOS_PRECIO_VALIDOS = ['fijo', 'por_persona', 'personalizado'];

/**
 * Validaciones para crear salón
 */
const validateSalonCreation = [
  body('nombre')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nombre debe tener entre 3 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/)
    .withMessage('Nombre contiene caracteres inválidos'),
    
  body('descripcion')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descripción debe tener entre 10 y 1000 caracteres'),
    
  body('direccion')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Dirección debe tener entre 10 y 200 caracteres'),
    
  body('ciudad')
    .isIn(CIUDADES_VALIDAS)
    .withMessage(`Ciudad debe ser una de: ${CIUDADES_VALIDAS.join(', ')}`),
    
  body('distrito')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Distrito muy largo'),
    
  body('capacidadMinima')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacidad mínima debe ser un número entre 1 y 10000'),
    
  body('capacidadMaxima')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacidad máxima debe ser un número entre 1 y 10000')
    .custom((value, { req }) => {
      if (parseInt(value) < parseInt(req.body.capacidadMinima)) {
        throw new Error('Capacidad máxima debe ser mayor o igual a la mínima');
      }
      return true;
    }),
    
  body('precioBase')
    .isFloat({ min: 0 })
    .withMessage('Precio base debe ser un número positivo'),
    
  body('modeloPrecio')
    .optional()
    .isIn(MODELOS_PRECIO_VALIDOS)
    .withMessage(`Modelo de precio debe ser: ${MODELOS_PRECIO_VALIDOS.join(', ')}`),
    
  body('telefonoContacto')
    .optional()
    .matches(/^\d{7,8}$/)
    .withMessage('Teléfono debe tener 7 u 8 dígitos'),
    
  body('whatsapp')
    .optional()
    .matches(/^\d{7,8}$/)
    .withMessage('WhatsApp debe tener 7 u 8 dígitos'),
    
  body('emailContacto')
    .optional()
    .isEmail()
    .withMessage('Email de contacto inválido')
    .normalizeEmail(),
    
  // Coordenadas opcionales
  body('coordenadas.latitud')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud debe estar entre -90 y 90'),
    
  body('coordenadas.longitud')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud debe estar entre -180 y 180')
];

/**
 * Validaciones para actualizar salón (campos opcionales)
 */
const validateSalonUpdate = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Nombre debe tener entre 3 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-\.]+$/)
    .withMessage('Nombre contiene caracteres inválidos'),
    
  body('descripcion')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descripción debe tener entre 10 y 1000 caracteres'),
    
  body('direccion')
    .optional()
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Dirección debe tener entre 10 y 200 caracteres'),
    
  body('ciudad')
    .optional()
    .isIn(CIUDADES_VALIDAS)
    .withMessage(`Ciudad debe ser una de: ${CIUDADES_VALIDAS.join(', ')}`),
    
  body('distrito')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Distrito muy largo'),
    
  body('capacidadMinima')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacidad mínima debe ser un número entre 1 y 10000'),
    
  body('capacidadMaxima')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacidad máxima debe ser un número entre 1 y 10000'),
    
  body('precioBase')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Precio base debe ser un número positivo'),
    
  body('modeloPrecio')
    .optional()
    .isIn(MODELOS_PRECIO_VALIDOS)
    .withMessage(`Modelo de precio debe ser: ${MODELOS_PRECIO_VALIDOS.join(', ')}`),
    
  body('telefonoContacto')
    .optional()
    .custom((value) => {
      if (value === '') return true; // Permitir vacío para remover
      if (!value.match(/^\d{7,8}$/)) {
        throw new Error('Teléfono debe tener 7 u 8 dígitos');
      }
      return true;
    }),
    
  body('whatsapp')
    .optional()
    .custom((value) => {
      if (value === '') return true; // Permitir vacío para remover
      if (!value.match(/^\d{7,8}$/)) {
        throw new Error('WhatsApp debe tener 7 u 8 dígitos');
      }
      return true;
    }),
    
  body('emailContacto')
    .optional()
    .custom((value) => {
      if (value === '') return true; // Permitir vacío para remover
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        throw new Error('Email de contacto inválido');
      }
      return true;
    })
    .normalizeEmail(),
    
  // No permitir cambiar propietario por seguridad
  body('propietario')
    .optional()
    .custom(() => {
      throw new Error('No se puede cambiar el propietario');
    })
];

/**
 * Validaciones para filtros de búsqueda
 */
const validateSalonFilters = [
  query('ciudad')
    .optional()
    .isIn(CIUDADES_VALIDAS)
    .withMessage(`Ciudad debe ser una de: ${CIUDADES_VALIDAS.join(', ')}`),
    
  query('capacidadMinima')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacidad mínima debe ser un número positivo'),
    
  query('precioMaximo')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Precio máximo debe ser un número positivo'),
    
  query('estado')
    .optional()
    .isIn(ESTADOS_VALIDOS)
    .withMessage(`Estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`),
    
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página debe ser un número positivo'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Límite debe estar entre 1 y 50'),
    
  query('search')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Búsqueda debe tener entre 3 y 100 caracteres')
];

/**
 * Validación para ID de salón
 */
const validateSalonId = [
  param('salonId')
    .isMongoId()
    .withMessage('ID de salón inválido')
];

/**
 * Validación para slug de salón
 */
const validateSalonSlug = [
  param('slug')
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Slug inválido')
    .matches(/^[a-z0-9\-]+$/)
    .withMessage('Slug debe contener solo letras minúsculas, números y guiones')
];

/**
 * Validación para cambio de estado (solo admin)
 */
const validateStatusChange = [
  body('estado')
    .isIn(ESTADOS_VALIDOS)
    .withMessage(`Estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`)
];

/**
 * Validación para fotos
 */
const validatePhotoData = [
  body('fotos')
    .optional()
    .isArray({ min: 1, max: 10 })
    .withMessage('Debe haber entre 1 y 10 fotos'),
    
  body('fotos.*.textoAlternativo')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Texto alternativo muy largo'),
    
  body('fotos.*.esPrincipal')
    .optional()
    .isBoolean()
    .withMessage('esPrincipal debe ser true o false')
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
  validateSalonCreation: createValidator(validateSalonCreation),
  validateSalonUpdate: createValidator(validateSalonUpdate),
  validateSalonFilters: createValidator(validateSalonFilters),
  validateSalonId: createValidator(validateSalonId),
  validateSalonSlug: createValidator(validateSalonSlug),
  validateStatusChange: createValidator(validateStatusChange),
  validatePhotoData: createValidator(validatePhotoData),
  
  // Constantes útiles
  CIUDADES_VALIDAS,
  ESTADOS_VALIDOS,
  MODELOS_PRECIO_VALIDOS,
  
  // Middleware independiente
  handleValidationErrors
};