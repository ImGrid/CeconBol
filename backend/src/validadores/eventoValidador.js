/**
 * Validaciones para Eventos
 */

const { body, param, query, validationResult } = require('express-validator');
const { createError } = require('../middlewares/manejoErrores');

/**
 * Estados válidos para eventos
 */
const ESTADOS_EVENTO_VALIDOS = ['confirmado', 'en_progreso', 'completado', 'cancelado'];

/**
 * Estados de pago válidos
 */
const ESTADOS_PAGO_VALIDOS = ['pendiente', 'parcial', 'completado', 'reembolsado'];

/**
 * Validaciones para crear evento desde consulta
 */
const validateEventoCreation = [
  param('consultaId')
    .isMongoId()
    .withMessage('ID de consulta inválido'),
    
  body('nombreEvento')
    .optional()
    .trim()
    .isLength({ min: 3, max: 150 })
    .withMessage('Nombre del evento debe tener entre 3 y 150 caracteres'),
    
  body('fechaEvento')
    .isISO8601()
    .withMessage('Fecha del evento inválida')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      if (fecha < hoy) {
        throw new Error('La fecha del evento no puede ser en el pasado');
      }
      
      // No permitir fechas muy lejanas (más de 2 años)
      const maxFecha = new Date();
      maxFecha.setFullYear(maxFecha.getFullYear() + 2);
      
      if (fecha > maxFecha) {
        throw new Error('La fecha del evento es muy lejana');
      }
      
      return true;
    }),
    
  body('horaInicio')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora de inicio inválida (formato HH:MM)'),
    
  body('horaFin')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora de fin inválida (formato HH:MM)')
    .custom((value, { req }) => {
      if (req.body.horaInicio && value) {
        const [inicioHora, inicioMin] = req.body.horaInicio.split(':').map(Number);
        const [finHora, finMin] = value.split(':').map(Number);
        
        const inicioMinutos = inicioHora * 60 + inicioMin;
        const finMinutos = finHora * 60 + finMin;
        
        if (finMinutos <= inicioMinutos) {
          throw new Error('La hora de fin debe ser posterior a la hora de inicio');
        }
        
        // Validar duración máxima (24 horas)
        if ((finMinutos - inicioMinutos) > (24 * 60)) {
          throw new Error('La duración del evento no puede exceder 24 horas');
        }
      }
      return true;
    }),
    
  body('numeroInvitados')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Número de invitados debe ser entre 1 y 10000'),
    
  body('montoTotal')
    .isFloat({ min: 1 })
    .withMessage('Monto total debe ser mayor a 0'),
    
  body('tasaComision')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tasa de comisión debe estar entre 0 y 100%'),
    
  body('requisitosEspeciales')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Requisitos especiales muy largos (máximo 1000 caracteres)'),
    
  body('notasInternas')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notas internas muy largas (máximo 500 caracteres)')
];

/**
 * Validaciones para actualizar estado del evento
 */
const validateEventoStatusUpdate = [
  body('estado')
    .isIn(ESTADOS_EVENTO_VALIDOS)
    .withMessage(`Estado debe ser uno de: ${ESTADOS_EVENTO_VALIDOS.join(', ')}`),
    
  body('motivoCancelacion')
    .optional()
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Motivo de cancelación debe tener entre 5 y 500 caracteres')
    .custom((value, { req }) => {
      if (req.body.estado === 'cancelado' && !value) {
        throw new Error('Motivo de cancelación es requerido para cancelar evento');
      }
      return true;
    }),
    
  body('notasInternas')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notas internas muy largas (máximo 500 caracteres)')
];

/**
 * Validaciones para filtros de eventos
 */
