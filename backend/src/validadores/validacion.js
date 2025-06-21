/**
 * Validaciones para Usuario
 */

const { body, param, validationResult } = require('express-validator');
const { createError } = require('../middlewares/manejoErrores');

/**
 * Ciudades válidas en Bolivia
 */
const CIUDADES_VALIDAS = ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Potosí', 'Oruro'];

/**
 * Roles válidos
 */
const ROLES_VALIDOS = ['cliente', 'proveedor', 'admin'];

/**
 * Validaciones para registro de usuario
 */
const validateUserRegistration = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email muy largo'),
    
  body('contrasena')
    .isLength({ min: 6, max: 50 })
    .withMessage('Contraseña debe tener entre 6 y 50 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Contraseña debe contener al menos una minúscula, una mayúscula y un número'),
    
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombre solo puede contener letras'),
    
  body('apellido')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Apellido solo puede contener letras'),
    
  body('telefono')
    .optional()
    .matches(/^\d{7,8}$/)
    .withMessage('Teléfono debe tener 7 u 8 dígitos'),
    
  body('ciudad')
    .isIn(CIUDADES_VALIDAS)
    .withMessage(`Ciudad debe ser una de: ${CIUDADES_VALIDAS.join(', ')}`),
    
  body('rol')
    .optional()
    .isIn(ROLES_VALIDOS)
    .withMessage(`Rol debe ser uno de: ${ROLES_VALIDOS.join(', ')}`)
];

/**
 * Validaciones para login
 */
const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
    
  body('contrasena')
    .notEmpty()
    .withMessage('Contraseña es requerida')
];

/**
 * Validaciones para actualización de perfil
 */
const validateUserUpdate = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombre solo puede contener letras'),
    
  body('apellido')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Apellido debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Apellido solo puede contener letras'),
    
  body('telefono')
    .optional()
    .custom((value) => {
      if (value === '') return true; // Permitir string vacío para remover teléfono
      if (!value.match(/^\d{7,8}$/)) {
        throw new Error('Teléfono debe tener 7 u 8 dígitos');
      }
      return true;
    }),
    
  body('ciudad')
    .optional()
    .isIn(CIUDADES_VALIDAS)
    .withMessage(`Ciudad debe ser una de: ${CIUDADES_VALIDAS.join(', ')}`),
    
  // No permitir cambiar email o rol por seguridad
  body('email')
    .optional()
    .custom(() => {
      throw new Error('No se puede cambiar el email');
    }),
    
  body('rol')
    .optional()
    .custom(() => {
      throw new Error('No se puede cambiar el rol');
    })
];

/**
 * Validaciones para cambio de contraseña
 */
const validatePasswordChange = [
  body('contrasenaActual')
    .notEmpty()
    .withMessage('Contraseña actual es requerida'),
    
  body('contrasenaNueva')
    .isLength({ min: 6, max: 50 })
    .withMessage('Nueva contraseña debe tener entre 6 y 50 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nueva contraseña debe contener al menos una minúscula, una mayúscula y un número'),
    
  body('confirmarContrasena')
    .custom((value, { req }) => {
      if (value !== req.body.contrasenaNueva) {
        throw new Error('Las contraseñas no coinciden');
      }
      return true;
    })
];

/**
 * Validación para ID de usuario en parámetros
 */
const validateUserId = [
  param('userId')
    .isMongoId()
    .withMessage('ID de usuario inválido')
];

/**
 * Validación para email en parámetros (verificación, etc.)
 */
const validateEmailParam = [
  param('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
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
 * Validador completo que incluye manejo de errores
 */
const createValidator = (rules) => {
  return [...rules, handleValidationErrors];
};

module.exports = {
  // Validadores completos (incluyen manejo de errores)
  validateUserRegistration: createValidator(validateUserRegistration),
  validateUserLogin: createValidator(validateUserLogin),
  validateUserUpdate: createValidator(validateUserUpdate),
  validatePasswordChange: createValidator(validatePasswordChange),
  validateUserId: createValidator(validateUserId),
  validateEmailParam: createValidator(validateEmailParam),
  
  // Constantes útiles
  CIUDADES_VALIDAS,
  ROLES_VALIDOS,
  
  // Middleware independiente
  handleValidationErrors
};