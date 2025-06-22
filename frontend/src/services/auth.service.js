import { get, post, put } from '@/services/api.js'
import { API_ENDPOINTS } from '@/utils/constants.js'
import { 
  setAccessToken, 
  setRefreshToken,
  setUserData,
  clearSession 
} from '@/utils/storage.js'

// === AUTENTICACIÓN ===

export const login = async (credentials) => {
  try {
    const response = await post(API_ENDPOINTS.AUTH.LOGIN, credentials)
    const { user, accessToken, refreshToken } = response.data.data
    
    // Guardar tokens y datos del usuario
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    setUserData(user)
    
    return { user, accessToken }
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export const register = async (userData) => {
  try {
    const response = await post(API_ENDPOINTS.AUTH.REGISTER, userData)
    const { user, accessToken, refreshToken } = response.data.data
    
    // Guardar tokens y datos del usuario
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    setUserData(user)
    
    return { user, accessToken }
  } catch (error) {
    console.error('Register error:', error)
    throw error
  }
}

export const logout = async () => {
  try {
    await post(API_ENDPOINTS.AUTH.LOGOUT)
  } catch (error) {
    console.error('Logout error:', error)
    // Continuar con logout local aunque falle el servidor
  } finally {
    clearSession()
  }
}

// === PERFIL ===

export const getProfile = async () => {
  try {
    const response = await get(API_ENDPOINTS.AUTH.PROFILE)
    return response.data.data
  } catch (error) {
    console.error('Get profile error:', error)
    throw error
  }
}

export const updateProfile = async (userData) => {
  try {
    const response = await put(API_ENDPOINTS.AUTH.PROFILE, userData)
    const updatedUser = response.data.data
    
    // Actualizar datos locales
    setUserData(updatedUser)
    
    return updatedUser
  } catch (error) {
    console.error('Update profile error:', error)
    throw error
  }
}

export const changePassword = async (passwordData) => {
  try {
    const response = await put(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData)
    return response.data.data
  } catch (error) {
    console.error('Change password error:', error)
    throw error
  }
}

// === VERIFICACIÓN ===

export const verifyToken = async () => {
  try {
    const response = await get(API_ENDPOINTS.AUTH.VERIFY)
    return response.data.data
  } catch (error) {
    console.error('Verify token error:', error)
    throw error
  }
}