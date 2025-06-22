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
      class="animate-spin h-4 w-4 mr-2" 
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
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  // Variantes (usando las clases del main.css)
  const variantClasses = {
    'primary': 'btn-primary focus:ring-brand-primary',
    'secondary': 'btn-secondary focus:ring-brand-secondary', 
    'success': 'btn-success focus:ring-brand-tertiary',
    'outline-primary': 'btn-outline-primary focus:ring-brand-primary',
    'outline-secondary': 'btn-outline-secondary focus:ring-brand-secondary'
  }
  
  // Tamaños
  const sizeClasses = {
    'small': 'px-4 py-2 text-sm rounded-md',
    'medium': 'px-6 py-3 text-base rounded-lg', 
    'large': 'px-8 py-4 text-lg rounded-lg'
  }
  
  // Estados
  const stateClasses = (props.disabled || props.loading) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
  
  // Ancho completo
  const widthClass = props.fullWidth ? 'w-full' : ''
  
  return [
    baseClasses,
    variantClasses[props.variant],
    sizeClasses[props.size],
    stateClasses,
    widthClass
  ].filter(Boolean).join(' ')
})
</script>