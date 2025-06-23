<template>
  <DashboardLayout title="Crear Salón">
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            {{ isEditMode ? 'Editar Salón' : 'Crear Nuevo Salón' }} 🏢
          </h1>
          <p class="mt-1 text-gray-600">
            {{ isEditMode 
              ? 'Actualiza la información de tu salón' 
              : 'Agrega un nuevo salón a tu inventario y comienza a recibir consultas'
            }}
          </p>
        </div>
        
        <div class="mt-4 sm:mt-0">
          <Button
            variant="outline-primary"
            @click="goBack"
            class="w-full sm:w-auto"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Volver
          </Button>
        </div>
      </div>

      <!-- Progress indicator -->
      <div v-if="!isEditMode" class="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div class="flex items-center justify-between text-sm">
          <span class="text-gray-600">Progreso del formulario</span>
          <span class="font-medium text-gray-900">{{ formProgress }}%</span>
        </div>
        <div class="w-full h-2 mt-2 bg-gray-200 rounded-full">
          <div 
            class="h-2 transition-all duration-300 rounded-full bg-brand-primary"
            :style="{ width: `${formProgress}%` }"
          ></div>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div class="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-brand-primary"></div>
          <p class="text-gray-600">{{ isEditMode ? 'Cargando datos del salón...' : 'Preparando formulario...' }}</p>
        </div>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="p-6 border border-red-200 rounded-lg bg-red-50">
        <div class="flex items-center">
          <svg class="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <h3 class="font-medium text-red-800">{{ isEditMode ? 'Error al cargar el salón' : 'Error al preparar el formulario' }}</h3>
            <p class="mt-1 text-red-700">{{ error }}</p>
          </div>
        </div>
        <div class="mt-4">
          <Button variant="outline-primary" @click="retry">
            Intentar de nuevo
          </Button>
        </div>
      </div>

      <!-- Formulario principal -->
      <div v-else>
        <SalonForm
          v-model="formData"
          :is-edit-mode="isEditMode"
          :show-progress="!isEditMode"
          @submit="handleSubmit"
          @step-change="handleStepChange"
        />
      </div>

      <!-- Modal de confirmación al salir -->
      <Modal
        v-model:show="showExitModal"
        title="¿Abandonar el formulario?"
        :hide-footer="true"
      >
        <div class="py-4">
          <div class="flex items-center mb-4">
            <svg class="w-6 h-6 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="text-lg font-medium text-gray-900">
              Tienes cambios sin guardar
            </h3>
          </div>
          
          <p class="mb-6 text-gray-600">
            Si sales ahora, perderás todos los cambios realizados en el formulario. 
            ¿Estás seguro de que deseas continuar?
          </p>

          <div class="flex justify-end space-x-3">
            <Button
              variant="outline-primary"
              @click="showExitModal = false"
            >
              Cancelar
            </Button>
            
            <Button
              variant="secondary"
              @click="saveAsDraft"
              v-if="!isEditMode"
            >
              Guardar Borrador
            </Button>
            
            <Button
              variant="error"
              @click="confirmExit"
            >
              Salir sin Guardar
            </Button>
          </div>
        </div>
      </Modal>

      <!-- Modal de éxito -->
      <Modal
        v-model:show="showSuccessModal"
        :title="isEditMode ? 'Salón actualizado' : 'Salón creado'"
        :hide-footer="true"
      >
        <div class="py-4 text-center">
          <div class="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          
          <h3 class="mb-2 text-lg font-semibold text-gray-900">
            {{ isEditMode ? '¡Salón actualizado exitosamente!' : '¡Salón creado exitosamente!' }}
          </h3>
          
          <p class="mb-6 text-gray-600">
            {{ isEditMode 
              ? 'Los cambios en tu salón han sido guardados correctamente.' 
              : 'Tu salón ha sido enviado para revisión. Te notificaremos cuando esté aprobado.'
            }}
          </p>

          <div class="flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="outline-primary" @click="goToMisSalones">
              Ver Mis Salones
            </Button>
            
            <Button variant="primary" @click="viewSalon" v-if="createdSalon">
              Ver Salón
            </Button>
            
            <Button variant="secondary" @click="createAnother" v-if="!isEditMode">
              Crear Otro Salón
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import * as salonesService from '@/services/salones.service.js'
import { useAuth } from '@/composables/useAuth.js'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import SalonForm from '@/components/salones/SalonForm.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'

// Router y route
const route = useRoute()
const router = useRouter()

// Composables
const { user } = useAuth()

// Estado
const loading = ref(true)
const error = ref('')
const formData = ref({})
const currentStep = ref(0)
const totalSteps = ref(5)
const showExitModal = ref(false)
const showSuccessModal = ref(false)
const createdSalon = ref(null)
const hasUnsavedChanges = ref(false)
const isDuplicating = ref(false)

