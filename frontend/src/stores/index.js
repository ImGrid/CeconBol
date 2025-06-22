import { createPinia } from 'pinia'

// Crear instancia de Pinia
export const pinia = createPinia()

// Exportar stores para facilitar importaciones
export { useAuthStore } from './auth.store.js'