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
      <p v-if="subtitle" :class="subtitleClass">
        {{ subtitle }}
      </p>

      <!-- Contenido del slot por defecto -->
      <div v-if="$slots.default">
        <slot />
      </div>
      
      <!-- Descripción -->
      <p v-if="description" :class="descriptionClass">
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
  const baseClass = 'bg-white rounded-xl border transition-all duration-200'
  
  const variantClasses = {
    'default': 'card',
    'venue': 'card-venue', 
    'simple': 'shadow-sm border-gray-100',
    'bordered': 'border-2 border-gray-200'
  }
  
  const hoverClass = props.hover ? 'hover-glow hover-lift' : ''
  const clickableClass = props.clickable ? 'cursor-pointer' : ''
  
  return [
    baseClass,
    variantClasses[props.variant],
    hoverClass,
    clickableClass
  ].filter(Boolean).join(' ')
})

const headerClass = computed(() => {
  const paddingClasses = {
    'none': 'p-0',
    'small': 'p-3',
    'medium': 'p-4',
    'large': 'p-6'
  }
  
  return [
    'border-b border-gray-100',
    paddingClasses[props.padding]
  ].join(' ')
})

const bodyClass = computed(() => {
  const paddingClasses = {
    'none': 'p-0',
    'small': 'p-3',
    'medium': 'p-4',
    'large': 'p-6'
  }
  
  return paddingClasses[props.padding]
})

const footerClass = computed(() => {
  const paddingClasses = {
    'none': 'p-0',
    'small': 'p-3',
    'medium': 'p-4', 
    'large': 'p-6'
  }
  
  return [
    'border-t border-gray-100 bg-gray-50 rounded-b-xl',
    paddingClasses[props.padding]
  ].join(' ')
})

const imageClass = computed(() => {
  return props.variant === 'venue' ? 'w-full h-48 object-cover' : 'w-full h-auto'
})

const titleClass = computed(() => {
  return props.variant === 'venue' 
    ? 'text-lg font-semibold text-gray-900 mb-1'
    : 'text-xl font-semibold text-gray-900 mb-2'
})

const subtitleClass = computed(() => {
  return 'text-sm text-gray-600 mb-2'
})

const descriptionClass = computed(() => {
  return 'text-gray-600 text-sm leading-relaxed'
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