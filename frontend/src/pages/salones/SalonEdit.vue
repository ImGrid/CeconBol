<template>
  <DashboardLayout title="Editar Salón">
    <div class="space-y-6">
      
      <!-- Header con información del salón -->
      <div class="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-brand-primary">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </div>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-gray-900">
                  {{ salonData?.nombre || 'Editar Salón' }}
                </h1>
                <p class="text-gray-600">
                  Actualiza la información y configuración de tu salón
                </p>
              </div>
            </div>
          </div>
          
          <div class="flex items-center mt-4 space-x-3 sm:mt-0">
            <!-- Estado del salón -->
            <Badge v-if="salonData" :variant="getEstadoBadgeVariant(salonData.estado)">
              {{ getEstadoLabel(salonData.estado, 'salon') }}
            </Badge>
            
            <!-- Botón volver -->
            <Button
              variant="outline-primary"
              @click="goBack"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Volver
            </Button>
          </div>
        </div>

        <!-- Información adicional del salón -->
        <div v-if="salonData" class="grid grid-cols-1 gap-4 mt-6 md:grid-cols-3">
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            </svg>
            {{ salonData.ciudad }}
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            {{ formatCapacity(salonData.capacidadMinima, salonData.capacidadMaxima) }}
          </div>
          <div class="flex items-center text-sm text-gray-600">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0v10h8V7m-8 0h8m-4-4v4m0 0l3 3m-3-3l-3 3"/>
            </svg>
            Creado {{ formatDate(salonData.createdAt, 'relative') }}
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-brand-primary"></div>
          <p class="text-gray-600">Cargando datos del salón...</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="p-6 border border-red-200 rounded-lg bg-red-50">
        <div class="flex items-center">
          <svg class="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="font-medium text-red-800">Error al cargar el salón</h3>
            <p class="mt-1 text-red-700">{{ error }}</p>
          </div>
        </div>
        <div class="mt-4">
          <Button variant="outline-primary" @click="loadSalonData">
            Intentar de nuevo
          </Button>
        </div>
      </div>

      <!-- Tabs para diferentes secciones de edición -->
      <div v-else-if="salonData">
        <Tabs v-model="activeTab" :tabs="editionTabs" @tab-change="handleTabChange">
          
          <!-- Tab: Información Básica -->
          <template #informacion>
            <Card>
              <SalonForm
                v-model="formData"
                :is-edit-mode="true"
                :show-progress="false"
                @submit="handleSubmit"
              />
            </Card>
          </template>

          <!-- Tab: Galería de Fotos -->
          <template #galeria>
            <Card>
              <SalonGallery
                :salon-id="salonId"
                :fotos="salonData.fotos || []"
                @update:fotos="handlePhotosUpdate"
                @photo-uploaded="handlePhotoUploaded"
                @photo-deleted="handlePhotoDeleted"
              />
            </Card>
          </template>

          <!-- Tab: Estadísticas -->
          <template #estadisticas>
            <div class="space-y-6">
              <!-- Métricas del salón -->
              <Card>
                <div class="p-6">
                  <h3 class="mb-4 text-lg font-semibold text-gray-900">
                    Estadísticas del Salón
                  </h3>
                  
                  <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div class="p-4 rounded-lg bg-blue-50">
                      <div class="text-2xl font-bold text-blue-700">
                        {{ salonStats.totalConsultas || 0 }}
                      </div>
                      <div class="text-sm text-blue-600">Consultas Recibidas</div>
                    </div>
                    
                    <div class="p-4 rounded-lg bg-green-50">
                      <div class="text-2xl font-bold text-green-700">
                        {{ salonStats.eventosConfirmados || 0 }}
                      </div>
                      <div class="text-sm text-green-600">Eventos Confirmados</div>
                    </div>
                    
                    <div class="p-4 rounded-lg bg-amber-50">
                      <div class="text-2xl font-bold text-amber-700">
                        {{ salonData.calificacionPromedio?.toFixed(1) || '0.0' }}
                      </div>
                      <div class="text-sm text-amber-600">Calificación Promedio</div>
                    </div>
                    
                    <div class="p-4 rounded-lg bg-purple-50">
                      <div class="text-2xl font-bold text-purple-700">
                        {{ salonStats.totalResenas || 0 }}
                      </div>
                      <div class="text-sm text-purple-600">Reseñas Recibidas</div>
                    </div>
                  </div>
                </div>
              </Card>

              <!-- Gráfico de consultas (placeholder) -->
              <Card>
                <div class="p-6">
                  <h3 class="mb-4 text-lg font-semibold text-gray-900">
                    Consultas por Mes
                  </h3>
                  <div class="flex items-center justify-center h-64 rounded-lg bg-gray-50">
                    <p class="text-gray-500">Gráfico de estadísticas (próximamente)</p>
                  </div>
                </div>
              </Card>
            </div>
          </template>

          <!-- Tab: Configuración -->
          <template #configuracion>
            <div class="space-y-6">
              <!-- Visibilidad -->
              <Card>
                <div class="p-6">
                  <h3 class="mb-4 text-lg font-semibold text-gray-900">
                    Visibilidad del Salón
                  </h3>
                  
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div>
                        <h4 class="font-medium text-gray-900">Salón Activo</h4>
                        <p class="text-sm text-gray-600">
                          Controla si tu salón aparece en las búsquedas
                        </p>
                      </div>
                      <div class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="salonData.activo"
                          @change="toggleVisibility"
                          class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-brand-primary focus:ring-brand-primary"
                        />
                      </div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div>
                        <h4 class="font-medium text-gray-900">Salón Destacado</h4>
                        <p class="text-sm text-gray-600">
                          {{ salonData.destacado ? 'Tu salón aparece en la sección destacados' : 'Contacta soporte para destacar tu salón' }}
                        </p>
                      </div>
                      <Badge :variant="salonData.destacado ? 'premium' : 'secondary'">
                        {{ salonData.destacado ? 'Destacado' : 'Normal' }}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>

              <!-- Acciones peligrosas -->
              <Card>
                <div class="p-6">
                  <h3 class="mb-4 text-lg font-semibold text-red-700">
                    Zona de Peligro
                  </h3>
                  
                  <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div>
                        <h4 class="font-medium text-red-900">Eliminar Salón</h4>
                        <p class="text-sm text-red-700">
                          Esta acción no se puede deshacer. Se eliminarán todos los datos.
                        </p>
                      </div>
                      <Button variant="error" @click="confirmDelete">
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </template>
        </Tabs>
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
              ¿Eliminar "{{ salonData?.nombre }}"?
            </h3>
          </div>
          
          <p class="mb-6 text-gray-600">
            Esta acción eliminará permanentemente el salón y toda su información, 
            incluyendo fotos, estadísticas y consultas asociadas. Esta acción no se puede deshacer.
          </p>

          <div class="p-4 mb-6 border rounded-lg bg-amber-50 border-amber-200">
            <div class="flex">
              <svg class="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div>
                <h4 class="font-medium text-amber-800">Consideraciones:</h4>
                <ul class="mt-1 space-y-1 text-sm text-amber-700">
                  <li>• Las consultas en proceso se cancelarán</li>
                  <li>• Los eventos confirmados se verán afectados</li>
                  <li>• Las reseñas del salón se mantendrán como historial</li>
                </ul>
              </div>
            </div>
          </div>

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
              Eliminar Permanentemente
            </Button>
          </div>
        </div>
      </Modal>

      <!-- Modal de éxito -->
      <Modal
        v-model:show="showSuccessModal"
        title="Cambios guardados"
        :hide-footer="true"
      >
        <div class="py-4 text-center">
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          
          <h3 class="mb-2 text-lg font-semibold text-gray-900">
            ¡Salón actualizado exitosamente!
          </h3>
          
          <p class="mb-6 text-gray-600">
            Los cambios en tu salón han sido guardados correctamente.
          </p>

          <Button variant="primary" @click="showSuccessModal = false">
            Continuar
          </Button>
        </div>
      </Modal>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as salonesService from '@/services/salones.service.js'
