const winston = require('winston');
const path = require('path');
const fs = require('fs');
const { server } = require('../config/enviroment');

/**
 * Crear directorio de logs
 */
const createLogsDir = () => {
  const logsDir = 'logs';
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
};

/**
 * Formato simple para desarrollo
 */
const simpleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let output = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (stack) output += `\n${stack}`;
    return output;
  })
);

/**
 * Formato para consola con colores
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} ${level}: ${message}`;
  })
);

/**
 * Crear y configurar logger
 */
const createLogger = () => {
  createLogsDir();
  
  const transports = [
    // Consola (siempre)
    new winston.transports.Console({
      level: server.isDevelopment ? 'debug' : 'info',
      format: consoleFormat
    }),
    
    // Archivo de errores
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: simpleFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 2
    }),
    
    // Archivo combinado
    new winston.transports.File({
      filename: 'logs/combined.log',
      level: 'info',
      format: simpleFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 2
    })
  ];
  
  return winston.createLogger({
    level: 'info',
    defaultMeta: { service: 'celebrabol-backend' },
    transports,
    exitOnError: false
  });
};

// Crear logger principal
const logger = createLogger();

/**
 * Log de eventos de autenticación
 */
const logAuth = (event, user, details = {}) => {
  logger.info(`AUTH: ${event}`, {
    userId: user.id || user._id,
    email: user.email,
    ...details
  });
};

/**
 * Log de errores con contexto
 */
const logError = (error, context = {}) => {
  logger.error('ERROR:', {
    message: error.message,
    stack: error.stack,
    ...context
  });
};

/**
 * Log de operaciones de base de datos
 */
const logDatabase = (operation, details = {}) => {
  logger.info(`DB: ${operation}`, details);
};

/**
 * Log de operaciones de negocio
 */
const logBusiness = (event, details = {}) => {
  logger.info(`BUSINESS: ${event}`, details);
};

/**
 * Middleware para logging de requests
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 400 ? 'warn' : 'info';
    
    logger[level](`HTTP: ${req.method} ${req.url} - ${status} (${duration}ms)`, {
      method: req.method,
      url: req.url,
      status,
      duration,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
};

module.exports = {
  logger,
  logAuth,
  logError,
  logDatabase,
  logBusiness,
  requestLogger
};