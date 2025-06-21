/**
 * Validaciones para Búsqueda
 */

const { body, query, validationResult } = require('express-validator');
const { createError } = require('../middlewares/manejoErrores');

/**
 * Ciudades válidas en Bolivia
 */
const CIUDADES_VALIDAS = ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Potosí', 'Oruro'];

/**
 * Opciones válidas para ordenamiento
 */
const ORDENAMIENTO_VALIDO = [
  'relevancia', 'calificacion', 'precio', 'precio-desc', 
  'capacidad', 'capacidad-desc', 'nombre', 'fecha'
];

/**
 * Validaciones para búsqueda básica
 */
const validateBusquedaBasica = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Búsqueda debe tener entre 2 y 100 caracteres'),
    
  query('texto')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Texto de búsqueda debe tener entre 2 y 100 caracteres'),
    
  query('ciudad')
    .optional()
    .isIn(CIUDADES_VALIDAS)
    .withMessage(`Ciudad debe ser una de: ${CIUDADES_VALIDAS.join(', ')}`),
    
  query('capacidad')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacidad debe ser un número entre 1 y 10000'),
    
  query('presupuesto')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Presupuesto debe ser un número positivo')
];

/**
 * Validaciones para búsqueda avanzada
 */
const validateBusquedaAvanzada = [
  // Texto de búsqueda
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Búsqueda debe tener entre 2 y 100 caracteres'),
    
  query('texto')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Texto debe tener entre 2 y 100 caracteres'),
    
  // Filtros geográficos
  query('ciudad')
    .optional()
    .isIn(CIUDADES_VALIDAS)
    .withMessage(`Ciudad debe ser una de: ${CIUDADES_VALIDAS.join(', ')}`),
    
  // Filtros de capacidad
  query('capacidadMinima')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacidad mínima debe ser entre 1 y 10000'),
    
  query('capacidadMaxima')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacidad máxima debe ser entre 1 y 10000')
    .custom((value, { req }) => {
      if (req.query.capacidadMinima && value) {
        const min = parseInt(req.query.capacidadMinima);
        const max = parseInt(value);
        if (max < min) {
          throw new Error('Capacidad máxima debe ser mayor o igual a la mínima');
        }
      }
      return true;
    }),
    
  // Filtros de precio
  query('precioMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Precio mínimo debe ser un número positivo'),
    
  query('precioMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Precio máximo debe ser un número positivo')
    .custom((value, { req }) => {
      if (req.query.precioMin && value) {
        const min = parseFloat(req.query.precioMin);
        const max = parseFloat(value);
        if (max < min) {
          throw new Error('Precio máximo debe ser mayor o igual al mínimo');
        }
      }
      return true;
    }),
    
  // Filtros de calidad
  query('calificacion')
    .optional()
    .isFloat({ min: 1, max: 5 })
    .withMessage('Calificación debe ser entre 1 y 5'),
    
  // Ordenamiento
  query('ordenarPor')
    .optional()
    .isIn(ORDENAMIENTO_VALIDO)
    .withMessage(`Ordenar por debe ser: ${ORDENAMIENTO_VALIDO.join(', ')}`),
    
  query('orden')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Orden debe ser: asc o desc'),
    
  // Paginación
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
 * Validaciones para búsqueda por ubicación
 */
const validateUbicacion = [
  query('latitud')
    .isFloat({ min: -22.8, max: -9.6 })
    .withMessage('Latitud debe estar dentro del rango de Bolivia (-22.8 a -9.6)'),
    
  query('longitud')
    .isFloat({ min: -69.6, max: -57.4 })
    .withMessage('Longitud debe estar dentro del rango de Bolivia (-69.6 a -57.4)'),
    
  query('radio')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Radio debe ser entre 1 y 100 km'),
    
  query('limite')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Límite debe estar entre 1 y 50')
];

/**
 * Validaciones para autocompletado
 */
const validateAutocompletado = [
  query('q')
    .isLength({ min: 2, max: 50 })
    .withMessage('Consulta debe tener entre 2 y 50 caracteres')
    .trim(),
    
  query('limite')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Límite debe estar entre 1 y 10')
];

/**
 * Validaciones para búsqueda rápida
 */
const validateBusquedaRapida = [
  body('texto')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Texto debe tener entre 2 y 100 caracteres'),
    
  body('ciudad')
    .optional()
    .isIn(CIUDADES_VALIDAS)
    .withMessage(`Ciudad debe ser una de: ${CIUDADES_VALIDAS.join(', ')}`),
    
  body('capacidad')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Capacidad debe ser entre 1 y 10000'),
    
  body('fecha')
    .optional()
    .isISO8601()
    .withMessage('Fecha debe ser válida (formato ISO 8601)')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fecha < hoy) {
        throw new Error('La fecha no puede ser en el pasado');
      }
      
      return true;
    })
];

/**
 * Validaciones para filtros de precio personalizados
 */
const validateFiltrosPersonalizados = [
  body('filtros')
    .isObject()
    .withMessage('Filtros debe ser un objeto'),
    
  body('filtros.precioMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Precio mínimo debe ser positivo'),
    
  body('filtros.precioMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Precio máximo debe ser positivo'),
    
  body('filtros.capacidadMin')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacidad mínima debe ser positiva'),
    
  body('filtros.capacidadMax')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacidad máxima debe ser positiva'),
    
  body('filtros.servicios')
    .optional()
    .isArray()
    .withMessage('Servicios debe ser un array'),
    
  body('filtros.servicios.*')
    .optional()
    .isString()
    .withMessage('Cada servicio debe ser una cadena de texto')
];

/**
 * Validaciones para análisis de tendencias
 */
const validateAnalisisTendencias = [
  query('periodo')
    .optional()
    .isIn(['semana', 'mes', 'trimestre', 'año'])
    .withMessage('Periodo debe ser: semana, mes, trimestre o año'),
    
  query('metrica')
    .optional()
    .isIn(['busquedas', 'clicks', 'conversiones'])
    .withMessage('Métrica debe ser: busquedas, clicks o conversiones'),
    
  query('agrupacion')
    .optional()
    .isIn(['fecha', 'ciudad', 'categoria'])
    .withMessage('Agrupación debe ser: fecha, ciudad o categoria')
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
    
    throw createError('Errores de validación en búsqueda', 422, formattedErrors);
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
  validateBusquedaBasica: createValidator(validateBusquedaBasica),
  validateBusquedaAvanzada: createValidator(validateBusquedaAvanzada),
  validateUbicacion: createValidator(validateUbicacion),
  validateAutocompletado: createValidator(validateAutocompletado),
  validateBusquedaRapida: createValidator(validateBusquedaRapida),
  validateFiltrosPersonalizados: createValidator(validateFiltrosPersonalizados),
  validateAnalisisTendencias: createValidator(validateAnalisisTendencias),
  
  // Constantes útiles
  CIUDADES_VALIDAS,
  ORDENAMIENTO_VALIDO,
  
  // Middleware independiente
  handleValidationErrors
};