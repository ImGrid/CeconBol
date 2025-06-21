/**
 * Validaciones para Consultas
 */

const { body, param, query, validationResult } = require('express-validator');
const { createError } = require('../middlewares/manejoErrores');

/**
 * Estados válidos para consultas
 */
const ESTADOS_VALIDOS = ['nueva', 'contactado', 'cotizado', 'negociando', 'ganada', 'perdida'];

/**
 * Fuentes válidas
 */
const FUENTES_VALIDAS = ['sitio_web', 'referencia', 'redes_sociales', 'otro'];

/**
 * Tipos de mensaje válidos
 */
const TIPOS_MENSAJE_VALIDOS = ['mensaje', 'cotizacion', 'contrato'];

/**
 * Validaciones para crear consulta
 */
const validateConsultaCreation = [
  body('salon')
    .isMongoId()
    .withMessage('ID de salón inválido'),
    
  body('nombreCliente')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Nombre solo puede contener letras'),
    
  body('emailCliente')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage('Email muy largo'),
    
  body('telefonoCliente')
    .matches(/^\d{7,8}$/)
    .withMessage('Teléfono debe tener 7 u 8 dígitos'),
    
  body('tipoEvento')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Tipo de evento debe tener entre 3 y 100 caracteres'),
    
  body('tipoEventoId')
    .optional()
    .isMongoId()
    .withMessage('ID de tipo de evento inválido'),
    
  body('fechaPreferida')
    .isISO8601()
    .withMessage('Fecha preferida inválida')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fecha < hoy) {
        throw new Error('La fecha del evento no puede ser en el pasado');
      }
      
      // No permitir fechas muy lejanas (ej: más de 2 años)
      const maxFecha = new Date();
      maxFecha.setFullYear(maxFecha.getFullYear() + 2);
      
      if (fecha > maxFecha) {
        throw new Error('La fecha del evento es muy lejana');
      }
      
      return true;
    }),
    
  body('fechasAlternativas')
    .optional()
    .isArray({ max: 5 })
    .withMessage('Máximo 5 fechas alternativas')
    .custom((fechas) => {
      if (!Array.isArray(fechas)) return true;
      
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      for (const fecha of fechas) {
        const fechaObj = new Date(fecha);
        if (fechaObj < hoy) {
          throw new Error('Las fechas alternativas no pueden ser en el pasado');
        }
      }
      return true;
    }),
    
  body('numeroInvitados')
    .isInt({ min: 1, max: 10000 })
    .withMessage('Número de invitados debe ser entre 1 y 10000'),
    
  body('presupuestoEstimado')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Presupuesto estimado debe ser un número positivo'),
    
  body('mensaje')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Mensaje debe tener entre 10 y 1000 caracteres'),
    
  body('requisitosEspeciales')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Requisitos especiales muy largos'),
    
  body('fuente')
    .optional()
    .isIn(FUENTES_VALIDAS)
    .withMessage(`Fuente debe ser una de: ${FUENTES_VALIDAS.join(', ')}`)
];

/**
 * Validaciones para actualizar estado de consulta
 */
const validateConsultaStatusUpdate = [
  body('estado')
    .isIn(ESTADOS_VALIDOS)
    .withMessage(`Estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`),
    
  body('montoCotizado')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monto cotizado debe ser un número positivo'),
    
  body('montoFinal')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monto final debe ser un número positivo'),
    
  body('proximaFechaSeguimiento')
    .optional()
    .isISO8601()
    .withMessage('Fecha de seguimiento inválida')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      
      if (fecha < hoy) {
        throw new Error('La fecha de seguimiento no puede ser en el pasado');
      }
      
      return true;
    })
];

/**
 * Validaciones para agregar mensaje
 */
const validateAddMessage = [
  body('mensaje')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Mensaje debe tener entre 1 y 2000 caracteres'),
    
  body('tipoMensaje')
    .optional()
    .isIn(TIPOS_MENSAJE_VALIDOS)
    .withMessage(`Tipo de mensaje debe ser uno de: ${TIPOS_MENSAJE_VALIDOS.join(', ')}`)
];

/**
 * Validaciones para filtros de consultas
 */
const validateConsultaFilters = [
  query('estado')
    .optional()
    .isIn(ESTADOS_VALIDOS)
    .withMessage(`Estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`),
    
  query('fechaDesde')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde inválida'),
    
  query('fechaHasta')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta inválida')
    .custom((value, { req }) => {
      if (req.query.fechaDesde && value) {
        const fechaDesde = new Date(req.query.fechaDesde);
        const fechaHasta = new Date(value);
        
        if (fechaHasta < fechaDesde) {
          throw new Error('Fecha hasta debe ser posterior a fecha desde');
        }
      }
      return true;
    }),
    
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
 * Validación para ID de consulta
 */
const validateConsultaId = [
  param('consultaId')
    .isMongoId()
    .withMessage('ID de consulta inválido')
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
 * Validaciones para marcar mensajes como leídos
 */
const validateMarkAsRead = [
  body('mensajeIds')
    .optional()
    .isArray()
    .withMessage('IDs de mensajes debe ser un array')
    .custom((ids) => {
      if (!Array.isArray(ids)) return true;
      
      for (const id of ids) {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
          throw new Error('ID de mensaje inválido');
        }
      }
      return true;
    }),
    
  body('marcarTodos')
    .optional()
    .isBoolean()
    .withMessage('marcarTodos debe ser true o false')
];

/**
 * Validaciones específicas para proveedores
 */
const validateProviderAccess = [
  // Validaciones adicionales que solo aplican a proveedores
  body('tasaComision')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tasa de comisión debe estar entre 0 y 100%')
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
  validateConsultaCreation: createValidator(validateConsultaCreation),
  validateConsultaStatusUpdate: createValidator(validateConsultaStatusUpdate),
  validateAddMessage: createValidator(validateAddMessage),
  validateConsultaFilters: createValidator(validateConsultaFilters),
  validateConsultaId: createValidator(validateConsultaId),
  validateSalonIdParam: createValidator(validateSalonIdParam),
  validateMarkAsRead: createValidator(validateMarkAsRead),
  validateProviderAccess: createValidator(validateProviderAccess),
  
  // Constantes útiles
  ESTADOS_VALIDOS,
  FUENTES_VALIDAS,
  TIPOS_MENSAJE_VALIDOS,
  
  // Middleware independiente
  handleValidationErrors
};