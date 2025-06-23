<template>
  <DashboardLayout title="Mis Salones">
    <div class="space-y-6">
      
      <!-- Header con acciones -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Mis Salones 🏢
          </h1>
          <p class="mt-1 text-gray-600">
            Gestiona tus salones de eventos y sus configuraciones
          </p>
        </div>
        
        <div class="mt-4 sm:mt-0">
          <Button
            variant="primary"
            @click="goToCreate"
            class="w-full sm:w-auto"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            Agregar Salón
          </Button>
        </div>
      </div>

      <!-- Estadísticas rápidas -->
      <div v-if="stats" class="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-8 h-8 rounded-md bg-brand-primary">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1 w-0 ml-5">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Total Salones
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.total || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-8 h-8 rounded-md bg-brand-tertiary">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1 w-0 ml-5">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Aprobados
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.aprobados || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-8 h-8 rounded-md bg-brand-accent">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1 w-0 ml-5">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Pendientes
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.pendientes || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div class="p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-8 h-8 rounded-md bg-brand-secondary">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                </div>
              </div>
              <div class="flex-1 w-0 ml-5">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Consultas
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.consultasRecibidas || 0 }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Filtros y búsqueda -->
      <Card>
        <div class="p-6">
          <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
            <!-- Filtro por estado -->
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700">
                Estado
              </label>
              <Select
                v-model="filtros.estado"
                :options="estadoOptions"
                placeholder="Todos los estados"
                @update:model-value="handleFilterChange"
              />
            </div>

            <!-- Filtro por ciudad -->
            <div>
              <label class="block mb-1 text-sm font-medium text-gray-700">
                Ciudad
              </label>
              <Select
                v-model="filtros.ciudad"
                :options="CIUDADES_BOLIVIA"
                placeholder="Todas las ciudades"
                @update:model-value="handleFilterChange"
              />
            </div>

            <!-- Búsqueda por nombre -->
            <div class="md:col-span-2">
              <label class="block mb-1 text-sm font-medium text-gray-700">
                Buscar por nombre
              </label>
              <Input
                v-model="filtros.search"
                placeholder="Buscar salones..."
                @input="handleSearchDebounced"
              />
            </div>
          </div>
        </div>
      </Card>

      <!-- Loading state -->
      <div v-if="loading" class="space-y-4">
        <div v-for="n in 3" :key="n" class="animate-pulse">
          <Card>
            <div class="p-6">
              <div class="flex space-x-4">
                <div class="w-24 h-16 bg-gray-200 rounded"></div>
                <div class="flex-1 space-y-2">
                  <div class="w-3/4 h-4 bg-gray-200 rounded"></div>
                  <div class="w-1/2 h-3 bg-gray-200 rounded"></div>
                  <div class="w-1/4 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <!-- Lista de salones -->
      <div v-else-if="salones.length > 0" class="space-y-4">
        <Card
          v-for="salon in salones"
          :key="salon.id"
          class="transition-shadow duration-200 hover:shadow-md"
        >
          <div class="p-6">
            <div class="flex items-start justify-between">
              
              <!-- Información principal -->
              <div class="flex flex-1 space-x-4">
                <!-- Imagen -->
                <div class="flex-shrink-0">
                  <img
                    :src="salon.fotoPrincipal || '/images/placeholder-salon.jpg'"
                    :alt="salon.nombre"
                    class="object-cover w-24 h-16 rounded-lg"
                    @error="handleImageError"
                  />
                </div>

                <!-- Detalles -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold text-gray-900 truncate">
                      {{ salon.nombre }}
                    </h3>
                    <Badge :variant="getEstadoBadgeVariant(salon.estado)">
                      {{ getEstadoLabel(salon.estado, 'salon') }}
                    </Badge>
                  </div>
                  
                  <div class="space-y-1 text-sm text-gray-600">
                    <p class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      </svg>
                      {{ salon.ciudad }}
                    </p>
                    
                    <p class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      {{ formatCapacity(salon.capacidadMinima, salon.capacidadMaxima) }}
                    </p>
                    
                    <p class="flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                      </svg>
                      {{ salon.modeloPrecio === 'personalizado' ? 'Consultar' : formatPrice(salon.precioBase) }}
                      {{ salon.modeloPrecio === 'por_persona' ? '/persona' : '' }}
                    </p>

                    <div class="flex items-center mt-2">
                      <Rating :value="salon.calificacionPromedio || 0" :show-value="false" size="small" />
                      <span class="ml-2 text-xs">
                        {{ salon.calificacionPromedio?.toFixed(1) || '0.0' }} 
                        ({{ salon.totalResenas || 0 }} reseñas)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Acciones -->
              <div class="flex-shrink-0 ml-4">
                <div class="flex flex-col space-y-2">
                  
                  <!-- Ver salón -->
                  <Button
                    variant="outline-primary"
                    size="small"
                    @click="viewSalon(salon)"
                  >
                    Ver
                  </Button>

                  <!-- Editar -->
                  <Button
                    variant="outline-primary"
                    size="small"
                    @click="editSalon(salon)"
                  >
                    Editar
                  </Button>

                  <!-- Más acciones -->
                  <div class="relative">
                    <Button
                      variant="outline-primary"
                      size="small"
                      @click="toggleActionsMenu(salon.id)"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                      </svg>
                    </Button>

                    <!-- Dropdown de acciones -->
                    <div
                      v-if="showActionsMenu === salon.id"
                      class="absolute right-0 z-10 w-48 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5"
                    >
                      <div class="py-1">
                        <!-- Toggle visibilidad -->
                        <button
                          @click="toggleVisibility(salon)"
                          class="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          {{ salon.activo ? 'Ocultar' : 'Mostrar' }}
                        </button>

                        <!-- Duplicar -->
                        <button
                          @click="duplicateSalon(salon)"
                          class="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          Duplicar
                        </button>

                        <!-- Ver estadísticas -->
                        <button
                          @click="viewStats(salon)"
                          class="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                        >
                          Estadísticas
                        </button>

                        <!-- Separador -->
                        <div class="border-t border-gray-100"></div>

                        <!-- Eliminar -->
                        <button
                          @click="confirmDelete(salon)"
                          class="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Estado vacío -->
      <div v-else-if="!loading" class="py-12 text-center">
        <Card>
          <div class="p-12">
            <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
            </svg>
            
            <h3 class="mb-2 text-lg font-medium text-gray-900">
              {{ hasFilters ? 'No se encontraron salones' : 'No tienes salones registrados' }}
            </h3>
            
            <p class="mb-6 text-gray-500">
              {{ hasFilters 
                ? 'Intenta ajustar los filtros para encontrar salones.' 
                : 'Comienza agregando tu primer salón para empezar a recibir consultas.' 
              }}
            </p>

            <div class="flex justify-center space-x-3">
              <Button
                v-if="hasFilters"
                variant="outline-primary"
                @click="clearFilters"
              >
                Limpiar Filtros
              </Button>
              
              <Button
                variant="primary"
                @click="goToCreate"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                Agregar Primer Salón
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <!-- Paginación -->
      <div v-if="pagination.totalPages > 1">
        <Pagination
          :pagination="pagination"
          @page-change="handlePageChange"
        />
      </div>

      <!-- Modal de confirmación para eliminar -->
      <Modal
        v-model:show="showDeleteModal"
        title="Confirmar Eliminación"
        :hide-footer="true"
      >
        <div class="py-4">
          <div class="flex items-center mb-4">
            <svg class="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900">
              ¿Eliminar salón?
            </h3>
          </div>
          
          <p class="mb-6 text-gray-600">
            ¿Estás seguro de que deseas eliminar "<strong>{{ salonToDelete?.nombre }}</strong>"? 
            Esta acción no se puede deshacer.
          </p>

          <div class="flex justify-end space-x-3">
            <Button
              variant="outline-primary"
              @click="showDeleteModal = false"
            >
              Cancelar
            </Button>
            
            <Button
              variant="error"
              :loading="deleting"
              @click="deleteSalon"
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as salonesService from '@/services/salones.service.js'
import { formatPrice, formatCapacity, getEstadoLabel, debounce } from '@/utils/helpers.js'
import { CIUDADES_BOLIVIA } from '@/utils/constants.js'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import Rating from '@/components/ui/Rating.vue'
import Modal from '@/components/ui/Modal.vue'
import Pagination from '@/components/ui/Pagination.vue'

