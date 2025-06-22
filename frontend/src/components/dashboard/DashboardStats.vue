<template>
  <div class="dashboard-stats">
    <div
      v-for="(stat, index) in stats"
      :key="index"
      class="stat-card"
    >
      <!-- Icono -->
      <div :class="getIconClass(stat.type)">
        <component :is="stat.icon" class="w-6 h-6" />
      </div>
      
      <!-- Valor principal -->
      <div class="stat-card-value">
        {{ formatValue(stat.value) }}
      </div>
      
      <!-- Label -->
      <div class="stat-card-label">
        {{ stat.label }}
      </div>
      
      <!-- Cambio/Tendencia -->
      <div v-if="stat.change !== undefined" :class="getChangeClass(stat.change)">
        <svg v-if="stat.change > 0" class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <svg v-else-if="stat.change < 0" class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
        <svg v-else class="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
        </svg>
        {{ formatChange(stat.change) }}
      </div>
      
      <!-- Descripción adicional -->
      <div v-if="stat.description" class="mt-1 text-xs text-gray-500">
        {{ stat.description }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  stats: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(stat => 
        stat.hasOwnProperty('value') && 
        stat.hasOwnProperty('label') &&
        stat.hasOwnProperty('type') &&
        stat.hasOwnProperty('icon')
      )
    }
  }
})

// Métodos
const getIconClass = (type) => {
  const baseClass = 'stat-card-icon'
  const typeClasses = {
    'primary': 'stat-card-icon-primary',
    'secondary': 'stat-card-icon-secondary', 
    'tertiary': 'stat-card-icon-tertiary',
    'accent': 'stat-card-icon-accent'
  }
  
  return [baseClass, typeClasses[type] || typeClasses.primary].join(' ')
}

const getChangeClass = (change) => {
  const baseClass = 'stat-card-change'
  
  if (change > 0) {
    return [baseClass, 'stat-card-change-positive'].join(' ')
  } else if (change < 0) {
    return [baseClass, 'stat-card-change-negative'].join(' ')
  } else {
    return [baseClass, 'stat-card-change-neutral'].join(' ')
  }
}

const formatValue = (value) => {
  if (typeof value === 'number') {
    // Formatear números grandes
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M'
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K'
    }
    return value.toLocaleString()
  }
  return value
}

const formatChange = (change) => {
  if (change === 0) return 'Sin cambios'
  
  const sign = change > 0 ? '+' : ''
  return `${sign}${change}%`
}
</script>