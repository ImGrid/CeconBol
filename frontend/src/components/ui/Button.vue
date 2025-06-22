<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClass"
    @click="$emit('click', $event)"
  >
    <!-- Loading spinner -->
    <svg 
      v-if="loading" 
      class="button-icon animate-spin" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        class="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        stroke-width="4"
      />
      <path 
        class="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- Contenido del botón -->
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'success', 'outline-primary', 'outline-secondary'].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value)
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

// Events
defineEmits(['click'])

// Computed
const buttonClass = computed(() => {
  const classes = ['button-base'] // Clase base de ui.css
  
  // Variantes (usando las clases del main.css)
  const variantClasses = {
    'primary': 'btn-primary',
    'secondary': 'btn-secondary', 
    'success': 'btn-success',
    'outline-primary': 'btn-outline-primary',
    'outline-secondary': 'btn-outline-secondary'
  }
  
  // Tamaños (usando las clases de ui.css)
  const sizeClasses = {
    'small': 'button-small',
    'medium': 'button-medium', 
    'large': 'button-large'
  }
  
  // Agregar clases
  classes.push(variantClasses[props.variant])
  classes.push(sizeClasses[props.size])
  
  // Estados
  if (props.disabled || props.loading) {
    classes.push('button-disabled')
  }
  
  if (props.loading) {
    classes.push('button-loading')
  }
  
  // Ancho completo
  if (props.fullWidth) {
    classes.push('button-full-width')
  }
  
  return classes.join(' ')
})
</script>

<style>
@import './ui.css';
</style>