// Router
const router = useRouter()

// Estado
const salones = ref([])
const stats = ref(null)
const loading = ref(true)
const deleting = ref(false)
const showDeleteModal = ref(false)
const salonToDelete = ref(null)
const showActionsMenu = ref(null)

// Filtros
const filtros = ref({
  estado: '',
  ciudad: '',
  search: ''
})

// Paginación
const pagination = ref({
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0
})

// Opciones para filtros
const estadoOptions = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'pendiente', label: 'Pendiente Aprobación' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' },
  { value: 'suspendido', label: 'Suspendido' }
]

// Computed
const hasFilters = computed(() => {
  return filtros.value.estado || filtros.value.ciudad || filtros.value.search
})

// Watchers
watch(() => [filtros.value.estado, filtros.value.ciudad], () => {
  handleFilterChange()
}, { deep: true })

// Métodos
const loadSalones = async () => {
  loading.value = true
  
  try {
    const params = {
      ...filtros.value,
      page: pagination.value.page,
      limit: pagination.value.limit
    }
    
    // Limpiar parámetros vacíos
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key]
    })
    
    const data = await salonesService.getMisSalones(params)
    
    salones.value = data.salones || data
    if (data.pagination) {
      pagination.value = data.pagination
    }
    
  } catch (error) {
    console.error('Error loading salones:', error)
  } finally {
    loading.value = false
  }
}

