/**
 * Servicio de Autenticación
 * Lógica de negocio para registro, login, etc.
 */

const { User } = require('../modelos');
const { generateAccessToken, generateRefreshToken } = require('../utilidades/encriptacion');
const { createError } = require('../middlewares/manejoErrores');
const { logAuth } = require('../utilidades/logs');

/**
 * Registrar nuevo usuario
 */
const registerUser = async (userData) => {
  const { email, contrasena, nombre, apellido, telefono, ciudad, rol } = userData;
  
  // Verificar si el email ya existe
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError('El email ya está registrado', 409);
  }
  
  // Crear usuario
  const user = new User({
    email,
    contrasena,
    nombre,
    apellido,
    telefono,
    ciudad,
    rol: rol || 'cliente' // Default a cliente
  });
  
  await user.save();
  
  // Log del registro
  logAuth('USER_REGISTERED', user, { rol: user.rol });
  
  // Generar tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  return {
    user: user.getDatosPublicos(),
    accessToken,
    refreshToken
  };
};

/**
 * Login de usuario
 */
const loginUser = async (email, contrasena) => {
  // Buscar usuario con contraseña
  const user = await User.findOne({ email }).select('+contrasena +activo');
  
  if (!user) {
    throw createError('Credenciales inválidas', 401);
  }
  
  // Verificar si está activo
  if (!user.activo) {
    throw createError('Cuenta desactivada', 401);
  }
  
  // Verificar contraseña
  const isPasswordValid = await user.comparePassword(contrasena);
  if (!isPasswordValid) {
    throw createError('Credenciales inválidas', 401);
  }
  
  // Actualizar último acceso
  user.ultimoAcceso = new Date();
  await user.save();
  
  // Log del login
  logAuth('USER_LOGIN', user);
  
  // Generar tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  
  return {
    user: user.getDatosPublicos(),
    accessToken,
    refreshToken
  };
};

/**
 * Obtener perfil del usuario autenticado
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }
  
  return user.getDatosPublicos();
};

/**
 * Actualizar perfil de usuario
 */
const updateUserProfile = async (userId, updateData) => {
  const { nombre, apellido, telefono, ciudad } = updateData;
  
  const user = await User.findById(userId);
  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }
  
  // Actualizar solo campos permitidos
  if (nombre !== undefined) user.nombre = nombre;
  if (apellido !== undefined) user.apellido = apellido;
  if (telefono !== undefined) user.telefono = telefono;
  if (ciudad !== undefined) user.ciudad = ciudad;
  
  await user.save();
  
  logAuth('PROFILE_UPDATED', user);
  
  return user.getDatosPublicos();
};

/**
 * Cambiar contraseña
 */
const changePassword = async (userId, contrasenaActual, contrasenaNueva) => {
  const user = await User.findById(userId).select('+contrasena');
  
  if (!user) {
    throw createError('Usuario no encontrado', 404);
  }
  
  // Verificar contraseña actual
  const isCurrentPasswordValid = await user.comparePassword(contrasenaActual);
  if (!isCurrentPasswordValid) {
    throw createError('Contraseña actual incorrecta', 400);
  }
  
  // Actualizar contraseña
  user.contrasena = contrasenaNueva;
  await user.save();
  
  logAuth('PASSWORD_CHANGED', user);
  
  return { message: 'Contraseña actualizada exitosamente' };
};

/**
 * Refresh token
 */
const refreshAccessToken = async (refreshToken) => {
  try {
    const { verifyToken } = require('../utilidades/encriptacion');
    const decoded = verifyToken(refreshToken);
    
    // Verificar que es un refresh token
    if (decoded.type !== 'refresh') {
      throw createError('Token inválido', 401);
    }
    
    // Buscar usuario
    const user = await User.findById(decoded.id);
    if (!user || !user.activo) {
      throw createError('Usuario no encontrado o inactivo', 401);
    }
    
    // Generar nuevo access token
    const newAccessToken = generateAccessToken(user);
    
    logAuth('TOKEN_REFRESHED', user);
    
    return {
      accessToken: newAccessToken,
      user: user.getDatosPublicos()
    };
    
  } catch (error) {
    throw createError('Token de refresh inválido', 401);
  }
};

/**
 * Logout (invalidar tokens - por ahora solo log)
 */
const logoutUser = async (userId) => {
  const user = await User.findById(userId);
  if (user) {
    logAuth('USER_LOGOUT', user);
  }
  
  // En una implementación real aquí se invalidarían los tokens
  // Por ahora solo retornamos éxito
  return { message: 'Logout exitoso' };
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changePassword,
  refreshAccessToken,
  logoutUser
};