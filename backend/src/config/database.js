/**
 * Configuración y Conexión a MongoDB
 */

const mongoose = require('mongoose');
const { database } = require('./enviroment');
const { logger, logDatabase } = require('../utilidades/logs');

/**
 * Estado de conexión
 */
let isConnected = false;

/**
 * Conectar a MongoDB
 */
const connectDatabase = async () => {
  try {
    await mongoose.connect(database.uri);
    
    isConnected = true;
    logger.info(`Database connected: ${database.name}`);
    logDatabase('CONNECTION_SUCCESS', { database: database.name });
    
  } catch (error) {
    logger.error('Database connection failed:', { error: error.message });
    logDatabase('CONNECTION_ERROR', { error: error.message });
    
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
    
    throw error;
  }
};

/**
 * Desconectar de MongoDB
 */
const disconnectDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      isConnected = false;
      logger.info('Database disconnected');
      logDatabase('DISCONNECTION_SUCCESS');
    }
  } catch (error) {
    logger.error('Database disconnection error:', { error: error.message });
    logDatabase('DISCONNECTION_ERROR', { error: error.message });
  }
};

/**
 * Verificar estado de conexión
 */
const checkConnection = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      return { healthy: true, message: 'Connection healthy' };
    } else {
      return { healthy: false, message: 'No connection' };
    }
  } catch (error) {
    return { healthy: false, message: error.message };
  }
};

/**
 * Configurar eventos de conexión
 */
const setupConnectionEvents = () => {
  mongoose.connection.on('connected', () => {
    logger.info('Mongoose connected to MongoDB');
    isConnected = true;
  });
  
  mongoose.connection.on('error', (error) => {
    logger.error('Mongoose connection error:', { error: error.message });
    isConnected = false;
  });
  
  mongoose.connection.on('disconnected', () => {
    logger.info('Mongoose disconnected from MongoDB');
    isConnected = false;
  });
  
  mongoose.connection.on('reconnected', () => {
    logger.info('Mongoose reconnected to MongoDB');
    isConnected = true;
  });
  
  // Cierre limpio
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, closing database connection...');
    await disconnectDatabase();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, closing database connection...');
    await disconnectDatabase();
    process.exit(0);
  });
};

/**
 * Inicializar base de datos
 */
const initializeDatabase = async () => {
  setupConnectionEvents();
  await connectDatabase();
  return { connected: true };
};

module.exports = {
  initializeDatabase,
  connectDatabase,
  disconnectDatabase,
  checkConnection,
  mongoose,
  get isConnected() { return isConnected; }
};