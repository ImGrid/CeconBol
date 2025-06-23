<template>
  <div class="image-upload-container">
    <!-- Label -->
    <label v-if="label" class="form-label">
      {{ label }}
      <span v-if="required" class="ml-1 text-red-500">*</span>
    </label>

    <!-- Upload Area -->
    <div
      :class="uploadAreaClass"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="openFileSelector"
    >
      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        :multiple="multiple"
        :accept="acceptedTypes"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Upload Content -->
      <div v-if="!hasFiles" class="upload-content">
        <!-- Upload Icon -->
        <div class="upload-icon">
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
        </div>

        <!-- Upload Text -->
        <div class="upload-text">
          <p class="upload-primary-text">
            {{ uploadText }}
          </p>
          <p class="upload-secondary-text">
            {{ supportText }}
          </p>
          <p v-if="maxFiles > 1" class="upload-limit-text">
            Máximo {{ maxFiles }} {{ maxFiles === 1 ? 'archivo' : 'archivos' }}
          </p>
        </div>

        <!-- Upload Button -->
        <Button variant="outline-primary" size="small" class="mt-4">
          {{ buttonText }}
        </Button>
      </div>

      <!-- Files Preview -->
      <div v-else class="files-preview">
        <div class="files-grid">
          <div
            v-for="(preview, index) in previews"
            :key="`preview-${index}`"
            class="file-preview-item"
          >
            <!-- Image Preview -->
            <div class="file-preview-image">
              <img 
                :src="preview.preview" 
                :alt="preview.name"
                class="preview-img"
              />
              
              <!-- Upload Progress Overlay -->
              <div 
                v-if="getFileState(preview.file.name).uploading"
                class="upload-progress-overlay"
              >
                <div class="upload-progress-circle">
                  <svg class="progress-ring" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      stroke-width="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="white"
                      stroke-width="3"
                      stroke-linecap="round"
                      :stroke-dasharray="`${getFileState(preview.file.name).progress || 0}, 100`"
                    />
                  </svg>
                  <span class="progress-text">
                    {{ getFileState(preview.file.name).progress || 0 }}%
                  </span>
                </div>
              </div>

              <!-- Success Overlay -->
              <div 
                v-if="getFileState(preview.file.name).uploaded"
                class="upload-success-overlay"
              >
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>

              <!-- Error Overlay -->
              <div 
                v-if="getFileState(preview.file.name).error"
                class="upload-error-overlay"
              >
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>

              <!-- Remove Button -->
              <button
                @click.stop="removeFile(preview.file)"
                class="file-remove-btn"
                :title="`Eliminar ${preview.name}`"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- File Info -->
            <div class="file-info">
              <p class="file-name" :title="preview.name">
                {{ truncateFileName(preview.name) }}
              </p>
              <p class="file-size">
                {{ formatFileSize(preview.size) }}
              </p>
              
              <!-- File Error -->
              <p v-if="getFileState(preview.file.name).error" class="file-error">
                {{ getFileState(preview.file.name).error }}
              </p>
            </div>
          </div>
        </div>

        <!-- Add More Button -->
        <div v-if="canAddMore" class="add-more-area" @click="openFileSelector">
          <div class="add-more-content">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <p class="mt-2 text-sm text-gray-600">Agregar más</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Actions -->
    <div v-if="hasFiles && !autoUpload" class="upload-actions">
      <div class="flex items-center justify-between">
        <p class="upload-summary">
          {{ files.length }} {{ files.length === 1 ? 'archivo' : 'archivos' }} seleccionados
          <span class="text-gray-500">({{ formatFileSize(totalSize) }})</span>
        </p>
        
        <div class="flex space-x-2">
          <Button
            variant="outline-primary"
            size="small"
            @click="clearFiles"
            :disabled="uploading"
          >
            Limpiar
          </Button>
          
          <Button
            variant="primary"
            size="small"
            @click="startUpload"
            :disabled="!canUpload"
            :loading="uploading"
          >
            {{ uploading ? 'Subiendo...' : 'Subir Archivos' }}
          </Button>
        </div>
      </div>

      <!-- Global Upload Progress -->
      <div v-if="uploading" class="upload-progress-bar">
        <div class="progress-bar-track">
          <div 
            class="progress-bar-fill"
            :style="{ width: `${uploadProgress}%` }"
          ></div>
        </div>
        <span class="progress-text">{{ uploadProgress }}%</span>
      </div>
    </div>

    <!-- Error Messages -->
    <div v-if="hasErrors" class="upload-errors">
      <div 
        v-for="(error, index) in errors" 
        :key="`error-${index}`"
        class="upload-error-item"
      >
        <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Help Text -->
    <p v-if="helpText && !hasErrors" class="input-help-text">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useImageUpload } from '@/composables/useImageUpload.js'
