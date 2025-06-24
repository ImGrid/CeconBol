import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store.js'
import { USER_ROLES } from '@/utils/constants.js'

/**
 * Composable simplificado para manejo de permisos
 */
export const usePermissions = () => {
  const authStore = useAuthStore()

  // === GETTERS BÁSICOS ===
  
  const user = computed(() => authStore.user)
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const userRole = computed(() => authStore.user?.rol)

  // === VERIFICACIONES DE ROL ===
  
  const isAdmin = computed(() => authStore.isAdmin)
  const isProveedor = computed(() => authStore.isProveedor)
  const isCliente = computed(() => authStore.isCliente)

  // === VERIFICACIONES BÁSICAS ===

  const hasRole = (roles) => {
    if (!isAuthenticated.value) return false
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    return allowedRoles.includes(userRole.value)
  }

  const isOwner = (resource) => {
    if (!isAuthenticated.value || !resource) return false
    
    const userId = user.value.id
    
    if (resource.propietario) {
      return resource.propietario === userId || resource.propietario.id === userId
    }
    
    if (resource.createdBy) {
      return resource.createdBy === userId || resource.createdBy.id === userId
    }
    
    if (resource.userId) {
      return resource.userId === userId
    }
    
    return false
  }

  const canEdit = (resource) => {
    return isAdmin.value || isOwner(resource)
  }

  const canDelete = (resource) => {
    return isAdmin.value || isOwner(resource)
  }

  // === PERMISOS ESPECÍFICOS SIMPLIFICADOS ===

  const salonPermissions = {
    canCreate: computed(() => isProveedor.value || isAdmin.value),
    canEdit: (salon) => isAdmin.value || isOwner(salon),
    canDelete: (salon) => isAdmin.value || isOwner(salon),
    canModerate: computed(() => isAdmin.value)
  }

  const consultaPermissions = {
    canCreate: computed(() => isAuthenticated.value),
    canRespond: (consulta) => {
      if (isAdmin.value) return true
      if (isProveedor.value) {
        return consulta.salon?.propietario === user.value.id
      }
      return false
    },
    canView: (consulta) => {
      if (isAdmin.value) return true
      if (isProveedor.value) {
        return consulta.salon?.propietario === user.value.id
      }
      return consulta.emailCliente === user.value.email
    }
  }

  const navigationPermissions = {
    showProveedorDashboard: computed(() => isProveedor.value || isAdmin.value),
    showAdminDashboard: computed(() => isAdmin.value),
    showMisSalones: computed(() => isProveedor.value || isAdmin.value)
  }

  // === UTILIDADES ===

  const getDefaultDashboard = () => {
    if (isAdmin.value) return '/admin/dashboard'
    if (isProveedor.value) return '/dashboard'
    return '/'
  }

  const requiresVerification = computed(() => {
    return isAuthenticated.value && !user.value?.emailVerificado
  })

  return {
    // Estado
    user,
    isAuthenticated,
    userRole,
    
    // Roles
    isAdmin,
    isProveedor,
    isCliente,
    
    // Verificaciones
    hasRole,
    isOwner,
    canEdit,
    canDelete,
    
    // Permisos específicos
    salonPermissions,
    consultaPermissions,
    navigationPermissions,
    
    // Utilidades
    getDefaultDashboard,
    requiresVerification
  }
}