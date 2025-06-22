<template>
  <div class="rating-container">
    <!-- Estrellas -->
    <div class="rating-stars">
      <span 
        v-for="star in 5" 
        :key="star"
        :class="starClass(star)"
        @click="handleStarClick(star)"
      >
        ★
      </span>
    </div>

    <!-- Valor numérico (opcional) -->
    <span v-if="showValue" class="rating-value">
      {{ displayValue }}
    </span>

    <!-- Cantidad de reseñas (opcional) -->
    <span v-if="showCount && count" class="rating-count">
      ({{ count }})
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  value: {
    type: Number,
    default: 0,
    validator: (value) => value >= 0 && value <= 5
  },
  maxStars: {
    type: Number,
    default: 5,
    validator: (value) => value > 0
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  interactive: {
    type: Boolean,
    default: false
  },
  showValue: {
    type: Boolean,
    default: true
  },
  showCount: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: 0
  },
  precision: {
    type: Number,
    default: 1,
    validator: (value) => [0, 1, 2].includes(value)
  }
})

// Events
const emit = defineEmits(['update:value', 'change'])

// Computed
const displayValue = computed(() => {
  if (props.precision === 0) {
    return Math.round(props.value)
  }
  return props.value.toFixed(props.precision)
})

const sizeClasses = computed(() => {
  const sizes = {
    'small': 'rating-star-small',
    'medium': 'rating-star-medium', 
    'large': 'rating-star-large'
  }
  return sizes[props.size]
})

// Métodos
const starClass = (starNumber) => {
  const classes = ['rating-star', sizeClasses.value]
  
  if (starNumber <= props.value) {
    // Estrella llena - usar color de marca para estrellas
    classes.push('rating-stars') // Clase definida en main.css
  } else if (starNumber - 0.5 <= props.value) {
    // Media estrella (futuro feature)
    classes.push('text-brand-accent opacity-50')
  } else {
    // Estrella vacía
    classes.push('text-gray-300')
  }
  
  if (props.interactive) {
    classes.push('hover:text-brand-accent cursor-pointer')
  }
  
  return classes.join(' ')
}

const handleStarClick = (starNumber) => {
  if (!props.interactive) return
  
  emit('update:value', starNumber)
  emit('change', starNumber)
}
</script>

<style>
@import './ui.css';
</style>