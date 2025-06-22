import { useAuthStore } from '@/stores/auth.store.js'
import * as authService from '@/services/auth.service.js'

export const useAuth = () => {
  const authStore = useAuthStore()

  // === LOGIN ===
  const login = async (credentials) => {
    authStore.setLoading(true)
    authStore.setError(null)
    
    try {
      const { user } = await authService.login(credentials)
      authStore.setUser(user)
      return user
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      authStore.setError(message)
      throw new Error(message)
    } finally {
      authStore.setLoading(false)
    }
  }

  // === REGISTRO ===
  const register = async (userData) => {
    authStore.setLoading(true)
    authStore.setError(null)
    
    try {
      const { user } = await authService.register(userData)
      authStore.setUser(user)
      return user
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrar usuario'
      authStore.setError(message)
      throw new Error(message)
    } finally {
      authStore.setLoading(false)
    }
  }

  // === LOGOUT ===
  const logout = async () => {
    authStore.setLoading(true)
    
    try {
      await authService.logout()
    } finally {
      authStore.clearAuth()
      authStore.setLoading(false)
    }
  }

  // === ACTUALIZAR PERFIL ===
  const updateProfile = async (userData) => {
    authStore.setLoading(true)
    authStore.setError(null)
    
    try {
      const updatedUser = await authService.updateProfile(userData)
      authStore.setUser(updatedUser)
      return updatedUser
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar perfil'
      authStore.setError(message)
      throw new Error(message)
    } finally {
      authStore.setLoading(false)
    }
  }

  // === CAMBIAR CONTRASEÑA ===
  const changePassword = async (passwordData) => {
    authStore.setLoading(true)
    authStore.setError(null)
    
    try {
      const result = await authService.changePassword(passwordData)
      return result
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cambiar contraseña'
      authStore.setError(message)
      throw new Error(message)
    } finally {
      authStore.setLoading(false)
    }
  }

  // === VERIFICAR TOKEN ===
  const verifyAuth = async () => {
    if (!authStore.isAuthenticated) return false
    
    try {
      const { user } = await authService.verifyToken()
      authStore.setUser(user)
      return true
    } catch (error) {
      authStore.clearAuth()
      return false
    }
  }

  return {
    // Estado del store
    user: authStore.user,
    loading: authStore.loading,
    error: authStore.error,
    isAuthenticated: authStore.isAuthenticated,
    isProveedor: authStore.isProveedor,
    isAdmin: authStore.isAdmin,
    isCliente: authStore.isCliente,
    
    // Acciones
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    verifyAuth,
    
    // Utilidades
    hasRole: authStore.hasRole,
    canAccess: authStore.canAccess
  }
}