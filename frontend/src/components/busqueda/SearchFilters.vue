<template>
  <div class="search-filters">
    <!-- Header con toggle de filtros en móvil -->
    <div class="flex items-center justify-between mb-4 md:mb-6">
      <h3 class="text-lg font-semibold text-gray-900">
        Filtros de Búsqueda
      </h3>
      
      <!-- Contador de filtros activos -->
      <Badge v-if="filtrosActivosCount > 0" variant="primary" size="small">
        {{ filtrosActivosCount }} {{ filtrosActivosCount === 1 ? 'filtro' : 'filtros' }}
      </Badge>
    </div>

    <!-- Filtros -->
    <div class="space-y-6">
      
      <!-- Ciudad -->
      <div class="form-group">
        <label class="form-label">Ciudad</label>
        <select
          v-model="localFilters.ciudad"
          class="form-select"
          @change="updateFilters"
        >
          <option value="">Todas las ciudades</option>
          <option 
            v-for="ciudad in CIUDADES_BOLIVIA" 
            :key="ciudad" 
            :value="ciudad"
          >
            {{ ciudad }}
          </option>
        </select>
      </div>

      <!-- Capacidad -->
      <div class="form-group">
        <label class="form-label">Capacidad</label>
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-gray-600 mb-1 block">Mínima</label>
            <input
              v-model.number="localFilters.capacidadMinima"
              type="number"
              min="0"
              max="10000"
              placeholder="0"
              class="form-input"
              @input="updateFiltersDebounced"
            />
          </div>
          
          <div>
            <label class="text-xs text-gray-600 mb-1 block">Máxima</label>
            <input
              v-model.number="localFilters.capacidadMaxima"
              type="number"
              min="0"
              max="10000"
              placeholder="Sin límite"
              class="form-input"
              @input="updateFiltersDebounced"
            />
          </div>
        </div>

        <!-- Capacidad rápida -->
        <div class="capacity-ranges">
          <button
            v-for="range in capacityRanges"
            :key="range.label"
            @click="setCapacityRange(range)"
            :class="[
              'capacity-range-btn',
              isCapacityRangeActive(range) ? 'capacity-range-active' : 'capacity-range-inactive'
            ]"
          >
            {{ range.label }}
          </button>
        </div>
      </div>

      <!-- Precio -->
      <div class="form-group">
        <label class="form-label">Rango de Precio</label>
        
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-gray-600 mb-1 block">Mínimo</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                Bs.
              </span>
              <input
                v-model.number="localFilters.precioMin"
                type="number"
                min="0"
                placeholder="0"
                class="form-input pl-8"
                @input="updateFiltersDebounced"
              />
            </div>
          </div>
          
          <div>
            <label class="text-xs text-gray-600 mb-1 block">Máximo</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                Bs.
              </span>
              <input
                v-model.number="localFilters.precioMax"
                type="number"
                min="0"
                placeholder="Sin límite"
                class="form-input pl-8"
                @input="updateFiltersDebounced"
              />
            </div>
          </div>
        </div>

        <!-- Precio rápido -->
        <div class="price-ranges">
          <button
            v-for="range in priceRanges"
            :key="range.label"
            @click="setPriceRange(range)"
            :class="[
              'price-range-btn',
              isPriceRangeActive(range) ? 'price-range-active' : 'price-range-inactive'
            ]"
          >
            {{ range.label }}
          </button>
        </div>
      </div>

      <!-- Calificación -->
      <div class="form-group">
        <label class="form-label">Calificación Mínima</label>
        
        <div class="space-y-2">
          <div
            v-for="rating in [4, 3, 2, 1]"
            :key="rating"
            class="flex items-center"
          >
            <input
              :id="`rating-${rating}`"
              v-model.number="localFilters.calificacion"
              type="radio"
              :value="rating"
              class="radio-brand"
              @change="updateFilters"
            />
            <label 
              :for="`rating-${rating}`" 
              class="ml-2 flex items-center cursor-pointer"
            >
              <Rating :value="rating" :show-value="false" size="small" />
              <span class="ml-1 text-sm text-gray-600">y más</span>
            </label>
          </div>
          
          <!-- Opción "Cualquiera" -->
          <div class="flex items-center">
            <input
              id="rating-any"
              v-model.number="localFilters.calificacion"
              type="radio"
              :value="null"
              class="radio-brand"
              @change="updateFilters"
            />
            <label for="rating-any" class="ml-2 text-sm text-gray-600 cursor-pointer">
              Cualquier calificación
            </label>
          </div>
        </div>
      </div>

      <!-- Ordenamiento -->
      <div class="form-group">
        <label class="form-label">Ordenar por</label>
        <select
          v-model="localFilters.ordenarPor"
          class="form-select"
          @change="updateFilters"
        >
          <option value="relevancia">Más relevantes</option>
          <option value="calificacion">Mejor calificados</option>
          <option value="precio">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
          <option value="capacidad">Capacidad: menor a mayor</option>
          <option value="capacidad-desc">Capacidad: mayor a menor</option>
          <option value="nombre">Nombre A-Z</option>
          <option value="fecha">Más recientes</option>
        </select>
      </div>
    </div>

    <!-- Botones de acción -->
    <div class="border-t pt-6 mt-6 space-y-3">
      <Button
        variant="outline-primary"
        full-width
        @click="clearAllFilters"
      >
        Limpiar Filtros
      </Button>
      
      <Button
        variant="primary"
        full-width
        @click="applyFilters"
      >
        Aplicar Filtros
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { CIUDADES_BOLIVIA } from '@/utils/constants.js'
import { debounce } from '@/utils/helpers.js'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Rating from '@/components/ui/Rating.vue'

