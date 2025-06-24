<template>
  <DefaultLayout>
    <div class="px-2 py-8 mx-auto max-w-screen-2xl sm:px-4 lg:px-6">
      
      <!-- Header con búsqueda -->
      <div class="mb-8">
        <div class="mb-6 text-center">
          <h1 class="mb-2 text-3xl font-bold text-gray-900">
            Encuentra tu Salón Ideal
          </h1>
          <p class="max-w-2xl mx-auto text-lg text-gray-600">
            Descubre los mejores salones de eventos en Bolivia para tu celebración especial
          </p>
        </div>

        <!-- Barra de búsqueda principal -->
        <div class="max-w-2xl mx-auto">
          <SearchBar
            v-model="searchQuery"
            placeholder="Buscar por nombre, ciudad o tipo de evento..."
            :show-quick-filters="false"
            @search="handleSearch"
            @clear="handleClearSearch"
          />
        </div>
      </div>

      <!-- Layout principal -->
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-6 xl:gap-6 lg:grid-cols-4 lg:gap-6">
        
        <!-- Sidebar de filtros -->
        <div class="xl:col-span-2 lg:col-span-1">
          <FilterSidebar
            v-model="filtros"
            :result-count="pagination?.total || 0"
            @apply-filters="handleApplyFilters"
            @clear-filters="handleClearFilters"
          />
        </div>

        <!-- Contenido principal -->
        <div class="mt-6 xl:col-span-4 lg:col-span-3 lg:mt-0">
          
          <!-- Header de resultados -->
          <div class="flex flex-col mb-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900">
                {{ getResultsTitle() }}
              </h2>
              <p v-if="!loading && hasResultados" class="mt-1 text-sm text-gray-600">
                {{ pagination?.total || 0 }} {{ (pagination?.total || 0) === 1 ? 'resultado' : 'resultados' }} encontrados
              </p>
            </div>

            <!-- Ordenamiento rápido -->
            <div class="mt-4 sm:mt-0">
              <select
                v-model="filtros.ordenarPor"
                @change="handleSortChange"
                class="form-select"
              >
                <option value="relevancia">Más relevantes</option>
                <option value="calificacion">Mejor calificados</option>
                <option value="precio">Precio: menor a mayor</option>
                <option value="precio-desc">Precio: mayor a menor</option>
                <option value="nombre">Nombre A-Z</option>
                <option value="fecha">Más recientes</option>
              </select>
            </div>
          </div>

          <!-- Lista de salones -->
          <SalonList
            :salones="resultados || []"
            :loading="loading || false"
            :loading-more="loadingMore || false"
            :error="error || ''"
            :has-filters="hasActiveFilters"
            :can-load-more="canLoadMore"
            :search-term="searchQuery"
            @clear-filters="handleClearFilters"
            @search-all="handleSearchAll"
            @load-more="handleLoadMore"
            @retry="handleRetry"
          />

          <!-- Paginación -->
          <div v-if="!loading && hasResultados && (pagination?.totalPages || 0) > 1" class="mt-8">
            <Pagination
              :pagination="pagination"
              @page-change="handlePageChange"
            />
          </div>
        </div>
      </div>

      <!-- Salones destacados (sin cambios, mantener como estaba) -->
      <div v-if="!hasSearchOrFilters && !loading" class="mt-16">
        <div class="mb-8 text-center">
          <h2 class="mb-2 text-2xl font-bold text-gray-900">
            Salones Destacados
          </h2>
          <p class="text-gray-600">
            Los salones mejor valorados por nuestros usuarios
          </p>
        </div>

        <div v-if="salonesDestacados.length > 0" class="salon-list-grid">
          <SalonCard
            v-for="salon in salonesDestacados"
            :key="`destacado-${salon.id}`"
            :salon="salon"
          />
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBusqueda } from '@/composables/useBusqueda.js'
import * as busquedaService from '@/services/busqueda.service.js'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import SearchBar from '@/components/busqueda/SearchBar.vue'
import FilterSidebar from '@/components/busqueda/FilterSidebar.vue'
import SalonList from '@/components/salones/SalonList.vue'
import SalonCard from '@/components/salones/SalonCard.vue'
import Pagination from '@/components/ui/Pagination.vue'

// Router
const route = useRoute()
const router = useRouter()

// Composables
const {
  resultados,
  loading,
  error,
  filtros,
  pagination,
  hasResultados,
  filtrosActivos,
  buscarSalones,
  cargarMasResultados,
  aplicarFiltros,
  limpiarFiltros,
  clearError
} = useBusqueda()

// Estado local
const searchQuery = ref('')
const loadingMore = ref(false)
const salonesDestacados = ref([])

// ✅ DECLARAR FUNCIONES ANTES DE USARLAS EN WATCHERS

const updateFromQueryParams = (query) => {
  try {
    // Actualizar filtros desde URL
    if (query.q) searchQuery.value = query.q
    if (query.ciudad) filtros.ciudad = query.ciudad
    if (query.capacidad) {
      filtros.capacidadMinima = parseInt(query.capacidad)
    }
    // ... más parámetros según sea necesario
  } catch (error) {
    console.error('Error updating from query params:', error)
  }
}

