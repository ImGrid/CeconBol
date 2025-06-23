import { createRouter, createWebHistory } from 'vue-router'

// Importar páginas principales
import Home from '@/pages/Home.vue'
import Login from '@/pages/auth/Login.vue'
import Register from '@/pages/auth/Register.vue'

// Importar páginas de dashboard
import ProveedorDashboard from '@/pages/dashboard/ProveedorDashboard.vue'
import AdminDashboard from '@/pages/dashboard/AdminDashboard.vue'
import ClienteDashboard from '@/pages/dashboard/ClienteDashboard.vue'

// Importar guards
import { 
  requireAuth, 
  requireGuest, 
  initializeAuth,
  requireAdmin,
  requireProvider,
  requireClientOrProvider 
} from './guards.js'

// === DEFINICIÓN DE RUTAS ===
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: initializeAuth,
    meta: {
      title: 'CECONBOL - Marketplace de Salones'
    }
  },
  
  // === RUTAS DE AUTENTICACIÓN ===
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: requireGuest,
    meta: {
      title: 'Iniciar Sesión - CECONBOL'
    }
  },
  {
    path: '/register',
    name: 'Register', 
    component: Register,
    beforeEnter: requireGuest,
    meta: {
      title: 'Crear Cuenta - CECONBOL'
    }
  },
  
  // === RUTAS DE DASHBOARD (COMPLETADAS) ===
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => {
      // Redirigir según el rol del usuario
      const authStore = useAuthStore()
      if (authStore.user?.rol === 'admin') {
        return import('@/pages/dashboard/AdminDashboard.vue')
      } else if (authStore.user?.rol === 'proveedor') {
        return import('@/pages/dashboard/ProveedorDashboard.vue')
      } else {
        return import('@/pages/dashboard/ClienteDashboard.vue')
      }
    },
    beforeEnter: requireAuth,
    meta: {
      title: 'Dashboard - CECONBOL',
      requiresAuth: true
    }
  },
  
  // Dashboard específicos por rol
  {
    path: '/dashboard/proveedor',
    name: 'ProveedorDashboard',
    component: ProveedorDashboard,
    beforeEnter: requireProvider,
    meta: {
      title: 'Dashboard Proveedor - CECONBOL',
      requiresAuth: true,
      requiresProvider: true
    }
  },
  {
    path: '/dashboard/cliente', 
    name: 'ClienteDashboard',
    component: ClienteDashboard,
    beforeEnter: requireAuth, // Cliente puede acceder
    meta: {
      title: 'Mi Dashboard - CECONBOL',
      requiresAuth: true
    }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard', 
    component: AdminDashboard,
    beforeEnter: requireAdmin,
    meta: {
      title: 'Panel Admin - CECONBOL',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // === RUTAS DE SALONES (Fase 2) ===
  {
    path: '/salones',
    name: 'Salones',
    component: () => import('@/pages/salones/SalonesList.vue'),
    beforeEnter: initializeAuth,
    meta: {
      title: 'Buscar Salones - CECONBOL'
    }
  },
  {
    path: '/salones/:slug',
    name: 'SalonDetail',
    component: () => import('@/pages/salones/SalonDetail.vue'),
    beforeEnter: initializeAuth,
    meta: {
      title: 'Detalle del Salón - CECONBOL'
    }
  },
  {
    path: '/salones/detail/:id',
    name: 'SalonDetailById',
    component: () => import('@/pages/salones/SalonDetail.vue'),
    beforeEnter: initializeAuth,
    meta: {
      title: 'Detalle del Salón - CECONBOL'
    }
  },
  
  // === RUTAS DE GESTIÓN (TEMPORALES HASTA OTRAS FASES) ===
  {
    path: '/mis-salones',
    name: 'MisSalones',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 4
    beforeEnter: requireProvider,
    meta: {
      title: 'Mis Salones - CECONBOL',
      requiresAuth: true,
      requiresProvider: true
    }
  },
  {
    path: '/mis-salones/crear',
    name: 'CrearSalon',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 4
    beforeEnter: requireProvider,
    meta: {
      title: 'Crear Salón - CECONBOL',
      requiresAuth: true,
      requiresProvider: true
    }
  },
  {
    path: '/consultas',
    name: 'Consultas',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 5
    beforeEnter: requireAuth,
    meta: {
      title: 'Consultas - CECONBOL',
      requiresAuth: true
    }
  },
  {
    path: '/consultas/create',
    name: 'CrearConsulta',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 5
    beforeEnter: requireAuth,
    meta: {
      title: 'Nueva Consulta - CECONBOL',
      requiresAuth: true
    }
  },
  {
    path: '/consultas/:id',
    name: 'ConsultaDetail',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 5
    beforeEnter: requireAuth,
    meta: {
      title: 'Detalle Consulta - CECONBOL',
      requiresAuth: true
    }
  },
  
  // === RUTAS DE PERFIL ===
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/Home.vue'), // Temporal - crear después
    beforeEnter: requireAuth,
    meta: {
      title: 'Mi Perfil - CECONBOL',
      requiresAuth: true
    }
  },
  
  // === RUTAS DE EVENTOS (TEMPORALES) ===
  {
    path: '/eventos',
    name: 'Eventos',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 6
    beforeEnter: requireAuth,
    meta: {
      title: 'Eventos - CECONBOL',
      requiresAuth: true
    }
  },
  {
    path: '/mis-eventos',
    name: 'MisEventos',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 6
    beforeEnter: requireAuth,
    meta: {
      title: 'Mis Eventos - CECONBOL',
      requiresAuth: true
    }
  },
  
  // === RUTAS DE RESEÑAS (TEMPORALES) ===
  {
    path: '/resenas',
    name: 'Resenas',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 7
    beforeEnter: requireAuth,
    meta: {
      title: 'Reseñas - CECONBOL',
      requiresAuth: true
    }
  },
  {
    path: '/mis-resenas',
    name: 'MisResenas',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 7
    beforeEnter: requireAuth,
    meta: {
      title: 'Mis Reseñas - CECONBOL',
      requiresAuth: true
    }
  },
  
  // === RUTAS DE ADMIN (TEMPORALES HASTA FASE 9) ===
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/usuarios',
    name: 'AdminUsuarios',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 9
    beforeEnter: requireAdmin,
    meta: {
      title: 'Gestión Usuarios - CECONBOL',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/salones',
    name: 'AdminSalones',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 9
    beforeEnter: requireAdmin,
    meta: {
      title: 'Gestión Salones - CECONBOL',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/reportes',
    name: 'AdminReportes',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 9
    beforeEnter: requireAdmin,
    meta: {
      title: 'Reportes - CECONBOL',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/admin/configuracion',
    name: 'AdminConfiguracion',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 9
    beforeEnter: requireAdmin,
    meta: {
      title: 'Configuración - CECONBOL',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  
  // === CATCH ALL 404 ===
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/Home.vue'), // Temporal - crear página 404
    meta: {
      title: 'Página no encontrada - CECONBOL'
    }
  }
]

// === CREAR ROUTER ===
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// === GUARDS GLOBALES ===

// Importar store para uso en guards
import { useAuthStore } from '@/stores/auth.store.js'

// Redirigir dashboard principal según rol
router.beforeEach((to, from, next) => {
  if (to.name === 'Dashboard') {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    // Redirigir al dashboard específico según el rol
    const userRole = authStore.user?.rol
    
    if (userRole === 'admin') {
      next('/admin/dashboard')
    } else if (userRole === 'proveedor') {
      next('/dashboard/proveedor')
    } else {
      next('/dashboard/cliente')
    }
    return
  }
  
  next()
})

// Cambiar título de la página
router.beforeEach((to, from, next) => {
  // Cambiar título
  if (to.meta.title) {
    document.title = to.meta.title
  }
  
  next()
})

// Log de navegación en desarrollo
router.beforeEach((to, from, next) => {
  if (import.meta.env.DEV) {
    console.log(`🧭 Navegando: ${from.path} → ${to.path}`)
    
    // Log de permisos requeridos
    if (to.meta.requiresAuth) {
      console.log(`🔐 Ruta requiere autenticación`)
    }
    if (to.meta.requiresAdmin) {
      console.log(`👑 Ruta requiere permisos de administrador`)
    }
    if (to.meta.requiresProvider) {
      console.log(`🏢 Ruta requiere ser proveedor`)
    }
  }
  next()
})

// Manejo de errores de navegación
router.onError((error) => {
  console.error('🚨 Error de navegación:', error)
  
  // En producción, podrías enviar el error a un servicio de logging
  if (import.meta.env.PROD) {
    // Ejemplo: Sentry.captureException(error)
  }
})

export default router