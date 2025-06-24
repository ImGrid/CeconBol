<template>
  <div class="search-bar">
    <div class="relative">
      <!-- Campo de búsqueda principal -->
      <div class="relative">
        <Input
          v-model="searchText"
          type="text"
          :placeholder="placeholder"
          class="search-input"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown.enter="handleEnter"
          @keydown.escape="clearSearch"
          @keydown.down="navigateSuggestions(1)"
          @keydown.up="navigateSuggestions(-1)"
        />
        
        <!-- Ícono de búsqueda -->
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Botón limpiar -->
        <button
          v-if="searchText"
          @click="clearSearch"
          class="absolute inset-y-0 right-0 flex items-center pr-3"
        >
          <svg class="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Dropdown de sugerencias -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="translate-y-1 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-1 opacity-0"
      >
        <div
          v-if="showSuggestions"
          class="suggestions-dropdown"
        >
          <!-- Sugerencias de autocompletado -->
          <div v-if="hasSugerencias && searchText.length >= 2" class="suggestions-section">
            <h4 class="suggestions-title">Sugerencias</h4>
            <ul>
              <li
                v-for="(sugerencia, index) in sugerencias"
                :key="`sugerencia-${index}`"
                @click="selectSuggestion(sugerencia)"
                :class="[
                  'suggestion-item',
                  { 'suggestion-active': selectedIndex === index }
                ]"
              >
                <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {{ sugerencia.texto || sugerencia.nombre }}
              </li>
            </ul>
          </div>

          <!-- Historial de búsquedas -->
          <div v-if="hasHistorial && searchText.length === 0" class="suggestions-section">
            <div class="flex items-center justify-between">
              <h4 class="suggestions-title">Búsquedas recientes</h4>
              <button
                @click="clearHistorial"
                class="text-xs text-gray-500 hover:text-gray-700"
              >
                Limpiar
              </button>
            </div>
            <ul>
              <li
                v-for="(item, index) in historial"
                :key="`historial-${index}`"
                @click="selectFromHistory(item)"
                :class="[
                  'suggestion-item',
                  { 'suggestion-active': selectedIndex === index }
                ]"
              >
                <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- Estado vacío -->
          <div v-if="!hasSugerencias && !hasHistorial && searchText.length >= 2" class="suggestions-section">
            <p class="py-2 text-sm text-center text-gray-500">
              No hay sugerencias disponibles
            </p>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Filtros rápidos (opcional) -->
    <div v-if="showQuickFilters" class="quick-filters">
      <div class="flex flex-wrap gap-2 mt-3">
        <Button
          v-for="filter in quickFilters"
          :key="filter.value"
          :variant="filter.active ? 'primary' : 'secondary'"
          size="small"
          @click="toggleQuickFilter(filter)"
        >
          {{ filter.label }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useBusqueda } from '@/composables/useBusqueda.js'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Buscar salones...'
  },
  showQuickFilters: {
    type: Boolean,
    default: false
  },
  autoFocus: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['update:modelValue', 'search', 'clear'])

// Composable
const {
  sugerencias,
  historial,
  hasSugerencias,
  hasHistorial,
  buscarSugerenciasDebounce,
  clearHistorial
} = useBusqueda()

// Estado local
const searchText = ref(props.modelValue)
const showSuggestions = ref(false)
const selectedIndex = ref(-1)

// Filtros rápidos
const quickFilters = ref([
  { label: 'La Paz', value: 'La Paz', active: false },
  { label: 'Santa Cruz', value: 'Santa Cruz', active: false },
  { label: 'Cochabamba', value: 'Cochabamba', active: false },
  { label: 'Hasta 100 personas', value: 'small', active: false },
  { label: 'Más de 200 personas', value: 'large', active: false }
])

// Watchers
watch(() => props.modelValue, (newValue) => {
  searchText.value = newValue
})

watch(searchText, (newValue) => {
  emit('update:modelValue', newValue)
  
  // Buscar sugerencias con debounce
  if (newValue.length >= 2) {
    buscarSugerenciasDebounce(newValue)
  }
})

// Computed
const totalSuggestions = computed(() => {
  if (searchText.value.length >= 2) {
    return sugerencias.value.length
  }
  return historial.value.length
})

// Métodos
const handleInput = () => {
  selectedIndex.value = -1
  if (searchText.value.length === 0) {
    emit('clear')
  }
}

const handleFocus = () => {
  showSuggestions.value = true
}

const handleBlur = () => {
  // Delay para permitir clicks en sugerencias
  setTimeout(() => {
    showSuggestions.value = false
    selectedIndex.value = -1
  }, 200)
}

const handleEnter = () => {
  if (selectedIndex.value >= 0) {
    // Seleccionar sugerencia activa
    if (searchText.value.length >= 2 && hasSugerencias.value) {
      selectSuggestion(sugerencias.value[selectedIndex.value])
    } else if (hasHistorial.value) {
      selectFromHistory(historial.value[selectedIndex.value])
    }
  } else {
    // Buscar con el texto actual
    performSearch()
  }
}

const navigateSuggestions = (direction) => {
  if (!showSuggestions.value) return
  
  const max = totalSuggestions.value - 1
  selectedIndex.value += direction
  
  if (selectedIndex.value > max) {
    selectedIndex.value = 0
  } else if (selectedIndex.value < 0) {
    selectedIndex.value = max
  }
}

const selectSuggestion = (sugerencia) => {
  searchText.value = sugerencia.texto || sugerencia.nombre
  showSuggestions.value = false
  performSearch()
}

const selectFromHistory = (item) => {
  searchText.value = item
  showSuggestions.value = false
  performSearch()
}

const clearSearch = () => {
  searchText.value = ''
  selectedIndex.value = -1
  emit('clear')
}

const performSearch = () => {
  if (searchText.value.trim()) {
    emit('search', searchText.value.trim())
  }
}

const toggleQuickFilter = (filter) => {
  filter.active = !filter.active
  
  // Emitir evento con filtros activos
  const activeFilters = quickFilters.value.filter(f => f.active)
  emit('quick-filter', activeFilters)
}

// Lifecycle
onMounted(() => {
  if (props.autoFocus) {
    // Focus automático si se solicita
  }
})
</script>

<style>
@import './busqueda.css';
</style>