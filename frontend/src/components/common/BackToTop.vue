<template>
  <Transition
    enter-active-class="transition-all duration-300"
    enter-from-class="back-to-top-hidden"
    enter-to-class="back-to-top-visible"
    leave-active-class="transition-all duration-300"
    leave-from-class="back-to-top-visible"
    leave-to-class="back-to-top-hidden"
  >
    <button
      v-if="showButton"
      @click="scrollToTop"
      class="back-to-top back-to-top-visible"
      title="Volver al inicio"
      aria-label="Volver al inicio de la página"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </button>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Estado
const showButton = ref(false)

// Métodos
const handleScroll = () => {
  // Mostrar el botón cuando el usuario haya scrolleado más de 400px
  showButton.value = window.pageYOffset > 400
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  // Verificar posición inicial
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>