const updateQueryParams = () => {
  try {
    // Actualizar URL con filtros actuales
    const query = {}
    
    if (searchQuery.value) query.q = searchQuery.value
    if (filtros?.ciudad) query.ciudad = filtros.ciudad
    if (filtros?.capacidadMinima) query.capacidad = filtros.capacidadMinima
    
    router.replace({ query })
  } catch (error) {
    console.error('Error updating query params:', error)
  }
}

// Computed con verificaciones null
const hasActiveFilters = computed(() => {
  try {
    return (filtrosActivos?.value || false) || searchQuery.value.length > 0
  } catch (error) {
    console.error('Error in hasActiveFilters:', error)
    return false
  }
})

const hasSearchOrFilters = computed(() => {
  try {
    return hasActiveFilters.value
  } catch (error) {
    console.error('Error in hasSearchOrFilters:', error)
    return false
  }
})

const canLoadMore = computed(() => {
  try {
    return (pagination?.value?.page || 0) < (pagination?.value?.totalPages || 0)
  } catch (error) {
    console.error('Error in canLoadMore:', error)
    return false
  }
})

// ✅ WATCHERS CON VERIFICACIONES

// Watchers
watch(() => route.query, (newQuery) => {
  // Sincronizar con query parameters de la URL
  if (newQuery) {
    updateFromQueryParams(newQuery)
  }
}, { immediate: true })

// Métodos con verificaciones null
const handleSearch = async (texto) => {
  try {
    searchQuery.value = texto || ''
    if (filtros) {
      filtros.texto = texto || ''
    }
    await performSearch()
  } catch (error) {
    console.error('Error in handleSearch:', error)
  }
}

const handleClearSearch = () => {
  try {
    searchQuery.value = ''
    if (filtros) {
      filtros.texto = ''
    }
    performSearch()
  } catch (error) {
    console.error('Error in handleClearSearch:', error)
  }
}

const handleApplyFilters = async (newFilters) => {
  try {
    if (filtros && newFilters) {
      Object.assign(filtros, newFilters)
    }
    await performSearch()
  } catch (error) {
    console.error('Error in handleApplyFilters:', error)
  }
}

const handleClearFilters = () => {
  try {
    searchQuery.value = ''
    if (limpiarFiltros) {
      limpiarFiltros()
    }
    performSearch()
  } catch (error) {
    console.error('Error in handleClearFilters:', error)
  }
}

const handleSortChange = () => {
  try {
    performSearch()
  } catch (error) {
    console.error('Error in handleSortChange:', error)
  }
}

const handlePageChange = (page) => {
  try {
    if (pagination?.value) {
      pagination.value.page = page
    }
    performSearch()
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error) {
    console.error('Error in handlePageChange:', error)
  }
}

const handleLoadMore = async () => {
  try {
    loadingMore.value = true
    if (cargarMasResultados) {
      await cargarMasResultados()
    }
  } catch (error) {
    console.error('Error in handleLoadMore:', error)
  } finally {
    loadingMore.value = false
  }
}

const handleSearchAll = () => {
  try {
    handleClearFilters()
  } catch (error) {
    console.error('Error in handleSearchAll:', error)
  }
}

const handleRetry = () => {
  try {
    if (clearError) {
      clearError()
    }
    performSearch()
  } catch (error) {
    console.error('Error in handleRetry:', error)
  }
}

const performSearch = async () => {
  try {
    if (buscarSalones) {
      await buscarSalones()
      updateQueryParams()
    }
  } catch (error) {
    console.error('Error in performSearch:', error)
  }
}

// ✅ FUNCIÓN getResultsTitle CON VERIFICACIONES NULL
const getResultsTitle = () => {
  try {
    if (loading?.value) return 'Buscando salones...'
    if (error?.value) return 'Error en la búsqueda'
    if (!hasResultados?.value && hasActiveFilters.value) return 'No se encontraron salones'
    if (!hasResultados?.value) return 'No hay salones disponibles'
    if (searchQuery.value) return `Resultados para "${searchQuery.value}"`
    if (filtrosActivos?.value) return 'Salones filtrados'
    return 'Todos los salones'
  } catch (err) {
    console.error('Error in getResultsTitle:', err)
    return 'Buscando salones...'
  }
}

const loadSalonesDestacados = async () => {
  try {
    const destacados = await busquedaService.getSalonesDestacados(6)
    salonesDestacados.value = destacados || []
  } catch (error) {
    console.error('Error loading featured salones:', error)
    salonesDestacados.value = []
  }
}

// Lifecycle
onMounted(async () => {
  try {
    // Actualizar título de la página
    document.title = 'Buscar Salones - CECONBOL'
    
    // Cargar datos iniciales
    await Promise.all([
      performSearch(),
      loadSalonesDestacados()
    ])
  } catch (error) {
    console.error('Error in onMounted:', error)
  }
})
</script>

<style>
@import '../../components/busqueda/busqueda.css';
@import '../../components/salones/salones.css';
</style>