const loadStats = async () => {
  try {
    const data = await salonesService.getMisSalonesStats()
    stats.value = data
  } catch (error) {
    console.error('Error loading stats:', error)
    stats.value = { total: 0, aprobados: 0, pendientes: 0, consultasRecibidas: 0 }
  }
}

const handleFilterChange = () => {
  pagination.value.page = 1
  loadSalones()
}

const handleSearchDebounced = debounce(() => {
  handleFilterChange()
}, 500)

const handlePageChange = (page) => {
  pagination.value.page = page
  loadSalones()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const clearFilters = () => {
  filtros.value = {
    estado: '',
    ciudad: '',
    search: ''
  }
  pagination.value.page = 1
  loadSalones()
}

const goToCreate = () => {
  router.push('/mis-salones/crear')
}

const viewSalon = (salon) => {
  if (salon.slug) {
    window.open(`/salones/${salon.slug}`, '_blank')
  } else {
    window.open(`/salones/detail/${salon.id}`, '_blank')
  }
}

const editSalon = (salon) => {
  router.push(`/mis-salones/${salon.id}/editar`)
}

const toggleActionsMenu = (salonId) => {
  showActionsMenu.value = showActionsMenu.value === salonId ? null : salonId
}

const toggleVisibility = async (salon) => {
  try {
    await salonesService.toggleSalonVisibility(salon.id, !salon.activo)
    
    // Actualizar localmente
    const index = salones.value.findIndex(s => s.id === salon.id)
    if (index !== -1) {
      salones.value[index].activo = !salon.activo
    }
    
    showActionsMenu.value = null
  } catch (error) {
    console.error('Error toggling visibility:', error)
  }
}

const duplicateSalon = (salon) => {
  router.push({
    path: '/mis-salones/crear',
    query: { duplicate: salon.id }
  })
}

const viewStats = (salon) => {
  // TODO: Implementar vista de estadísticas
  console.log('Ver estadísticas de:', salon.nombre)
  showActionsMenu.value = null
}

const confirmDelete = (salon) => {
  salonToDelete.value = salon
  showDeleteModal.value = true
  showActionsMenu.value = null
}

const deleteSalon = async () => {
  if (!salonToDelete.value) return
  
  deleting.value = true
  
  try {
    await salonesService.deleteSalon(salonToDelete.value.id)
    
    // Remover de la lista local
    salones.value = salones.value.filter(s => s.id !== salonToDelete.value.id)
    
    // Actualizar stats
    if (stats.value) {
      stats.value.total = Math.max(0, stats.value.total - 1)
    }
    
    showDeleteModal.value = false
    salonToDelete.value = null
    
  } catch (error) {
    console.error('Error deleting salon:', error)
  } finally {
    deleting.value = false
  }
}

const getEstadoBadgeVariant = (estado) => {
  const variants = {
    'borrador': 'secondary',
    'pendiente': 'warning',
    'aprobado': 'success',
    'rechazado': 'error',
    'suspendido': 'warning'
  }
  return variants[estado] || 'default'
}

const handleImageError = (event) => {
  event.target.src = '/images/placeholder-salon.jpg'
}

// Lifecycle
onMounted(async () => {
  document.title = 'Mis Salones - CECONBOL'
  await Promise.all([loadSalones(), loadStats()])
})

// Cerrar menú al hacer click fuera
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showActionsMenu.value = null
    }
  })
})
</script>

<style>
@import '../../components/salones/salones.css';
</style>