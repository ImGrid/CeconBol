<template>
  <form @submit.prevent="handleSubmit" class="salon-form">
    <!-- Progreso del formulario -->
    <div v-if="showProgress" class="form-progress">
      <div class="progress-steps">
        <div 
          v-for="(step, index) in formSteps" 
          :key="step.key"
          :class="getStepClass(index)"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <span class="step-label">{{ step.label }}</span>
        </div>
      </div>
    </div>

    <!-- Paso 1: Información Básica -->
    <Card v-if="currentStep === 0" class="form-step">
      <div class="form-step-header">
        <h2 class="form-step-title">Información Básica</h2>
        <p class="form-step-description">
          Datos principales de tu salón de eventos
        </p>
      </div>

      <div class="form-step-content">
        <div class="form-grid">
          <!-- Nombre del salón -->
          <div class="col-span-2 form-group">
            <Input
              v-bind="createFieldProps('nombre')"
              label="Nombre del Salón"
              placeholder="Ej: Salón Fiesta Imperial"
              required
              help-text="Nombre que aparecerá en las búsquedas"
            />
          </div>

          <!-- Ciudad -->
          <div class="form-group">
            <Select
              v-bind="createSelectProps('ciudad')"
              label="Ciudad"
              placeholder="Selecciona la ciudad"
              :options="CIUDADES_BOLIVIA"
              required
            />
          </div>

          <!-- Dirección -->
          <div class="form-group">
            <Input
              v-bind="createFieldProps('direccion')"
              label="Dirección"
              placeholder="Calle, número y zona"
              required
              help-text="Dirección completa del salón"
            />
          </div>

          <!-- Descripción -->
          <div class="col-span-2 form-group">
            <TextArea
              v-bind="createFieldProps('descripcion')"
              label="Descripción"
              placeholder="Describe tu salón, sus características principales, ambiente, estilo decorativo..."
              :rows="4"
              :max-length="1000"
              required
              help-text="Una buena descripción ayuda a atraer más clientes (mínimo 50 caracteres)"
            />
          </div>
        </div>
      </div>
    </Card>

    <!-- Paso 2: Capacidad y Precios -->
    <Card v-if="currentStep === 1" class="form-step">
      <div class="form-step-header">
        <h2 class="form-step-title">Capacidad y Precios</h2>
        <p class="form-step-description">
          Define la capacidad y el modelo de precios de tu salón
        </p>
      </div>

      <div class="form-step-content">
        <div class="form-grid">
          <!-- Capacidad -->
          <div class="form-group">
            <label class="form-label">
              Capacidad Mínima <span class="text-red-500">*</span>
            </label>
            <Input
              v-bind="createFieldProps('capacidadMinima')"
              type="number"
              placeholder="50"
              min="1"
              max="10000"
              required
              help-text="Número mínimo de invitados"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              Capacidad Máxima <span class="text-red-500">*</span>
            </label>
            <Input
              v-bind="createFieldProps('capacidadMaxima')"
              type="number"
              placeholder="200"
              min="1"
              max="10000"
              required
              help-text="Número máximo de invitados"
            />
          </div>

          <!-- Modelo de precio -->
          <div class="col-span-2 form-group">
            <label class="form-label">
              Modelo de Precio <span class="text-red-500">*</span>
            </label>
            <div class="space-y-3">
              <div 
                v-for="modelo in modelosPrecios" 
                :key="modelo.value"
                class="price-model-option"
              >
                <label class="flex items-start space-x-3 cursor-pointer">
                  <input
                    v-model="formData.modeloPrecio"
                    type="radio"
                    :value="modelo.value"
                    class="mt-1 radio-brand"
                    @change="handleFieldChange('modeloPrecio', modelo.value)"
                  />
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ modelo.label }}</div>
                    <div class="text-sm text-gray-600">{{ modelo.description }}</div>
                  </div>
                </label>
              </div>
            </div>
            <p v-if="errors.modeloPrecio" class="input-error-message">
              {{ errors.modeloPrecio }}
            </p>
          </div>

          <!-- Precio base (solo si no es personalizado) -->
          <div v-if="formData.modeloPrecio !== 'personalizado'" class="col-span-2 form-group">
            <div class="grid gap-4 md:grid-cols-2">
              <div>
                <label class="form-label">
                  Precio Base <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <span class="absolute text-gray-500 transform -translate-y-1/2 left-3 top-1/2">
                    Bs.
                  </span>
                  <Input
                    v-bind="createFieldProps('precioBase')"
                    type="number"
                    placeholder="2500"
                    min="100"
                    max="1000000"
                    class="pl-8"
                    required
                  />
                </div>
                <p class="mt-1 text-sm text-gray-500">
                  {{ getPriceHelpText() }}
                </p>
              </div>

              <!-- Vista previa del precio -->
              <div v-if="formData.precioBase" class="price-preview">
                <label class="form-label">Vista Previa</label>
                <div class="p-4 rounded-lg bg-gray-50">
                  <div class="text-2xl font-bold text-brand-primary">
                    {{ formatPrice(formData.precioBase) }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ formData.modeloPrecio === 'por_persona' ? 'por persona' : 'precio fijo' }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>

    <!-- Paso 3: Contacto -->
    <Card v-if="currentStep === 2" class="form-step">
      <div class="form-step-header">
        <h2 class="form-step-title">Información de Contacto</h2>
        <p class="form-step-description">
          Datos para que los clientes puedan contactarte
        </p>
      </div>

      <div class="form-step-content">
        <div class="form-grid">
          <!-- Teléfono principal -->
          <div class="form-group">
            <Input
              v-bind="createFieldProps('telefonoContacto')"
              type="tel"
              label="Teléfono Principal"
              placeholder="70123456"
              required
              help-text="7 u 8 dígitos sin espacios"
            />
          </div>

          <!-- WhatsApp -->
          <div class="form-group">
            <Input
              v-bind="createFieldProps('whatsapp')"
              type="tel"
              label="WhatsApp (opcional)"
              placeholder="70123456"
              help-text="Para contacto directo por WhatsApp"
            />
          </div>

          <!-- Email -->
          <div class="col-span-2 form-group">
            <Input
              v-bind="createFieldProps('emailContacto')"
              type="email"
              label="Email de Contacto (opcional)"
              placeholder="contacto@misalon.com"
              help-text="Email alternativo para consultas"
            />
          </div>
        </div>
      </div>
    </Card>

    <!-- Paso 4: Servicios -->
    <Card v-if="currentStep === 3" class="form-step">
      <div class="form-step-header">
        <h2 class="form-step-title">Servicios del Salón</h2>
        <p class="form-step-description">
          Define qué servicios incluye tu salón y cuáles son adicionales
        </p>
      </div>

      <div class="form-step-content">
        <!-- Servicios básicos incluidos -->
        <div class="services-section">
          <h3 class="services-section-title">Servicios Incluidos</h3>
          <p class="services-section-description">
            Servicios que están incluidos en el precio base
          </p>
          
          <div class="services-grid">
            <Checkbox
              v-for="servicio in serviciosBasicos"
              :key="servicio.nombre"
              :model-value="isServicioIncluido(servicio.nombre)"
              @update:model-value="toggleServicioIncluido(servicio.nombre)"
              :label="servicio.nombre"
              :description="servicio.descripcion"
              variant="brand"
            />
          </div>
        </div>

        <!-- Servicios adicionales -->
        <div class="services-section">
          <h3 class="services-section-title">Servicios Adicionales</h3>
          <p class="services-section-description">
            Servicios con costo adicional que ofreces
          </p>

          <div class="space-y-4">
            <div 
              v-for="(servicio, index) in serviciosAdicionales" 
              :key="`adicional-${index}`"
              class="additional-service-item"
            >
              <div class="service-header">
                <Input
                  v-model="servicio.nombre"
                  placeholder="Nombre del servicio"
                  label="Servicio"
                  class="flex-1"
                />
                
                <div class="service-price">
                  <label class="form-label">Costo Adicional</label>
                  <div class="flex space-x-2">
                    <div class="relative flex-1">
                      <span class="absolute text-sm text-gray-500 transform -translate-y-1/2 left-3 top-1/2">
                        Bs.
                      </span>
                      <Input
                        v-model="servicio.costoAdicional"
                        type="number"
                        placeholder="150"
                        min="0"
                        class="pl-8"
                      />
                    </div>
                    
                    <Select
                      v-model="servicio.tipoCosto"
                      :options="tiposCosto"
                      placeholder="Tipo"
                      class="w-32"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  @click="removeServicioAdicional(index)"
                  class="service-remove-btn"
                  title="Eliminar servicio"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <TextArea
                v-model="servicio.descripcion"
                placeholder="Descripción del servicio (opcional)"
                :rows="2"
                :max-length="200"
              />
            </div>

            <Button
              type="button"
              variant="outline-primary"
              size="small"
              @click="addServicioAdicional"
              class="add-service-btn"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              Agregar Servicio Adicional
            </Button>
          </div>
        </div>
      </div>
    </Card>

    <!-- Paso 5: Fotos -->
    <Card v-if="currentStep === 4" class="form-step">
      <div class="form-step-header">
        <h2 class="form-step-title">Fotos del Salón</h2>
        <p class="form-step-description">
          Sube fotos atractivas de tu salón para atraer más clientes
        </p>
      </div>

      <div class="form-step-content">
        <ImageUpload
          v-model="uploadedPhotos"
          label="Fotos del Salón"
          :required="!isEditMode"
          :multiple="true"
          :max-files="10"
          help-text="Sube entre 3 y 10 fotos. La primera será la foto principal."
          upload-text="Arrastra las fotos de tu salón aquí"
          support-text="JPG, PNG o WebP hasta 5MB cada una"
          @upload-complete="handlePhotosUploaded"
          @upload-error="handlePhotoError"
        />
      </div>
    </Card>

    <!-- Navigation buttons -->
    <div class="form-navigation">
      <div class="nav-buttons">
        <Button
          v-if="currentStep > 0"
          type="button"
          variant="outline-primary"
          @click="previousStep"
          :disabled="isSubmitting"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Anterior
        </Button>

        <div class="flex ml-auto space-x-3">
          <Button
            v-if="currentStep < formSteps.length - 1"
            type="button"
            variant="primary"
            @click="nextStep"
            :disabled="!canProceedToNext()"
          >
            Siguiente
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </Button>

          <Button
            v-else
            type="submit"
            variant="success"
            :loading="isSubmitting"
            :disabled="!isValid || isSubmitting"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            {{ isEditMode ? 'Actualizar Salón' : 'Crear Salón' }}
          </Button>
        </div>
      </div>

      <!-- Progress indicator -->
      <div class="form-progress-bar">
        <div class="progress-track">
          <div 
            class="progress-fill"
            :style="{ width: `${((currentStep + 1) / formSteps.length) * 100}%` }"
          ></div>
        </div>
        <span class="progress-text">
          Paso {{ currentStep + 1 }} de {{ formSteps.length }}
        </span>
      </div>
    </div>

    <!-- Debug info (solo en desarrollo) -->
    <div v-if="isDev && showDebug" class="debug-info">
      <details class="debug-panel">
        <summary>Debug Info</summary>
        <div class="debug-content">
          <h4>Form Data:</h4>
          <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
          <h4>Errors:</h4>
          <pre>{{ JSON.stringify(errors, null, 2) }}</pre>
          <h4>Validation State:</h4>
          <pre>isValid: {{ isValid }}, touched: {{ Object.keys(touched).length }}</pre>
        </div>
      </details>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSalonFormValidation, createFieldProps, createSelectProps } from '@/composables/useFormValidation.js'