import Button from '@/components/ui/Button.vue'

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  multiple: {
    type: Boolean,
    default: true
  },
  maxFiles: {
    type: Number,
    default: 10
  },
  autoUpload: {
    type: Boolean,
    default: false
  },
  compressImages: {
    type: Boolean,
    default: true
  },
  acceptedTypes: {
    type: String,
    default: 'image/jpeg,image/png,image/webp'
  },
  uploadText: {
    type: String,
    default: 'Arrastra tus imágenes aquí o haz clic para seleccionar'
  },
  supportText: {
    type: String,
    default: 'JPG, PNG o WebP hasta 5MB cada una'
  },
  buttonText: {
    type: String,
    default: 'Seleccionar Archivos'
  }
})

// Events
const emit = defineEmits(['update:modelValue', 'upload-complete', 'upload-error'])

// Refs
const fileInputRef = ref(null)
const isDragging = ref(false)

// Composable
const {
  files,
  previews,
  uploading,
  uploadProgress,
  errors,
  uploadedFiles,
  hasFiles,
  hasErrors,
  canUpload,
  canAddMore,
  totalSize,
  addFiles,
  removeFile,
  clearFiles,
  uploadFiles,
  getFileState,
  formatFileSize,
  handleDrop: composableHandleDrop,
  handleDragOver
} = useImageUpload({
  multiple: props.multiple,
  maxFiles: props.maxFiles,
  autoUpload: props.autoUpload,
  compressImages: props.compressImages
})

// Computed
const uploadAreaClass = computed(() => {
  const classes = ['upload-area']
  
  if (isDragging.value) {
    classes.push('upload-area-dragging')
  }
  
  if (hasFiles.value) {
    classes.push('upload-area-with-files')
  } else {
    classes.push('upload-area-empty')
  }
  
  return classes.join(' ')
})

// Métodos
const openFileSelector = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event) => {
  const selectedFiles = Array.from(event.target.files)
  await addFiles(selectedFiles)
  
  // Reset input para permitir seleccionar el mismo archivo de nuevo
  event.target.value = ''
}

const handleDrop = async (event) => {
  isDragging.value = false
  await composableHandleDrop(event)
}

const handleDragEnter = (event) => {
  event.preventDefault()
  isDragging.value = true
}

const handleDragLeave = (event) => {
  event.preventDefault()
  // Solo cambiar isDragging si realmente salimos del área
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDragging.value = false
  }
}

const startUpload = async () => {
  try {
    const results = await uploadFiles()
    emit('upload-complete', results)
    emit('update:modelValue', uploadedFiles.value)
  } catch (error) {
    emit('upload-error', error)
  }
}

const truncateFileName = (name, maxLength = 20) => {
  if (name.length <= maxLength) return name
  
  const extension = name.split('.').pop()
  const nameWithoutExt = name.slice(0, name.lastIndexOf('.'))
  const truncated = nameWithoutExt.slice(0, maxLength - extension.length - 3)
  
  return `${truncated}...${extension}`
}

// Watchers
watch(uploadedFiles, (newFiles) => {
  emit('update:modelValue', newFiles)
}, { deep: true })

// Sync external modelValue changes
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.length !== uploadedFiles.value.length) {
    // Handle external changes if needed
    uploadedFiles.value = [...newValue]
  }
})
</script>

<style>
@import './common.css';
</style>