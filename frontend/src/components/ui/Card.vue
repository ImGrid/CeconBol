<template>
  <div :class="cardClass" @click="handleClick">
    <!-- Header del card -->
    <header v-if="$slots.header" :class="headerClass">
      <slot name="header" />
    </header>

    <!-- Imagen del card -->
    <div v-if="image" class="relative">
      <img 
        :src="image" 
        :alt="imageAlt || title" 
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
      <!-- Título -->
      <h3 v-if="title" :class="titleClass">
        {{ title }}
      </h3>
      
      <!-- Subtítulo -->
      <p v-if="subtitle" class="card-subtitle">
        {{ subtitle }}
      </p>

      <!-- Contenido del slot por defecto -->
      <div v-if="$slots.default">
        <slot />
      </div>
      
      <!-- Descripción -->
      <p v-if="description" class="card-description">
        {{ description }}
      </p>
    </div>

    <!-- Footer del card -->
    <footer v-if="$slots.footer" :class="footerClass">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  // Contenido
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  imageAlt: {
    type: String,
    default: ''
  },
  
  // Variantes
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'venue', 'simple', 'bordered'].includes(value)
  },
  
  // Estados
  hover: {
    type: Boolean,
    default: true
  },
  clickable: {
    type: Boolean,
    default: false
  },
  
  // Tamaños
  padding: {
    type: String,
    default: 'medium',
    validator: (value) => ['none', 'small', 'medium', 'large'].includes(value)
  }
})

// Events
const emit = defineEmits(['click', 'image-error'])

// Computed classes
const cardClass = computed(() => {
  const classes = ['card-base'] // Clase base de ui.css
  
  // Variantes usando clases de main.css y ui.css
  const variantClasses = {
    'default': 'card',
    'venue': 'card-venue', 
    'simple': 'card-simple',
    'bordered': 'card-bordered'
  }
  
  classes.push(variantClasses[props.variant])
  
  // Estados
  if (props.hover) {
    classes.push('card-hover hover-glow hover-lift')
  }
  
  if (props.clickable) {
    classes.push('card-clickable')
  }
  
  return classes.join(' ')
})

const headerClass = computed(() => {
  const paddingClasses = {
    'none': 'card-padding-none',
    'small': 'card-padding-small',
    'medium': 'card-padding-medium',
    'large': 'card-padding-large'
  }
  
  return ['card-header', paddingClasses[props.padding]].join(' ')
})

const bodyClass = computed(() => {
  const paddingClasses = {
    'none': 'card-padding-none',
    'small': 'card-padding-small',
    'medium': 'card-padding-medium',
    'large': 'card-padding-large'
  }
  
  return paddingClasses[props.padding]
})

const footerClass = computed(() => {
  const paddingClasses = {
    'none': 'card-padding-none',
    'small': 'card-padding-small',
    'medium': 'card-padding-medium', 
    'large': 'card-padding-large'
  }
  
  return ['card-footer', paddingClasses[props.padding]].join(' ')
})

const imageClass = computed(() => {
  return props.variant === 'venue' ? 'card-venue-image' : 'card-image'
})

const titleClass = computed(() => {
  return props.variant === 'venue' ? 'card-venue-title' : 'card-title'
})

// Métodos
const handleClick = (event) => {
  if (props.clickable) {
    emit('click', event)
  }
}

const handleImageError = (event) => {
  emit('image-error', event)
  // Opcional: mostrar imagen placeholder
  event.target.src = '/images/placeholder-salon.jpg'
}
</script>

<style>
@import './ui.css';
</style>