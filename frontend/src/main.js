import './assets/css/main.css'

// Importar CSS de módulos
import './components/ui/ui.css'
import './components/busqueda/busqueda.css'
import './components/salones/salones.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

//  Importar router desde archivo externo
import router from '@/router/index.js'

// === CONFIGURACIÓN DE PINIA ===
const pinia = createPinia()

// === INICIALIZACIÓN DE LA APP ===
const app = createApp(App)

// Plugins
app.use(pinia)
app.use(router) // Usar el router externo corregido

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