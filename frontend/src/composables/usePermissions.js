import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store.js'
import { USER_ROLES } from '@/utils/constants.js'

/**
 * Composable para manejo de permisos y acceso por roles
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

  // === VERIFICACIONES DE PERMISOS ===

  /**
   * Verifica si el usuario tiene uno de los roles especificados
   */
  const hasRole = (roles) => {
    if (!isAuthenticated.value) return false
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    return allowedRoles.includes(userRole.value)
  }

  /**
   * Verifica si el usuario puede acceder a una funcionalidad
   */
  const canAccess = (permission) => {
    if (!isAuthenticated.value) return false

    const permissions = {
      // === SALONES ===
      'salones.create': [USER_ROLES.PROVEEDOR, USER_ROLES.ADMIN],
      'salones.edit': [USER_ROLES.PROVEEDOR, USER_ROLES.ADMIN],
      'salones.delete': [USER_ROLES.PROVEEDOR, USER_ROLES.ADMIN],
      'salones.moderate': [USER_ROLES.ADMIN],
      'salones.view_all': [USER_ROLES.ADMIN],
      
      // === CONSULTAS ===
      'consultas.create': [USER_ROLES.CLIENTE, USER_ROLES.PROVEEDOR, USER_ROLES.ADMIN],
      'consultas.respond': [USER_ROLES.PROVEEDOR, USER_ROLES.ADMIN],
      'consultas.view_own': [USER_ROLES.PROVEEDOR, USER_ROLES.ADMIN],
      'consultas.moderate': [USER_ROLES.ADMIN],
      
      // === EVENTOS ===
      'eventos.create': [USER_ROLES.PROVEEDOR, USER_ROLES.ADMIN],
      'eventos.manage': [USER_ROLES.PROVEEDOR, USER_ROLES.ADMIN],
      'eventos.view_all': [USER_ROLES.ADMIN],
      
      // === RESEÑAS ===
      'resenas.create': [USER_ROLES.CLIENTE, USER_ROLES.PROVEEDOR, USER_ROLES.ADMIN],
      'resenas.respond': [USER_ROLES.PROVEEDOR, USER_ROLES.ADMIN],
      'resenas.moderate': [USER_ROLES.ADMIN],
      
      // === DASHBOARD ===
      'dashboard.proveedor': [USER_ROLES.PROVEEDOR, USER_ROLES.ADMIN],
      'dashboard.admin': [USER_ROLES.ADMIN],
      
      // === USUARIOS ===
      'users.manage': [USER_ROLES.ADMIN],
      'users.view_all': [USER_ROLES.ADMIN],
      
      // === REPORTES ===
      'reports.view': [USER_ROLES.ADMIN],
      'reports.financial': [USER_ROLES.ADMIN]
    }

    const allowedRoles = permissions[permission]
    if (!allowedRoles) return false

    return allowedRoles.includes(userRole.value)
  }

  /**
   * Verifica si el usuario es propietario de un recurso
   */
  const isOwner = (resource) => {
    if (!isAuthenticated.value || !resource) return false
    
    // Diferentes formas de verificar propiedad según el tipo de recurso
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

  /**
   * Verifica si puede editar un recurso (propietario o admin)
   */
  const canEdit = (resource) => {
    return isAdmin.value || isOwner(resource)
  }

  /**
   * Verifica si puede eliminar un recurso
   */
  const canDelete = (resource) => {
    return isAdmin.value || isOwner(resource)
  }

  // === VERIFICACIONES ESPECÍFICAS POR MÓDULO ===

  /**
   * Permisos específicos para salones
   */
  const salonPermissions = {
    canCreate: computed(() => canAccess('salones.create')),
    canEdit: (salon) => canAccess('salones.edit') && (isAdmin.value || isOwner(salon)),
    canDelete: (salon) => canAccess('salones.delete') && (isAdmin.value || isOwner(salon)),
    canModerate: computed(() => canAccess('salones.moderate')),
    canViewAll: computed(() => canAccess('salones.view_all'))
  }

  /**
   * Permisos específicos para consultas
   */
  const consultaPermissions = {
    canCreate: computed(() => canAccess('consultas.create')),
    canRespond: (consulta) => {
      if (!canAccess('consultas.respond')) return false
      // Proveedor solo puede responder consultas de sus salones
      if (isProveedor.value) {
        return consulta.salon?.propietario === user.value.id
      }
      return isAdmin.value
    },
    canView: (consulta) => {
      if (isAdmin.value) return true
      if (isProveedor.value) {
        return consulta.salon?.propietario === user.value.id
      }
      return consulta.emailCliente === user.value.email
    }
  }

  /**
   * Permisos específicos para eventos
   */
  const eventoPermissions = {
    canCreate: computed(() => canAccess('eventos.create')),
    canManage: (evento) => {
      if (!canAccess('eventos.manage')) return false
      if (isAdmin.value) return true
      return evento.salon?.propietario === user.value.id
    },
    canViewAll: computed(() => canAccess('eventos.view_all'))
  }

  /**
   * Permisos para navegación
   */
  const navigationPermissions = {
    showProveedorDashboard: computed(() => canAccess('dashboard.proveedor')),
    showAdminDashboard: computed(() => canAccess('dashboard.admin')),
    showMisSalones: computed(() => isProveedor.value || isAdmin.value),
    showConsultas: computed(() => isProveedor.value || isAdmin.value),
    showEventos: computed(() => isProveedor.value || isAdmin.value)
  }

  // === UTILIDADES ===

  /**
   * Obtiene el dashboard por defecto según el rol
   */
  const getDefaultDashboard = () => {
    if (isAdmin.value) return '/admin/dashboard'
    if (isProveedor.value) return '/dashboard'
    return '/' // Cliente va al home
  }

  /**
   * Verifica si necesita verificación adicional
   */
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
    
    // Verificaciones generales
    hasRole,
    canAccess,
    isOwner,
    canEdit,
    canDelete,
    
    // Permisos específicos
    salonPermissions,
    consultaPermissions,
    eventoPermissions,
    navigationPermissions,
    
    // Utilidades
    getDefaultDashboard,
    requiresVerification
  }
}