// Computed
const isEditMode = computed(() => !!route.params.id)
const salonId = computed(() => route.params.id)

const formProgress = computed(() => {
  if (totalSteps.value === 0) return 0
  return Math.round(((currentStep.value + 1) / totalSteps.value) * 100)
})

// Watchers
watch(formData, () => {
  hasUnsavedChanges.value = true
}, { deep: true })

// Métodos
const loadInitialData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    if (isEditMode.value) {
      // Cargar datos del salón para editar
      const salon = await salonesService.getSalonById(salonId.value)
      formData.value = salon
      document.title = `Editar ${salon.nombre} - CECONBOL`
    } else {
      // Verificar si se está duplicando un salón
      const duplicateId = route.query.duplicate
      if (duplicateId) {
        const salonToDuplicate = await salonesService.getSalonById(duplicateId)
        
        // Copiar datos pero limpiar algunos campos
        formData.value = {
          ...salonToDuplicate,
          nombre: `${salonToDuplicate.nombre} (Copia)`,
          id: null,
          estado: 'borrador',
          fotos: [], // Las fotos no se duplican
          slug: null
        }
        
        isDuplicating.value = true
        document.title = `Duplicar ${salonToDuplicate.nombre} - CECONBOL`
      } else {
        // Formulario nuevo
        formData.value = getDefaultFormData()
        document.title = 'Crear Nuevo Salón - CECONBOL'
      }
    }
  } catch (err) {
    console.error('Error loading initial data:', err)
    error.value = err.message || 'Error al cargar los datos'
  } finally {
    loading.value = false
  }
}

const getDefaultFormData = () => {
  return {
    // Información básica
    nombre: '',
    descripcion: '',
    direccion: '',
    ciudad: '',
    
    // Capacidad y precios
    capacidadMinima: null,
    capacidadMaxima: null,
    modeloPrecio: 'fijo',
    precioBase: null,
    
    // Contacto
    telefonoContacto: '',
    emailContacto: '',
    whatsapp: '',
    
    // Servicios
    servicios: [],
    
    // Metadatos
    estado: 'borrador',
    activo: true,
    destacado: false
  }
}

const handleSubmit = async (submitData) => {
  try {
    let result
    
    if (isEditMode.value) {
      // Actualizar salón existente
      result = await salonesService.updateSalon(salonId.value, submitData)
    } else {
      // Crear nuevo salón
      result = await salonesService.createSalon(submitData)
    }
    
    createdSalon.value = result
    hasUnsavedChanges.value = false
    showSuccessModal.value = true
    
  } catch (err) {
    console.error('Error saving salon:', err)
    error.value = err.message || 'Error al guardar el salón'
  }
}

const handleStepChange = (step) => {
  currentStep.value = step
}

const saveAsDraft = async () => {
  try {
    if (isEditMode.value) {
      // Para edición, simplemente guardar
      await handleSubmit(formData.value)
    } else {
      // Para nuevo salón, guardar como borrador
      const draftData = { ...formData.value, estado: 'borrador' }
      const result = await salonesService.saveSalonDraft(draftData)
      
      createdSalon.value = result
      hasUnsavedChanges.value = false
      
      // Ir a edición del borrador
      router.push(`/mis-salones/${result.id}/editar`)
    }
  } catch (err) {
    console.error('Error saving draft:', err)
    error.value = err.message || 'Error al guardar el borrador'
  }
}

const goBack = () => {
  if (hasUnsavedChanges.value) {
    showExitModal.value = true
  } else {
    router.go(-1)
  }
}

const confirmExit = () => {
  hasUnsavedChanges.value = false
  showExitModal.value = false
  router.go(-1)
}

const goToMisSalones = () => {
  router.push('/mis-salones')
}

const viewSalon = () => {
  if (createdSalon.value) {
    const url = createdSalon.value.slug 
      ? `/salones/${createdSalon.value.slug}`
      : `/salones/detail/${createdSalon.value.id}`
    
    window.open(url, '_blank')
  }
}

const createAnother = () => {
  hasUnsavedChanges.value = false
  showSuccessModal.value = false
  router.push('/mis-salones/crear')
}

const retry = () => {
  loadInitialData()
}

// Guard para prevenir salida accidental
onBeforeRouteLeave((to, from, next) => {
  if (hasUnsavedChanges.value && !showExitModal.value) {
    showExitModal.value = true
    next(false)
  } else {
    next()
  }
})

// Lifecycle
onMounted(() => {
  loadInitialData()
})

// Cleanup
onBeforeUnmount(() => {
  // Cleanup si es necesario
})
</script>

<style>
@import '../../components/salones/salones.css';
</style>