import { formatPrice } from '@/utils/helpers.js'
import { CIUDADES_BOLIVIA } from '@/utils/constants.js'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import TextArea from '@/components/ui/TextArea.vue'
import Checkbox from '@/components/ui/Checkbox.vue'
import Button from '@/components/ui/Button.vue'
import ImageUpload from '@/components/common/ImageUpload.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({})
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  showDebug: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['submit', 'update:modelValue', 'step-change'])

// Form validation composable
const {
  formData,
  errors,
  touched,
  isValid,
  isSubmitting,
  handleFieldChange,
  handleFieldBlur,
  handleFieldFocus,
  handleSubmit,
  setFormData
} = useSalonFormValidation(props.modelValue)

// Estado local
const currentStep = ref(0)
const uploadedPhotos = ref([])

// Configuración
const isDev = computed(() => import.meta.env.DEV)

// Pasos del formulario
const formSteps = [
  { key: 'basic', label: 'Información Básica' },
  { key: 'capacity', label: 'Capacidad y Precios' },
  { key: 'contact', label: 'Contacto' },
  { key: 'services', label: 'Servicios' },
  { key: 'photos', label: 'Fotos' }
]

// Modelos de precio
const modelosPrecios = [
  {
    value: 'fijo',
    label: 'Precio Fijo',
    description: 'Un precio único independiente del número de invitados'
  },
  {
    value: 'por_persona',
    label: 'Precio por Persona',
    description: 'El precio total se calcula multiplicando por el número de invitados'
  },
  {
    value: 'personalizado',
    label: 'Consultar Precio',
    description: 'El precio se negocia directamente con cada cliente'
  }
]

