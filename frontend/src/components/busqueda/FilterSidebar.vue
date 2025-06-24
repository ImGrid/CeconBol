<template>
  <div class="filter-sidebar">
    
    <!-- Header para móvil -->
    <div class="mb-4 lg:hidden">
      <Button
        variant="outline-primary"
        full-width
        @click="toggleMobileFilters"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
        </svg>
        Filtros
        <Badge v-if="filtrosActivos > 0" variant="primary" size="small" class="ml-2">
          {{ filtrosActivos }}
        </Badge>
      </Button>
    </div>

    <!-- Sidebar para desktop -->
    <div class="hidden lg:block">
      <Card class="sticky top-6">
          <SearchFilters
            :filters="modelValue"
            @update:filters="updateFilters"
            @apply="handleApply"
            @clear="handleClear"
          />
      </Card>
    </div>

    <!-- Modal para móvil -->
    <Modal
      v-model:show="showMobileFilters"
      title="Filtros de Búsqueda"
      size="large"
      :hide-footer="true"
    >
      <div class="overflow-y-auto max-h-96">
        <SearchFilters
          :filters="modelValue"
          @update:filters="updateFilters"
          @apply="handleMobileApply"
          @clear="handleClear"
        />
      </div>
    </Modal>

    <!-- Filtros activos (chips) -->
    <div v-if="activeFiltersChips.length > 0" class="mt-4 active-filters">
      <div class="active-filters-header">
        <h4 class="active-filters-title">Filtros activos:</h4>
        <button
          @click="handleClear"
          class="active-filters-clear"
        >
          Limpiar todo
        </button>
      </div>
      
      <div class="flex flex-wrap gap-1.5">
        <div
          v-for="chip in activeFiltersChips"
          :key="chip.key"
          class="filter-chip"
        >
          <span>{{ chip.label }}</span>
          <button
            @click="removeFilter(chip.key)"
            class="filter-chip-remove"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Resultados count -->
    <div v-if="showResultsCount && resultCount !== null" class="mt-3 results-count">
      <p class="results-count-text">
        <span class="results-count-number">{{ resultCount }}</span>
        {{ resultCount === 1 ? 'salón encontrado' : 'salones encontrados' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { CIUDADES_BOLIVIA } from '@/utils/constants.js'
import { formatPrice } from '@/utils/helpers.js'
import SearchFilters from './SearchFilters.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Modal from '@/components/ui/Modal.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  showResultsCount: {
    type: Boolean,
    default: true
  },
  resultCount: {
    type: Number,
    default: null
  }
})

// Events
const emit = defineEmits([
  'update:modelValue',
  'apply-filters',
  'clear-filters'
])

// Estado local
const showMobileFilters = ref(false)

// Computed
const filtrosActivos = computed(() => {
  let count = 0
  const filters = props.modelValue
  
  if (filters.ciudad) count++
  if (filters.capacidadMinima) count++
  if (filters.capacidadMaxima) count++
  if (filters.precioMin) count++
  if (filters.precioMax) count++
  if (filters.calificacion) count++
  if (filters.ordenarPor && filters.ordenarPor !== 'relevancia') count++
  
  return count
})

const activeFiltersChips = computed(() => {
  const chips = []
  const filters = props.modelValue
  
  if (filters.ciudad) {
    chips.push({
      key: 'ciudad',
      label: `Ciudad: ${filters.ciudad}`
    })
  }
  
  if (filters.capacidadMinima || filters.capacidadMaxima) {
    let label = 'Capacidad: '
    if (filters.capacidadMinima && filters.capacidadMaxima) {
      label += `${filters.capacidadMinima}-${filters.capacidadMaxima} personas`
    } else if (filters.capacidadMinima) {
      label += `desde ${filters.capacidadMinima} personas`
    } else {
      label += `hasta ${filters.capacidadMaxima} personas`
    }
    
    chips.push({
      key: 'capacidad',
      label
    })
  }
  
  if (filters.precioMin || filters.precioMax) {
    let label = 'Precio: '
    if (filters.precioMin && filters.precioMax) {
      label += `${formatPrice(filters.precioMin)} - ${formatPrice(filters.precioMax)}`
    } else if (filters.precioMin) {
      label += `desde ${formatPrice(filters.precioMin)}`
    } else {
      label += `hasta ${formatPrice(filters.precioMax)}`
    }
    
    chips.push({
      key: 'precio',
      label
    })
  }
  
  if (filters.calificacion) {
    chips.push({
      key: 'calificacion',
      label: `${filters.calificacion}+ estrellas`
    })
  }
  
  if (filters.ordenarPor && filters.ordenarPor !== 'relevancia') {
    const ordenLabels = {
      'calificacion': 'Mejor calificados',
      'precio': 'Precio menor a mayor',
      'precio-desc': 'Precio mayor a menor',
      'capacidad': 'Capacidad menor a mayor',
      'capacidad-desc': 'Capacidad mayor a menor',
      'nombre': 'Nombre A-Z',
      'fecha': 'Más recientes'
    }
    
    chips.push({
      key: 'ordenarPor',
      label: `Orden: ${ordenLabels[filters.ordenarPor]}`
    })
  }
  
  return chips
})

// Métodos
const updateFilters = (newFilters) => {
  emit('update:modelValue', newFilters)
}

const handleApply = (filters) => {
  emit('apply-filters', filters)
}

const handleMobileApply = (filters) => {
  showMobileFilters.value = false
  emit('apply-filters', filters)
}

const handleClear = () => {
  const emptyFilters = {
    ciudad: '',
    capacidadMinima: null,
    capacidadMaxima: null,
    precioMin: null,
    precioMax: null,
    calificacion: null,
    ordenarPor: 'relevancia'
  }
  
  emit('update:modelValue', emptyFilters)
  emit('clear-filters')
}

const removeFilter = (filterKey) => {
  const newFilters = { ...props.modelValue }
  
  switch (filterKey) {
    case 'ciudad':
      newFilters.ciudad = ''
      break
    case 'capacidad':
      newFilters.capacidadMinima = null
      newFilters.capacidadMaxima = null
      break
    case 'precio':
      newFilters.precioMin = null
      newFilters.precioMax = null
      break
    case 'calificacion':
      newFilters.calificacion = null
      break
    case 'ordenarPor':
      newFilters.ordenarPor = 'relevancia'
      break
  }
  
  emit('update:modelValue', newFilters)
  emit('apply-filters', newFilters)
}

const toggleMobileFilters = () => {
  showMobileFilters.value = !showMobileFilters.value
}
</script>

<style>
@import './busqueda.css';
</style>