import { formatDate, formatCapacity, getEstadoLabel } from '@/utils/helpers.js'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import SalonForm from '@/components/salones/SalonForm.vue'
import SalonGallery from '@/components/salones/SalonGallery.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Modal from '@/components/ui/Modal.vue'
import Tabs from '@/components/ui/Tabs.vue'

// Router
const route = useRoute()
const router = useRouter()

// Estado
const loading = ref(true)
const error = ref('')
const deleting = ref(false)
const salonData = ref(null)
const formData = ref({})
const salonStats = ref({})
const activeTab = ref('informacion')
const showDeleteModal = ref(false)
const showSuccessModal = ref(false)

// Computed
const salonId = computed(() => route.params.id)

const editionTabs = computed(() => [
  {
    key: 'informacion',
    label: 'Información',
    icon: 'InfoIcon'
  },
  {
    key: 'galeria',
    label: 'Galería',
    icon: 'PhotoIcon',
    badge: salonData.value?.fotos?.length || null
  },
  {
    key: 'estadisticas',
    label: 'Estadísticas',
    icon: 'ChartIcon'
  },
  {
    key: 'configuracion',
    label: 'Configuración',
    icon: 'CogIcon'
  }
])

// Métodos
const loadSalonData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const [salon, stats] = await Promise.all([
      salonesService.getSalonById(salonId.value),
      loadSalonStats()
    ])
    
    salonData.value = salon
    formData.value = { ...salon }
    salonStats.value = stats
    
    document.title = `Editar ${salon.nombre} - CECONBOL`
  } catch (err) {
    console.error('Error loading salon:', err)
    error.value = err.message || 'Error al cargar el salón'
  } finally {
    loading.value = false
  }
}

