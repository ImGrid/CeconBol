/**
 * Controlador de Autenticación
 * Maneja requests y responses para auth
 */

const authService = require('../servicios/authService');
const { asyncHandler } = require('../middlewares/manejoErrores');

/**
 * POST /auth/register
 * Registrar nuevo usuario
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  
  res.created('Usuario registrado exitosamente', result);
});

/**
 * POST /auth/login
 * Login de usuario
 */
const login = asyncHandler(async (req, res) => {
  const { email, contrasena } = req.body;
  const result = await authService.loginUser(email, contrasena);
  
  res.success('Login exitoso', result);
});

/**
 * GET /auth/profile
 * Obtener perfil del usuario autenticado
 */
const getProfile = asyncHandler(async (req, res) => {
  const profile = await authService.getUserProfile(req.user.id);
  
  res.success('Perfil obtenido', profile);
});

/**
 * PUT /auth/profile
 * Actualizar perfil del usuario
 */
const updateProfile = asyncHandler(async (req, res) => {
  const updatedProfile = await authService.updateUserProfile(req.user.id, req.body);
  
  res.success('Perfil actualizado', updatedProfile);
});

/**
 * PUT /auth/change-password
 * Cambiar contraseña
 */
const changePassword = asyncHandler(async (req, res) => {
  const { contrasenaActual, contrasenaNueva } = req.body;
  const result = await authService.changePassword(req.user.id, contrasenaActual, contrasenaNueva);
  
  res.success('Contraseña actualizada', result);
});

/**
 * POST /auth/refresh
 * Renovar access token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);
  
  res.success('Token renovado', result);
});

/**
 * POST /auth/logout
 * Logout de usuario
 */
const logout = asyncHandler(async (req, res) => {
  const result = await authService.logoutUser(req.user.id);
  
  res.success('Logout exitoso', result);
});

/**
 * GET /auth/verify
 * Verificar si el token es válido
 */
const verifyToken = asyncHandler(async (req, res) => {
  // Si llegamos aquí es porque el middleware de auth ya validó el token
  res.success('Token válido', {
    valid: true,
    user: req.user.getDatosPublicos()
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  verifyToken
};