// Servicios básicos predefinidos
const serviciosBasicos = [
  { nombre: 'Mesas y Sillas', descripcion: 'Mobiliario básico para el evento' },
  { nombre: 'Sonido Básico', descripcion: 'Sistema de audio para música ambiente' },
  { nombre: 'Iluminación', descripcion: 'Luces básicas del salón' },
  { nombre: 'Aire Acondicionado', descripcion: 'Climatización del ambiente' },
  { nombre: 'Estacionamiento', descripcion: 'Espacio para vehículos' },
  { nombre: 'Baños', descripcion: 'Servicios higiénicos' },
  { nombre: 'Cocina/Kitchenette', descripcion: 'Espacio para preparación' },
  { nombre: 'Seguridad', descripcion: 'Servicio de vigilancia' }
]

// Servicios adicionales (dinámicos)
const serviciosAdicionales = ref([])

// Tipos de costo para servicios adicionales
const tiposCosto = [
  { value: 'fijo', label: 'Fijo' },
  { value: 'por_persona', label: 'Por persona' },
  { value: 'por_hora', label: 'Por hora' }
]

// Computed
const getStepClass = (index) => {
  const baseClass = 'progress-step'
  if (index < currentStep.value) return `${baseClass} step-completed`
  if (index === currentStep.value) return `${baseClass} step-current`
  return `${baseClass} step-pending`
}