// Props
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

// Events
const emit = defineEmits(['update:filters', 'apply', 'clear'])

// Estado local de filtros
const localFilters = ref({
  ciudad: '',
  capacidadMinima: null,
  capacidadMaxima: null,
  precioMin: null,
  precioMax: null,
  calificacion: null,
  ordenarPor: 'relevancia'
})

// Rangos predefinidos
const capacityRanges = [
  { label: '1-50', min: 1, max: 50 },
  { label: '51-100', min: 51, max: 100 },
  { label: '101-200', min: 101, max: 200 },
  { label: '201-500', min: 201, max: 500 },
  { label: '500+', min: 500, max: null }
]

const priceRanges = [
  { label: 'Hasta Bs. 1,000', min: 0, max: 1000 },
  { label: 'Bs. 1,000-3,000', min: 1000, max: 3000 },
  { label: 'Bs. 3,000-5,000', min: 3000, max: 5000 },
  { label: 'Bs. 5,000-10,000', min: 5000, max: 10000 },
  { label: 'Bs. 10,000+', min: 10000, max: null }
]

// Computed
const filtrosActivosCount = computed(() => {
  let count = 0
  if (localFilters.value.ciudad) count++
  if (localFilters.value.capacidadMinima) count++
  if (localFilters.value.capacidadMaxima) count++
  if (localFilters.value.precioMin) count++
  if (localFilters.value.precioMax) count++
  if (localFilters.value.calificacion) count++
  if (localFilters.value.ordenarPor !== 'relevancia') count++
  return count
})

// Watchers
watch(() => props.filters, (newFilters) => {
  Object.assign(localFilters.value, newFilters)
}, { immediate: true, deep: true })

// Métodos
const updateFilters = () => {
  emit('update:filters', { ...localFilters.value })
}

const updateFiltersDebounced = debounce(updateFilters, 500)

const setCapacityRange = (range) => {
  localFilters.value.capacidadMinima = range.min
  localFilters.value.capacidadMaxima = range.max
  updateFilters()
}

const setPriceRange = (range) => {
  localFilters.value.precioMin = range.min
  localFilters.value.precioMax = range.max
  updateFilters()
}

const isCapacityRangeActive = (range) => {
  return localFilters.value.capacidadMinima === range.min && 
         localFilters.value.capacidadMaxima === range.max
}

const isPriceRangeActive = (range) => {
  return localFilters.value.precioMin === range.min && 
         localFilters.value.precioMax === range.max
}

const clearAllFilters = () => {
  localFilters.value = {
    ciudad: '',
    capacidadMinima: null,
    capacidadMaxima: null,
    precioMin: null,
    precioMax: null,
    calificacion: null,
    ordenarPor: 'relevancia'
  }
  emit('clear')
  updateFilters()
}

const applyFilters = () => {
  emit('apply', { ...localFilters.value })
}

// Lifecycle
onMounted(() => {
  // Sincronizar con props iniciales
  Object.assign(localFilters.value, props.filters)
})
</script>

<style>
@import './busqueda.css';
</style>