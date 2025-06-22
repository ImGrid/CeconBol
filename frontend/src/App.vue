<template>
  <div id="app">
    <!-- Router view - cada página decidirá su layout -->
    <RouterView />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store.js'

// Inicializar auth al arrancar la app
const authStore = useAuthStore()

onMounted(() => {
  // Restaurar sesión desde localStorage si existe
  authStore.initializeAuth()
})
</script>

<style>
/* Reset y estilos globales ya están en assets/css/main.css */

#app {
  min-height: 100vh;
}

/* Asegurar que las transiciones funcionen bien */
.router-link-active {
  /* Estilos para enlaces activos si es necesario */
}

/* Scroll behavior suave */
html {
  scroll-behavior: smooth;
}

/* Focus styles para accesibilidad */
*:focus {
  outline: 2px solid var(--color-brand-primary);
  outline-offset: 2px;
}

/* Ocultar scroll en algunos elementos si es necesario */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>