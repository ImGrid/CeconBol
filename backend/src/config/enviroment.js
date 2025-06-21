/**
 * Configuración de Variables de Entorno
 */

require('dotenv').config();

/**
 * Obtener variable de entorno con validación básica
 */
const getEnvVar = (name, defaultValue = null) => {
  const value = process.env[name];
  
  if (!value && defaultValue === null) {
    throw new Error(`❌ Variable de entorno requerida: ${name}`);
  }
  
  return value || defaultValue;
};

/**
 * Configuración del servidor
 */
const server = {
  port: parseInt(getEnvVar('PORT', '5000')),
  env: getEnvVar('NODE_ENV', 'development'),
  isProduction: getEnvVar('NODE_ENV') === 'production',
  isDevelopment: getEnvVar('NODE_ENV') === 'development',
  frontendUrl: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),
  backendUrl: getEnvVar('BACKEND_URL', 'http://localhost:5000')
};

/**
 * Configuración de MongoDB
 */
const database = {
  uri: getEnvVar('MONGODB_URI'),
  name: 'ceconbol'
};

/**
 * Configuración de JWT
 */
const jwt = {
  secret: getEnvVar('JWT_SECRET'),
  expiresIn: getEnvVar('JWT_EXPIRES_IN', '7d')
};

/**
 * Validar configuración básica
 */
const validateConfig = () => {
  console.log('🔧 Validando configuración...');
  
  if (!database.uri) {
    throw new Error('❌ MONGODB_URI es requerida');
  }
  
  console.log('Configuración válida');
  console.log(`Entorno: ${server.env}`);
  console.log(`Puerto: ${server.port}`);
  console.log(`Base de datos: ${database.name}`);
};

// Validar al cargar
validateConfig();

module.exports = {
  server,
  database,
  jwt
};