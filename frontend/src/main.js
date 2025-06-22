import './assets/css/main.css'

// Importar CSS de módulos
import './components/ui/ui.css'
import './components/busqueda/busqueda.css'
import './components/salones/salones.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'

// Importar páginas
import Home from '@/pages/Home.vue'
import Login from '@/pages/auth/Login.vue'
import Register from '@/pages/auth/Register.vue'

// Importar guards
import { requireAuth, requireGuest, initializeAuth } from '@/router/guards.js'

// === CONFIGURACIÓN DE RUTAS ===
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: initializeAuth
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    beforeEnter: requireGuest
  },
  {
    path: '/register',
    name: 'Register', 
    component: Register,
    beforeEnter: requireGuest
  },
  
  // Rutas temporales hasta implementar Fase 2-3
  {
    path: '/salones',
    name: 'Salones',
    component: () => import('@/pages/Home.vue'), // Temporal - mostrar Home
    beforeEnter: initializeAuth
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 3
    beforeEnter: requireAuth
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar después
    beforeEnter: requireAuth
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard', 
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 9
    beforeEnter: requireAuth
  },
  {
    path: '/mis-salones',
    name: 'MisSalones',
    component: () => import('@/pages/Home.vue'), // Temporal - reemplazar en Fase 4
    beforeEnter: requireAuth
  },
  
  // 404 - Catch all
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/Home.vue') // Temporal - crear página 404 después
  }
]

// === CONFIGURACIÓN DEL ROUTER ===
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Scroll al top en cada navegación, o restablecer posición si existe
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// === CONFIGURACIÓN DE PINIA ===
const pinia = createPinia()

// === INICIALIZACIÓN DE LA APP ===
const app = createApp(App)

// Plugins
app.use(pinia)
app.use(router)

// Error handler global
app.config.errorHandler = (err, vm, info) => {
  console.error('Global error:', err)
  console.error('Error info:', info)
  
  // En producción podrías enviar esto a un servicio de logging
  if (import.meta.env.PROD) {
    // Ejemplo: Sentry, LogRocket, etc.
  }
}

// Montar la aplicación
app.mount('#app')

// === CONFIGURACIÓN ADICIONAL ===

// Log de inicialización en desarrollo
if (import.meta.env.DEV) {
  console.log('🎪 CECONBOL Frontend iniciado')
  console.log('📡 API Base URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000')
  console.log('🔧 Modo:', import.meta.env.MODE)
}