const canProceedToNext = () => {
  // Validaciones por paso
  switch (currentStep.value) {
    case 0: // Información básica
      return formData.nombre && formData.ciudad && formData.direccion && formData.descripcion
    case 1: // Capacidad y precios
      return formData.capacidadMinima && formData.capacidadMaxima && formData.modeloPrecio &&
             (formData.modeloPrecio === 'personalizado' || formData.precioBase)
    case 2: // Contacto
      return formData.telefonoContacto
    case 3: // Servicios
      return true // Los servicios son opcionales
    case 4: // Fotos
      return props.isEditMode || uploadedPhotos.value.length > 0
    default:
      return true
  }
}

const getPriceHelpText = () => {
  if (formData.modeloPrecio === 'fijo') {
    return 'Precio total del salón independiente del número de invitados'
  } else if (formData.modeloPrecio === 'por_persona') {
    return 'Precio por cada invitado (se multiplicará por la cantidad)'
  }
  return ''
}

// Métodos de servicios
const isServicioIncluido = (nombreServicio) => {
  return formData.servicios?.some(s => s.nombre === nombreServicio && s.incluido) || false
}

const toggleServicioIncluido = (nombreServicio) => {
  if (!formData.servicios) {
    formData.servicios = []
  }
  
  const index = formData.servicios.findIndex(s => s.nombre === nombreServicio)
  
  if (index >= 0) {
    if (formData.servicios[index].incluido) {
      // Si está incluido, removerlo
      formData.servicios.splice(index, 1)
    } else {
      // Si no está incluido, marcarlo como incluido
      formData.servicios[index].incluido = true
    }
  } else {
    // Agregar como servicio incluido
    formData.servicios.push({
      nombre: nombreServicio,
      incluido: true,
      costoAdicional: 0
    })
  }
}

const addServicioAdicional = () => {
  serviciosAdicionales.value.push({
    nombre: '',
    descripcion: '',
    costoAdicional: '',
    tipoCosto: 'fijo'
  })
}

const removeServicioAdicional = (index) => {
  serviciosAdicionales.value.splice(index, 1)
}

// Navegación entre pasos
const nextStep = async () => {
  if (currentStep.value < formSteps.length - 1) {
    currentStep.value++
    emit('step-change', currentStep.value)
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
    emit('step-change', currentStep.value)
  }
}

// Manejo de fotos
const handlePhotosUploaded = (photos) => {
  uploadedPhotos.value = photos
  formData.fotos = photos
}

const handlePhotoError = (error) => {
  console.error('Error uploading photos:', error)
}

// Submit del formulario
const onSubmit = async (formData) => {
  // Agregar servicios adicionales al formData
  if (serviciosAdicionales.value.length > 0) {
    const serviciosValidos = serviciosAdicionales.value.filter(s => 
      s.nombre && s.costoAdicional
    )
    
    serviciosValidos.forEach(servicio => {
      if (!formData.servicios) formData.servicios = []
      formData.servicios.push({
        ...servicio,
        incluido: false
      })
    })
  }
  
  // Emitir evento de submit
  emit('submit', formData)
  emit('update:modelValue', formData)
}

