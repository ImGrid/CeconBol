import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  getUserData, 
  setUserData, 
  hasActiveSession, 
  clearSession 
} from '@/utils/storage.js'
import { USER_ROLES } from '@/utils/constants.js'

export const useAuthStore = defineStore('auth', () => {
  // === ESTADO ===
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // === GETTERS ===
  const isAuthenticated = computed(() => !!user.value)
  const isProveedor = computed(() => user.value?.rol === USER_ROLES.PROVEEDOR)
  const isAdmin = computed(() => user.value?.rol === USER_ROLES.ADMIN)
  const isCliente = computed(() => user.value?.rol === USER_ROLES.CLIENTE)

  // === ACCIONES ===
  
  // Inicializar desde localStorage
  const initializeAuth = () => {
    if (hasActiveSession()) {
      const userData = getUserData()
      if (userData) {
        user.value = userData
      }
    }
  }

  // Establecer usuario autenticado
  const setUser = (userData) => {
    user.value = userData
    setUserData(userData)
    error.value = null
  }

  // Limpiar sesión
  const clearAuth = () => {
    user.value = null
    clearSession()
    error.value = null
  }

  // Establecer estado de carga
  const setLoading = (isLoading) => {
    loading.value = isLoading
  }

  // Establecer error
  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  // Verificar si tiene rol específico
  const hasRole = (role) => {
    return user.value?.rol === role
  }

  // Verificar si puede acceder a una ruta
  const canAccess = (requiredRoles) => {
    if (!isAuthenticated.value) return false
    if (!requiredRoles || requiredRoles.length === 0) return true
    
    return requiredRoles.includes(user.value.rol)
  }

  return {
    // Estado
    user,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    isProveedor,
    isAdmin,
    isCliente,
    
    // Acciones
    initializeAuth,
    setUser,
    clearAuth,
    setLoading,
    setError,
    hasRole,
    canAccess
  }
})