const loadSalonStats = async () => {
  try {
    // Esto debería venir de un endpoint específico del salón
    return {
      totalConsultas: 15,
      eventosConfirmados: 8,
      totalResenas: 12
    }
  } catch (error) {
    console.error('Error loading salon stats:', error)
    return {}
  }
}

const handleSubmit = async (submitData) => {
  try {
    const updatedSalon = await salonesService.updateSalon(salonId.value, submitData)
    salonData.value = updatedSalon
    showSuccessModal.value = true
  } catch (err) {
    console.error('Error updating salon:', err)
    error.value = err.message || 'Error al actualizar el salón'
  }
}

const handleTabChange = ({ key }) => {
  activeTab.value = key
}

const handlePhotosUpdate = (photos) => {
  if (salonData.value) {
    salonData.value.fotos = photos
  }
}

const handlePhotoUploaded = (photos) => {
  console.log('Photos uploaded:', photos)
}

const handlePhotoDeleted = (photoId) => {
  console.log('Photo deleted:', photoId)
}

const toggleVisibility = async () => {
  try {
    await salonesService.toggleSalonVisibility(salonId.value, salonData.value.activo)
    showSuccessModal.value = true
  } catch (err) {
    console.error('Error toggling visibility:', err)
    error.value = 'Error al cambiar la visibilidad'
    // Revertir el cambio
    salonData.value.activo = !salonData.value.activo
  }
}

const confirmDelete = () => {
  showDeleteModal.value = true
}

const deleteSalon = async () => {
  deleting.value = true
  
  try {
    await salonesService.deleteSalon(salonId.value)
    router.push('/mis-salones')
  } catch (err) {
    console.error('Error deleting salon:', err)
    error.value = err.message || 'Error al eliminar el salón'
  } finally {
    deleting.value = false
    showDeleteModal.value = false
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

const goBack = () => {
  router.go(-1)
}

// Lifecycle
onMounted(() => {
  loadSalonData()
})
</script>

<style>
@import '../../components/salones/salones.css';
</style>