<template>
  <div class="salon-list">
    <!-- Loading State -->
    <div v-if="loading" class="salon-list-loading">
      <div 
        v-for="n in 6" 
        :key="n"
        class="salon-card-skeleton"
      >
      </div>
    </div>

    <!-- Lista de salones -->
    <div 
      v-else-if="hasSalones"
      class="salon-list-grid"
    >
      <SalonCard 
        v-for="salon in salones" 
        :key="salon.id"
        :salon="salon"
      />
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <div class="text-center py-12">
        <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ emptyTitle }}
        </h3>
        
        <p class="text-gray-500 mb-6 max-w-md mx-auto">
          {{ emptyMessage }}
        </p>

        <!-- Acciones según el contexto -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            v-if="showClearFilters"
            variant="outline-primary"
            @click="$emit('clear-filters')"
          >
            Limpiar Filtros
          </Button>
          
          <Button 
            variant="primary"
            @click="$emit('search-all')"
          >
            Ver Todos los Salones
          </Button>
        </div>
      </div>
    </div>

    <!-- Load More Button (si hay más resultados) -->
    <div 
      v-if="showLoadMore && !loading" 
      class="text-center mt-8"
    >
      <Button 
        variant="outline-primary"
        :loading="loadingMore"
        @click="$emit('load-more')"
      >
        Cargar Más Salones
      </Button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <div class="text-center py-8">
        <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Error al cargar salones
        </h3>
        
        <p class="text-gray-500 mb-4">
          {{ error }}
        </p>
        
        <Button 
          variant="primary"
          @click="$emit('retry')"
        >
          Intentar de nuevo
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SalonCard from './SalonCard.vue'
import Button from '@/components/ui/Button.vue'

// Props
const props = defineProps({
  salones: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingMore: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  hasFilters: {
    type: Boolean,
    default: false
  },
  canLoadMore: {
    type: Boolean,
    default: false
  },
  searchTerm: {
    type: String,
    default: ''
  }
})

// Events
defineEmits([
  'clear-filters',
  'search-all', 
  'load-more',
  'retry'
])

// Computed
const hasSalones = computed(() => props.salones.length > 0)

const showLoadMore = computed(() => {
  return hasSalones.value && props.canLoadMore && !props.error
})

const showClearFilters = computed(() => {
  return props.hasFilters && !hasSalones.value
})

const emptyTitle = computed(() => {
  if (props.hasFilters || props.searchTerm) {
    return 'No encontramos salones'
  }
  return 'No hay salones disponibles'
})

const emptyMessage = computed(() => {
  if (props.searchTerm) {
    return `No encontramos salones que coincidan con "${props.searchTerm}". Intenta con otros términos de búsqueda.`
  }
  if (props.hasFilters) {
    return 'No hay salones que coincidan con los filtros aplicados. Intenta ajustar tus criterios de búsqueda.'
  }
  return 'Aún no hay salones registrados en esta zona. ¡Vuelve pronto para ver nuevas opciones!'
})
</script>

<style>
@import './salones.css';
</style>