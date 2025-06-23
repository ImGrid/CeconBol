<template>
  <div class="salon-gallery-manager">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">
        Galería de Fotos
      </h3>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">
          {{ fotos.length }}/{{ maxFotos }} fotos
        </span>
        <Button
          v-if="canAddMore"
          variant="outline-primary"
          size="small"
          @click="triggerUpload"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Agregar Fotos
        </Button>
      </div>
    </div>

    <!-- Upload Area (si no hay fotos) -->
    <div v-if="fotos.length === 0" class="upload-area-empty">
      <ImageUpload
        v-model="uploadedFiles"
        :multiple="true"
        :max-files="maxFotos"
        :auto-upload="false"
        label=""
        upload-text="Sube las fotos de tu salón"
        support-text="JPG, PNG o WebP hasta 5MB cada una. Primera foto será la principal."
        @upload-complete="handlePhotosUploaded"
        @upload-error="handleUploadError"
      />
    </div>

    <!-- Galería Existente -->
    <div v-else class="gallery-grid">
      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Foto Principal -->
      <div class="gallery-main-photo">
        <div class="relative overflow-hidden rounded-lg aspect-video group">
          <img
            :src="fotoPrincipal.url"
            :alt="fotoPrincipal.textoAlternativo || 'Foto principal'"
            class="object-cover w-full h-full"
          />
          
          <!-- Overlay de controles -->
          <div class="absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100">
            <div class="flex space-x-2">
              <button
                @click="openPhotoModal(fotoPrincipal, 0)"
                class="p-2 text-white transition-colors bg-black bg-opacity-50 rounded hover:bg-opacity-70"
                title="Ver foto"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
              </button>
              
              <button
                @click="editPhoto(fotoPrincipal)"
                class="p-2 text-white transition-colors bg-black bg-opacity-50 rounded hover:bg-opacity-70"
                title="Editar foto"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              
              <button
                v-if="fotos.length > 1"
                @click="deletePhoto(fotoPrincipal.id)"
                class="p-2 text-white transition-colors bg-red-500 rounded bg-opacity-70 hover:bg-opacity-90"
                title="Eliminar foto"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Badge de foto principal -->
          <div class="absolute top-2 left-2">
            <Badge variant="premium" size="small">
              📸 Principal
            </Badge>
          </div>
        </div>
        
        <div class="mt-2">
          <p class="text-sm font-medium text-gray-900">Foto Principal</p>
          <p class="text-xs text-gray-600">Esta será la primera imagen que vean los clientes</p>
        </div>
      </div>

      <!-- Fotos Secundarias -->
      <div class="gallery-secondary-photos">
        <h4 class="mb-3 text-sm font-medium text-gray-900">
          Fotos Adicionales ({{ fotosSecundarias.length }})
        </h4>
        
        <div class="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          <!-- Fotos existentes -->
          <div
            v-for="(foto, index) in fotosSecundarias"
            :key="foto.id"
            class="relative overflow-hidden rounded-lg aspect-square group"
          >
            <img
              :src="foto.url"
              :alt="foto.textoAlternativo || `Foto ${index + 2}`"
              class="object-cover w-full h-full"
            />
            
            <!-- Overlay de controles -->
            <div class="absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100">
              <div class="flex space-x-1">
                <button
                  @click="openPhotoModal(foto, index + 1)"
                  class="p-1 text-white transition-colors bg-black bg-opacity-50 rounded hover:bg-opacity-70"
                  title="Ver foto"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </button>
                
                <button
                  @click="setAsPrincipal(foto.id)"
                  class="p-1 text-white transition-colors bg-blue-500 rounded bg-opacity-70 hover:bg-opacity-90"
                  title="Hacer principal"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                </button>
                
                <button
                  @click="deletePhoto(foto.id)"
                  class="p-1 text-white transition-colors bg-red-500 rounded bg-opacity-70 hover:bg-opacity-90"
                  title="Eliminar foto"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Botón agregar más -->
          <div
            v-if="canAddMore"
            @click="triggerUpload"
            class="flex flex-col items-center justify-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer aspect-square hover:border-brand-primary hover:bg-brand-primary hover:bg-opacity-5"
          >
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span class="mt-1 text-xs text-gray-500">Agregar</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Vista de Foto -->
    <Modal
      v-model:show="showPhotoModal"
      :title="`Foto ${currentPhotoIndex + 1} de ${fotos.length}`"
      size="xl"
      :hide-footer="true"
    >
      <div v-if="currentPhoto" class="space-y-4">
        <div class="relative">
          <img
            :src="currentPhoto.url"
            :alt="currentPhoto.textoAlternativo"
            class="object-contain w-full bg-gray-900 h-96"
          />
          
          <!-- Controles de navegación -->
          <button
            v-if="fotos.length > 1"
            @click="previousPhoto"
            class="absolute p-2 text-white transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full top-1/2 left-4 hover:bg-opacity-70"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          
          <button
            v-if="fotos.length > 1"
            @click="nextPhoto"
            class="absolute p-2 text-white transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full top-1/2 right-4 hover:bg-opacity-70"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        
        <!-- Información de la foto -->
        <div class="space-y-2">
          <Input
            v-model="currentPhoto.textoAlternativo"
            label="Descripción de la foto"
            placeholder="Describe esta foto..."
            @blur="updatePhotoDescription"
          />
          
          <div class="flex items-center justify-between text-sm text-gray-600">
            <span>{{ formatFileSize(currentPhoto.tamaño) }}</span>
            <button
              v-if="!currentPhoto.esPrincipal"
              @click="setAsPrincipal(currentPhoto.id)"
              class="px-3 py-1 text-xs text-blue-700 transition-colors bg-blue-100 rounded hover:bg-blue-200"
            >
              Hacer Principal
            </button>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Estado de subida -->
    <div v-if="uploading" class="mt-4">
      <div class="p-4 border border-blue-200 rounded-lg bg-blue-50">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-blue-900">
            Subiendo fotos...
          </span>
          <span class="text-sm text-blue-700">
            {{ uploadProgress }}%
          </span>
        </div>
        <div class="w-full h-2 bg-blue-200 rounded-full">
          <div
            class="h-2 transition-all duration-300 bg-blue-600 rounded-full"
            :style="{ width: `${uploadProgress}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Mensajes de error -->
    <div v-if="error" class="mt-4 alert-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useImageUpload } from '@/composables/useImageUpload.js'