const validateEventoFilters = [
  query('estado')
    .optional()
    .isIn(ESTADOS_EVENTO_VALIDOS)
    .withMessage(`Estado debe ser uno de: ${ESTADOS_EVENTO_VALIDOS.join(', ')}`),
    
  query('estadoPago')
    .optional()
    .isIn(ESTADOS_PAGO_VALIDOS)
    .withMessage(`Estado de pago debe ser uno de: ${ESTADOS_PAGO_VALIDOS.join(', ')}`),
    
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
 * Validación para ID de evento
 */
const validateEventoId = [
  param('eventoId')
    .isMongoId()
    .withMessage('ID de evento inválido')
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
 * Validaciones para datos de pago
 */
const validatePagoData = [
  body('metodoPago')
    .isIn(['tarjeta_credito', 'transferencia', 'codigo_qr'])
    .withMessage('Método de pago inválido'),
    
  body('montoAbonar')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Monto a abonar debe ser mayor a 0'),
    
  body('numeroTarjeta')
    .optional()
    .matches(/^\d{13,19}$/)
    .withMessage('Número de tarjeta inválido')
    .custom((value, { req }) => {
      if (req.body.metodoPago === 'tarjeta_credito' && !value) {
        throw new Error('Número de tarjeta es requerido para pago con tarjeta');
      }
      return true;
    }),
    
  body('codigoSeguridad')
    .optional()
    .matches(/^\d{3,4}$/)
    .withMessage('Código de seguridad inválido')
    .custom((value, { req }) => {
      if (req.body.metodoPago === 'tarjeta_credito' && !value) {
        throw new Error('Código de seguridad es requerido para pago con tarjeta');
      }
      return true;
    }),
    
  body('fechaVencimiento')
    .optional()
    .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
    .withMessage('Fecha de vencimiento inválida (formato MM/YY)')
    .custom((value, { req }) => {
      if (req.body.metodoPago === 'tarjeta_credito' && !value) {
        throw new Error('Fecha de vencimiento es requerida para pago con tarjeta');
      }
      
      if (value) {
        const [mes, año] = value.split('/');
        const fechaVencimiento = new Date(2000 + parseInt(año), parseInt(mes) - 1);
        const hoy = new Date();
        hoy.setDate(1); // Primer día del mes actual
        
        if (fechaVencimiento < hoy) {
          throw new Error('La tarjeta está vencida');
        }
      }
      
      return true;
    }),
    
  body('nombreTitular')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre del titular debe tener entre 2 y 100 caracteres')
    .custom((value, { req }) => {
      if (req.body.metodoPago === 'tarjeta_credito' && !value) {
        throw new Error('Nombre del titular es requerido para pago con tarjeta');
      }
      return true;
    })
];

/**
 * Validaciones para cálculo de comisión
 */
const validateComisionCalculo = [
  body('montoTotal')
    .isFloat({ min: 1 })
    .withMessage('Monto total debe ser mayor a 0'),
    
  body('tasaComision')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Tasa de comisión debe estar entre 0 y 100%')
];

/**
 * Validaciones para disponibilidad de salón
 */
const validateDisponibilidad = [
  query('fechaEvento')
    .isISO8601()
    .withMessage('Fecha del evento es requerida y debe ser válida'),
    
  query('eventoId')
    .optional()
    .isMongoId()
    .withMessage('ID de evento inválido (para exclusión)')
];

/**
 * Validaciones para reportes de ingresos
 */
const validateReporteIngresos = [
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
        
        // Limitar rango a 2 años para performance
        const dosAños = 2 * 365 * 24 * 60 * 60 * 1000;
        if (fechaHasta.getTime() - fechaDesde.getTime() > dosAños) {
          throw new Error('El rango de fechas no puede exceder 2 años');
        }
      }
      return true;
    }),
    
  query('formato')
    .optional()
    .isIn(['json', 'csv', 'excel'])
    .withMessage('Formato debe ser: json, csv o excel')
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
  validateEventoCreation: createValidator(validateEventoCreation),
  validateEventoStatusUpdate: createValidator(validateEventoStatusUpdate),
  validateEventoFilters: createValidator(validateEventoFilters),
  validateEventoId: createValidator(validateEventoId),
  validateSalonIdParam: createValidator(validateSalonIdParam),
  validatePagoData: createValidator(validatePagoData),
  validateComisionCalculo: createValidator(validateComisionCalculo),
  validateDisponibilidad: createValidator(validateDisponibilidad),
  validateReporteIngresos: createValidator(validateReporteIngresos),
  
  // Constantes útiles
  ESTADOS_EVENTO_VALIDOS,
  ESTADOS_PAGO_VALIDOS,
  
  // Middleware independiente
  handleValidationErrors
};