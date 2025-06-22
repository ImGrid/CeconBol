import { createRouter, createWebHistory } from 'vue-router'

// Importar páginas
import Home from '@/pages/Home.vue'
import Login from '@/pages/auth/Login.vue'
import Register from '@/pages/auth/Register.vue'

// Importar guards
import { requireAuth, requireGuest, initializeAuth } from './guards.js'

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
  
  // === RUTAS TEMPORALES (hasta implementar otras fases) ===
  {
    path: '/salones',
    name: 'Salones',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 2
    beforeEnter: initializeAuth,
    meta: {
      title: 'Buscar Salones - CECONBOL'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 3
    beforeEnter: requireAuth,
    meta: {
      title: 'Dashboard - CECONBOL',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/Home.vue'), // Temporal
    beforeEnter: requireAuth,
    meta: {
      title: 'Mi Perfil - CECONBOL',
      requiresAuth: true
    }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard', 
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 9
    beforeEnter: requireAuth,
    meta: {
      title: 'Panel Admin - CECONBOL',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/mis-salones',
    name: 'MisSalones',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 4
    beforeEnter: requireAuth,
    meta: {
      title: 'Mis Salones - CECONBOL',
      requiresAuth: true
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
  }
  next()
})

export default router