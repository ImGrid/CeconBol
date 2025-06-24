<template>
  <div :class="cardClass" @click="handleClick">
    <!-- Header del card -->
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>

    <!-- Imagen del card -->
    <div v-if="image" class="relative">
      <img 
        :src="image" 
        :alt="imageAlt || 'Card image'" 
        :class="imageClass"
        @error="handleImageError"
      />
      
      <!-- Overlay content -->
      <div v-if="$slots.overlay" class="absolute inset-0 flex items-center justify-center">
        <slot name="overlay" />
      </div>
    </div>

    <!-- Contenido principal -->
    <div :class="bodyClass">
      <slot />
    </div>

    <!-- Footer del card -->
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props SIMPLIFICADOS - Solo 4 esenciales
const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'venue'].includes(value)
  },
  image: {
    type: String,
    default: ''
  },
  imageAlt: {
    type: String,
    default: ''
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['click', 'image-error'])

// Computed classes
const cardClass = computed(() => {
  const classes = ['card-base']
  
  // Solo 2 variantes que realmente se usan
  if (props.variant === 'venue') {
    classes.push('card-venue')
  } else {
    classes.push('card')
  }
  
  // Estados
  if (props.clickable) {
    classes.push('card-clickable', 'hover-glow', 'hover-lift')
  }
  
  return classes.join(' ')
})

const bodyClass = computed(() => {
  // Padding fijo - no necesitamos variantes complejas
  return 'card-padding-medium'
})

const imageClass = computed(() => {
  return props.variant === 'venue' ? 'card-venue-image' : 'card-image'
})

// Métodos
const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event)
  }
}

const handleImageError = (event) => {
  emit('image-error', event)
  // Fallback a imagen placeholder
  event.target.src = '/images/placeholder-salon.jpg'
}
</script>

<style>
@import './ui.css';
</style>