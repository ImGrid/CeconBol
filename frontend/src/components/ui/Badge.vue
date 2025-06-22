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
  const classes = ['badge-base'] // Clase base de ui.css
  
  // Variantes con colores de la paleta "Elegancia Festiva"
  const variantClasses = {
    'default': 'bg-gray-100 text-gray-800',
    'primary': 'bg-brand-primary text-white',
    'secondary': 'bg-brand-secondary text-white', 
    'success': 'bg-brand-tertiary text-white',
    'warning': 'bg-brand-accent text-white',
    'error': 'bg-red-100 text-red-800',
    
    // Badges especiales para salones (definidos en main.css)
    'premium': 'badge-premium',
    'popular': 'badge-popular',
    'new': 'badge-new',
    'destacado': 'bg-gradient-to-r from-brand-accent to-brand-secondary text-white'
  }
  
  // Tamaños (definidos en ui.css)
  const sizeClasses = {
    'small': 'badge-small',
    'medium': 'badge-medium',
    'large': 'badge-large'
  }
  
  // Bordes redondeados
  const roundedClass = props.rounded ? 'badge-rounded' : 'badge-square'
  
  classes.push(variantClasses[props.variant])
  classes.push(sizeClasses[props.size])
  classes.push(roundedClass)
  
  return classes.join(' ')
})
</script>

<style>
@import './ui.css';
</style>