// Helpers para crear props de campos
const createFieldProps = (fieldName) => {
  return createFieldProps({ formData, errors, handleFieldChange, handleFieldBlur, handleFieldFocus }, fieldName)
}

const createSelectProps = (fieldName) => {
  return createSelectProps({ formData, errors, handleFieldChange, handleFieldBlur, handleFieldFocus }, fieldName)
}

// Lifecycle
onMounted(() => {
  if (props.modelValue && Object.keys(props.modelValue).length > 0) {
    setFormData(props.modelValue)
    
    // Cargar servicios adicionales si existen
    const serviciosAd = props.modelValue.servicios?.filter(s => !s.incluido) || []
    serviciosAdicionales.value = serviciosAd.map(s => ({
      nombre: s.nombre,
      descripcion: s.descripcion || '',
      costoAdicional: s.costoAdicional,
      tipoCosto: s.tipoCosto || 'fijo'
    }))
  }
})
</script>

<style>
@import './salones.css';

/* Salon Form Styles */
.salon-form {
  @apply max-w-4xl mx-auto space-y-8;
}

/* Form Progress */
.form-progress {
  @apply mb-8;
}

.progress-steps {
  @apply flex items-center justify-between;
}

.progress-step {
  @apply flex items-center space-x-3 text-sm;
}

.step-number {
  @apply w-8 h-8 rounded-full flex items-center justify-center font-medium;
}

.step-completed .step-number {
  @apply bg-brand-tertiary text-white;
}

.step-current .step-number {
  @apply bg-brand-primary text-white;
}

.step-pending .step-number {
  @apply bg-gray-200 text-gray-600;
}

.step-label {
  @apply font-medium;
}

.step-completed .step-label,
.step-current .step-label {
  @apply text-gray-900;
}

.step-pending .step-label {
  @apply text-gray-500;
}

/* Form Steps */
.form-step {
  @apply space-y-6;
}

.form-step-header {
  @apply border-b border-gray-200 pb-4;
}

.form-step-title {
  @apply text-xl font-semibold text-gray-900 mb-2;
}

.form-step-description {
  @apply text-gray-600;
}

.form-step-content {
  @apply space-y-6;
}

/* Form Grid */
.form-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6;
}

.col-span-2 {
  @apply md:col-span-2;
}

/* Price Models */
.price-model-option {
  @apply p-4 border border-gray-200 rounded-lg hover:border-brand-primary transition-colors;
}

.price-preview {
  @apply flex flex-col;
}

/* Services */
.services-section {
  @apply space-y-4;
}

.services-section-title {
  @apply text-lg font-semibold text-gray-900;
}

.services-section-description {
  @apply text-sm text-gray-600;
}

.services-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.additional-service-item {
  @apply space-y-3 p-4 border border-gray-200 rounded-lg;
}

.service-header {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end;
}

.service-price {
  @apply space-y-2;
}

.service-remove-btn {
  @apply p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors self-start;
}

.add-service-btn {
  @apply w-full md:w-auto;
}

/* Navigation */
.form-navigation {
  @apply border-t border-gray-200 pt-6 space-y-4;
}

.nav-buttons {
  @apply flex items-center justify-between;
}

.form-progress-bar {
  @apply flex items-center justify-between;
}

.progress-track {
  @apply flex-1 bg-gray-200 rounded-full h-2 mr-4;
}

.progress-fill {
  @apply h-full bg-brand-primary rounded-full transition-all duration-300;
}

.progress-text {
  @apply text-sm text-gray-600 whitespace-nowrap;
}

/* Debug */
.debug-info {
  @apply mt-8 border-t border-gray-200 pt-6;
}

.debug-panel {
  @apply cursor-pointer;
}

.debug-content {
  @apply mt-4 space-y-4;
}

.debug-content h4 {
  @apply font-medium text-gray-900;
}

.debug-content pre {
  @apply text-xs bg-gray-100 p-3 rounded overflow-x-auto;
}

/* Responsive */
@media (max-width: 768px) {
  .progress-steps {
    @apply flex-col space-y-4;
  }
  
  .progress-step {
    @apply flex-row justify-start;
  }
  
  .form-grid {
    @apply grid-cols-1;
  }
  
  .col-span-2 {
    @apply col-span-1;
  }
  
  .service-header {
    @apply grid-cols-1 gap-3;
  }
}
</style>