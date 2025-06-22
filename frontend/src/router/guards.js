import { useAuthStore } from '@/stores/auth.store.js'
import { USER_ROLES } from '@/utils/constants.js'

/**
 * Guard para rutas que requieren autenticación
 */
export const requireAuth = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (!authStore.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else {
    next()
  }
}

/**
 * Guard para rutas que NO requieren autenticación (login, register)
 */
export const requireGuest = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.isAuthenticated) {
    // Redirigir al dashboard correspondiente según el rol
    const user = authStore.user
    
    if (user.rol === USER_ROLES.ADMIN) {
      next('/admin/dashboard')
    } else if (user.rol === USER_ROLES.PROVEEDOR) {
      next('/dashboard')
    } else {
      next('/')
    }
  } else {
    next()
  }
}

/**
 * Guard para rutas que requieren rol específico
 */
export const requireRole = (roles) => {
  return (to, from, next) => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
    
    const userRole = authStore.user.rol
    const allowedRoles = Array.isArray(roles) ? roles : [roles]
    
    if (allowedRoles.includes(userRole)) {
      next()
    } else {
      // Redirigir a página apropiada según el rol
      if (userRole === USER_ROLES.ADMIN) {
        next('/admin/dashboard')
      } else if (userRole === USER_ROLES.PROVEEDOR) {
        next('/dashboard')
      } else {
        next('/')
      }
    }
  }
}

/**
 * Guard específico para proveedores
 */
export const requireProvider = requireRole([USER_ROLES.PROVEEDOR, USER_ROLES.ADMIN])

/**
 * Guard específico para administradores
 */
export const requireAdmin = requireRole(USER_ROLES.ADMIN)

/**
 * Guard específico para clientes o proveedores
 */
export const requireClientOrProvider = requireRole([USER_ROLES.CLIENTE, USER_ROLES.PROVEEDOR, USER_ROLES.ADMIN])

/**
 * Guard para verificar token al inicializar la app
 */
export const initializeAuth = async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Inicializar auth desde localStorage
  authStore.initializeAuth()
  
  // Si hay usuario en localStorage, verificar que el token siga siendo válido
  if (authStore.isAuthenticated) {
    try {
      // Aquí podrías verificar el token con el servidor si es necesario
      // const { verifyAuth } = useAuth()
      // await verifyAuth()
      
      next()
    } catch (error) {
      // Token inválido, limpiar sesión
      authStore.clearAuth()
      next()
    }
  } else {
    next()
  }
}

/**
 * Guard para manejar redirects después del login
 */
export const handleLoginRedirect = (to, from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.isAuthenticated) {
    // Si hay query redirect, ir ahí
    if (to.query.redirect) {
      next(to.query.redirect)
      return
    }
    
    // Sino, redirigir según el rol
    const user = authStore.user
    
    if (user.rol === USER_ROLES.ADMIN) {
      next('/admin/dashboard')
    } else if (user.rol === USER_ROLES.PROVEEDOR) {
      next('/dashboard')
    } else {
      next('/')
    }
  } else {
    next()
  }
}