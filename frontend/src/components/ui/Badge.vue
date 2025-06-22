<template>
  <span :class="badgeClass">
    <!-- Icono opcional -->
    <span v-if="icon" class="mr-1">{{ icon }}</span>
    
    <!-- Contenido -->
    <slot>{{ text }}</slot>
  </span>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => [
      'default', 'primary', 'secondary', 'success', 'warning', 'error',
      'premium', 'popular', 'new', 'destacado'
    ].includes(value)
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  icon: {
    type: String,
    default: ''
  },
  rounded: {
    type: Boolean,
    default: true
  }
})

// Computed
const badgeClass = computed(() => {
  const baseClass = 'inline-flex items-center font-medium'
  
  // Variantes con colores de la paleta "Elegancia Festiva"
  const variantClasses = {
    'default': 'bg-gray-100 text-gray-800',
    'primary': 'bg-brand-primary text-white',
    'secondary': 'bg-brand-secondary text-white', 
    'success': 'bg-brand-tertiary text-white',
    'warning': 'bg-brand-accent text-white',
    'error': 'bg-red-100 text-red-800',
    
    // Badges especiales para salones
    'premium': 'badge-premium', // Definido en main.css
    'popular': 'badge-popular',  // Definido en main.css
    'new': 'badge-new',         // Definido en main.css
    'destacado': 'bg-gradient-to-r from-brand-accent to-brand-secondary text-white'
  }
  
  // Tamaños
  const sizeClasses = {
    'small': 'px-2 py-1 text-xs',
    'medium': 'px-3 py-1 text-sm',
    'large': 'px-4 py-2 text-base'
  }
  
  // Bordes redondeados
  const roundedClass = props.rounded ? 'rounded-full' : 'rounded'
  
  return [
    baseClass,
    variantClasses[props.variant],
    sizeClasses[props.size],
    roundedClass
  ].filter(Boolean).join(' ')
})
</script>