import * as uploadService from '@/services/upload.service.js'
import { formatFileSize } from '@/utils/helpers.js'
import ImageUpload from '@/components/common/ImageUpload.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Modal from '@/components/ui/Modal.vue'
import Input from '@/components/ui/Input.vue'

// Props
const props = defineProps({
  salonId: {
    type: [String, Number],
    required: true
  },
  fotos: {
    type: Array,
    default: () => []
  },
  maxFotos: {
    type: Number,
    default: 10
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['update:fotos', 'photo-uploaded', 'photo-deleted', 'photo-updated'])

// Estado local
const fileInputRef = ref(null)
const showPhotoModal = ref(false)
const currentPhotoIndex = ref(0)
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const uploadedFiles = ref([])

// Composable de upload
const {
  uploadFiles,
  validateImageFiles,
  formatFileSize: composableFormatFileSize
} = useImageUpload()

// Computed
const fotoPrincipal = computed(() => {
  return props.fotos.find(foto => foto.esPrincipal) || props.fotos[0] || null
})

const fotosSecundarias = computed(() => {
  return props.fotos.filter(foto => !foto.esPrincipal)
})

const canAddMore = computed(() => {
  return !props.readonly && props.fotos.length < props.maxFotos
})

const currentPhoto = computed(() => {
  return props.fotos[currentPhotoIndex.value] || null
})

// Métodos
const triggerUpload = () => {
  if (props.readonly) return
  fileInputRef.value?.click()
}

const handleFileSelect = async (event) => {
  const files = Array.from(event.target.files)
  if (files.length === 0) return
  
  await uploadPhotos(files)
  event.target.value = '' // Reset input
}

const uploadPhotos = async (files) => {
  if (props.readonly) return
  
  try {
    // Validar archivos
    const validation = validateImageFiles(files)
    if (!validation.isValid) {
      error.value = validation.error
      return
    }
    
    // Verificar límite de fotos
    if (props.fotos.length + files.length > props.maxFotos) {
      error.value = `Máximo ${props.maxFotos} fotos permitidas`
      return
    }
    
    uploading.value = true
    error.value = ''
    
    // Upload con progress
    const onProgress = (progressEvent) => {
      if (progressEvent.lengthComputable) {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    }
    
    const uploadedPhotos = await uploadService.uploadSalonPhotos(props.salonId, files, onProgress)
    
    // Actualizar lista de fotos
    const updatedFotos = [...props.fotos, ...uploadedPhotos]
    emit('update:fotos', updatedFotos)
    emit('photo-uploaded', uploadedPhotos)
    
  } catch (err) {
    console.error('Error uploading photos:', err)
    error.value = err.message || 'Error al subir las fotos'
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const handlePhotosUploaded = (photos) => {
  // Manejar fotos desde ImageUpload component
  uploadedFiles.value = photos
}

const handleUploadError = (err) => {
  error.value = err.message || 'Error al subir fotos'
}

const deletePhoto = async (photoId) => {
  if (props.readonly) return
  
  if (!confirm('¿Estás seguro de eliminar esta foto?')) return
  
  try {
    await uploadService.deleteSalonPhoto(props.salonId, photoId)
    
    const updatedFotos = props.fotos.filter(foto => foto.id !== photoId)
    emit('update:fotos', updatedFotos)
    emit('photo-deleted', photoId)
    
    // Cerrar modal si estaba abierto
    if (showPhotoModal.value && currentPhoto.value?.id === photoId) {
      showPhotoModal.value = false
    }
    
  } catch (err) {
    console.error('Error deleting photo:', err)
    error.value = 'Error al eliminar la foto'
  }
}

const setAsPrincipal = async (photoId) => {
  if (props.readonly) return
  
  try {
    await uploadService.updateSalonPhoto(props.salonId, photoId, { esPrincipal: true })
    
    // Actualizar localmente
    const updatedFotos = props.fotos.map(foto => ({
      ...foto,
      esPrincipal: foto.id === photoId
    }))
    
    emit('update:fotos', updatedFotos)
    emit('photo-updated', { photoId, esPrincipal: true })
    
  } catch (err) {
    console.error('Error setting as principal:', err)
    error.value = 'Error al establecer como foto principal'
  }
}

const editPhoto = (foto) => {
  currentPhotoIndex.value = props.fotos.findIndex(f => f.id === foto.id)
  showPhotoModal.value = true
}

const openPhotoModal = (foto, index) => {
  currentPhotoIndex.value = index
  showPhotoModal.value = true
}

const nextPhoto = () => {
  currentPhotoIndex.value = (currentPhotoIndex.value + 1) % props.fotos.length
}

const previousPhoto = () => {
  currentPhotoIndex.value = currentPhotoIndex.value === 0 
    ? props.fotos.length - 1 
    : currentPhotoIndex.value - 1
}

const updatePhotoDescription = async () => {
  if (!currentPhoto.value || props.readonly) return
  
  try {
    await uploadService.updateSalonPhoto(
      props.salonId, 
      currentPhoto.value.id, 
      { textoAlternativo: currentPhoto.value.textoAlternativo }
    )
    
    emit('photo-updated', {
      photoId: currentPhoto.value.id,
      textoAlternativo: currentPhoto.value.textoAlternativo
    })
    
  } catch (err) {
    console.error('Error updating photo description:', err)
    error.value = 'Error al actualizar descripción'
  }
}

// Limpiar errores cuando cambian las fotos
watch(() => props.fotos, () => {
  error.value = ''
}, { deep: true })
</script>

<style>
@import '../salones/salones.css';

.upload-area-empty {
  @apply mb-6;
}

.gallery-grid {
  @apply space-y-8;
}

.gallery-main-photo {
  @apply mb-8;
}

.gallery-secondary-photos {
  @apply space-y-4;
}
</style>