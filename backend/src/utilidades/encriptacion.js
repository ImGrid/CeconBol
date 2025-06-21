/**
 * Utilidades de Encriptación y JWT
 */

const jwt = require('jsonwebtoken');
const { jwt: jwtConfig } = require('../config/enviroment');

/**
 * Generar token JWT
 */
const generateToken = (payload, options = {}) => {
  const defaultOptions = {
    expiresIn: jwtConfig.expiresIn,
    issuer: 'celebrabol-api'
  };
  
  const tokenOptions = { ...defaultOptions, ...options };
  
  return jwt.sign(payload, jwtConfig.secret, tokenOptions);
};

/**
 * Verificar token JWT
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtConfig.secret);
  } catch (error) {
    throw error; // El middleware de errores se encargará
  }
};

/**
 * Decodificar token sin verificar (para debugging)
 */
const decodeToken = (token) => {
  return jwt.decode(token, { complete: true });
};

/**
 * Generar token de acceso para usuario
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    rol: user.rol
  };
  
  return generateToken(payload);
};

/**
 * Generar token de refresh (más duración)
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id || user.id,
    type: 'refresh'
  };
  
  return generateToken(payload, { expiresIn: '30d' });
};

/**
 * Extraer token del header Authorization
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }
  
  // Formato: "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

/**
 * Verificar si el token está expirado
 */
const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    return decoded.payload.exp < currentTime;
  } catch (error) {
    return true; // Si no se puede decodificar, consideramos expirado
  }
};

/**
 * Obtener tiempo restante del token (en segundos)
 */
const getTokenExpirationTime = (token) => {
  try {
    const decoded = decodeToken(token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    return Math.max(0, decoded.payload.exp - currentTime);
  } catch (error) {
    return 0;
  }
};

/**
 * Crear payload básico para tokens
 */
const createTokenPayload = (user, additionalData = {}) => {
  return {
    id: user._id || user.id,
    email: user.email,
    rol: user.rol,
    ...additionalData
  };
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken,
  generateAccessToken,
  generateRefreshToken,
  extractTokenFromHeader,
  isTokenExpired,
  getTokenExpirationTime,
  createTokenPayload
};