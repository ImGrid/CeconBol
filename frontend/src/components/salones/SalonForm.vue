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
              v-bind="createFieldProps(validation, 'nombre')"
              label="Nombre del Salón"
              placeholder="Ej: Salón Fiesta Imperial"
              required
              help-text="Nombre que aparecerá en las búsquedas"
            />
          </div>

          <!-- Ciudad -->
          <div class="form-group">
            <Select
              v-bind="createFieldProps(validation, 'ciudad')"
              label="Ciudad"
              placeholder="Selecciona la ciudad"
              :options="CIUDADES_BOLIVIA"
              required
            />
          </div>

          <!-- Dirección -->
          <div class="form-group">
            <Input
              v-bind="createFieldProps(validation, 'direccion')"
              label="Dirección"
              placeholder="Calle, número y zona"
              required
              help-text="Dirección completa del salón"
            />
          </div>

          <!-- Descripción -->
          <div class="col-span-2 form-group">
            <TextArea
              v-bind="createFieldProps(validation, 'descripcion')"
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
            <Input
              v-bind="createFieldProps(validation, 'capacidadMinima')"
              type="number"
              label="Capacidad Mínima"
              placeholder="50"
              min="1"
              max="10000"
              required
              help-text="Número mínimo de invitados"
            />
          </div>

          <div class="form-group">
            <Input
              v-bind="createFieldProps(validation, 'capacidadMaxima')"
              type="number"
              label="Capacidad Máxima"
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
              Modelo de Precio <span class="ml-1 text-red-500">*</span>
            </label>
            <div class="space-y-3">
              <div 
                v-for="modelo in modelosPrecios" 
                :key="modelo.value"
                class="price-model-option"
              >
                <label class="flex items-start space-x-3 cursor-pointer">
                  <input
                    v-model="validation.formData.modeloPrecio"
                    type="radio"
                    :value="modelo.value"
                    class="mt-1 radio-brand"
                    @change="validation.handleFieldChange('modeloPrecio', modelo.value)"
                  />
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ modelo.label }}</div>
                    <div class="text-sm text-gray-600">{{ modelo.description }}</div>
                  </div>
                </label>
              </div>
            </div>
            <p v-if="validation.errors.modeloPrecio" class="input-error-message">
              {{ validation.errors.modeloPrecio }}
            </p>
          </div>

          <!-- Precio base (solo si no es personalizado) -->
          <div v-if="validation.formData.modeloPrecio !== 'personalizado'" class="col-span-2 form-group">
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
                    v-bind="createFieldProps(validation, 'precioBase')"
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
              <div v-if="validation.formData.precioBase" class="price-preview">
                <label class="form-label">Vista Previa</label>
                <div class="p-4 rounded-lg bg-gray-50">
                  <div class="text-2xl font-bold text-brand-primary">
                    {{ formatPrice(validation.formData.precioBase) }}
                  </div>
                  <div class="text-sm text-gray-600">
                    {{ validation.formData.modeloPrecio === 'por_persona' ? 'por persona' : 'precio fijo' }}
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
              v-bind="createFieldProps(validation, 'telefonoContacto')"
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
              v-bind="createFieldProps(validation, 'whatsapp')"
              type="tel"
              label="WhatsApp (opcional)"
              placeholder="70123456"
              help-text="Para contacto directo por WhatsApp"
            />
          </div>

          <!-- Email -->
          <div class="col-span-2 form-group">
            <Input
              v-bind="createFieldProps(validation, 'emailContacto')"
              type="email"
              label="Email de Contacto (opcional)"
              placeholder="contacto@misalon.com"
              help-text="Email alternativo para consultas"
            />
          </div>
        </div>
      </div>
    </Card>

    <!-- Paso 4: Fotos -->
    <Card v-if="currentStep === 3" class="form-step">
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
          :disabled="validation.isSubmitting"
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
            :loading="validation.isSubmitting"
            :disabled="!validation.isValid || validation.isSubmitting"
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
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { formatPrice } from '@/utils/helpers.js'
import { CIUDADES_BOLIVIA } from '@/utils/constants.js'
import { useSalonFormValidation, createFieldProps } from '@/composables/useFormValidation.js'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Select from '@/components/ui/Select.vue'
import TextArea from '@/components/ui/TextArea.vue'
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
  }
})

// Events
const emit = defineEmits(['submit', 'update:modelValue', 'step-change'])

// ✅ USAR COMPOSABLE CORRECTAMENTE
const validation = useSalonFormValidation({
  nombre: '',
  descripcion: '',
  direccion: '',
  ciudad: '',
  capacidadMinima: null,
  capacidadMaxima: null,
  modeloPrecio: 'fijo',
  precioBase: null,
  telefonoContacto: '',
  emailContacto: '',
  whatsapp: '',
  ...props.modelValue
})

// Estado local
const currentStep = ref(0)
const uploadedPhotos = ref([])

// Configuración
const formSteps = [
  { key: 'basic', label: 'Información Básica' },
  { key: 'capacity', label: 'Capacidad y Precios' },
  { key: 'contact', label: 'Contacto' },
  { key: 'photos', label: 'Fotos' }
]

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

// Computed
const getStepClass = (index) => {
  const baseClass = 'progress-step'
  if (index < currentStep.value) return `${baseClass} step-completed`
  if (index === currentStep.value) return `${baseClass} step-current`
  return `${baseClass} step-pending`
}

const canProceedToNext = () => {
  switch (currentStep.value) {
    case 0: // Información básica
      return validation.formData.nombre && validation.formData.ciudad && 
             validation.formData.direccion && validation.formData.descripcion &&
             !validation.errors.nombre && !validation.errors.descripcion
    case 1: // Capacidad y precios
      return validation.formData.capacidadMinima && validation.formData.capacidadMaxima && 
             validation.formData.modeloPrecio &&
             (validation.formData.modeloPrecio === 'personalizado' || validation.formData.precioBase)
    case 2: // Contacto
      return validation.formData.telefonoContacto && !validation.errors.telefonoContacto
    case 3: // Fotos
      return props.isEditMode || uploadedPhotos.value.length > 0
    default:
      return true
  }
}

const getPriceHelpText = () => {
  if (validation.formData.modeloPrecio === 'fijo') {
    return 'Precio total del salón independiente del número de invitados'
  } else if (validation.formData.modeloPrecio === 'por_persona') {
    return 'Precio por cada invitado (se multiplicará por la cantidad)'
  }
  return ''
}

// Métodos
const nextStep = () => {
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

const handlePhotosUploaded = (photos) => {
  uploadedPhotos.value = photos
  validation.formData.fotos = photos
}

const handlePhotoError = (error) => {
  console.error('Error uploading photos:', error)
}

// ✅ USAR COMPOSABLE PARA SUBMIT
const handleSubmit = async () => {
  const result = await validation.handleSubmit(async (formData) => {
    // Agregar fotos si hay
    if (uploadedPhotos.value.length > 0) {
      formData.fotos = uploadedPhotos.value
    }
    
    emit('submit', formData)
    emit('update:modelValue', formData)
    
    return formData
  })
  
  if (!result.success) {
    console.error('Form validation failed:', result.errors)
  }
}

// Lifecycle
onMounted(() => {
  if (props.modelValue && Object.keys(props.modelValue).length > 0) {
    Object.assign(validation.formData, props.modelValue)
  }
})
</script>

<style>
@import './salones.css';
</style>