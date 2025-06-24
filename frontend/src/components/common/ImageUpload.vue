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
      @dragover.prevent
      @dragenter.prevent
      @dragleave="isDragging = false"
      @click="openFileSelector"
    >
      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        :multiple="multiple"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="handleFileSelect"
      />

      <!-- Upload Content (cuando no hay archivos) -->
      <div v-if="files.length === 0" class="upload-content">
        <div class="upload-icon">
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
        </div>

        <div class="upload-text">
          <p class="upload-primary-text">
            {{ uploadText }}
          </p>
          <p class="upload-secondary-text">
            {{ supportText }}
          </p>
          <p v-if="multiple && maxFiles > 1" class="upload-limit-text">
            Máximo {{ maxFiles }} archivos
          </p>
        </div>

        <Button variant="outline-primary" size="small" class="mt-4">
          Seleccionar Archivos
        </Button>
      </div>

      <!-- Files Preview (cuando hay archivos) -->
      <div v-else class="files-preview">
        <div class="files-grid">
          <div
            v-for="(file, index) in files"
            :key="`file-${index}`"
            class="file-preview-item"
          >
            <!-- ✅ CORREGIDO: Agregar 'group' directamente en el HTML -->
            <div class="file-preview-image group">
              <img 
                :src="file.preview" 
                :alt="file.name"
                class="preview-img"
              />
              
              <!-- Remove Button -->
              <button
                @click.stop="removeFile(index)"
                class="file-remove-btn group-hover:opacity-100"
                :title="`Eliminar ${file.name}`"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="file-info">
              <p class="file-name" :title="file.name">
                {{ truncateFileName(file.name) }}
              </p>
              <p class="file-size">
                {{ formatFileSize(file.size) }}
              </p>
            </div>
          </div>

          <!-- Add More Button -->
          <div 
            v-if="canAddMore" 
            class="add-more-area" 
            @click="openFileSelector"
          >
            <div class="add-more-content">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
              </svg>
              <p class="mt-2 text-sm text-gray-600">Agregar más</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Messages -->
    <div v-if="error" class="mt-2 text-sm text-red-600">
      {{ error }}
    </div>

    <!-- Help Text -->
    <p v-if="helpText && !error" class="mt-2 text-sm text-gray-500">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from '@/components/ui/Button.vue'

// Props SIMPLIFICADOS
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
  uploadText: {
    type: String,
    default: 'Arrastra tus imágenes aquí o haz clic para seleccionar'
  },
  supportText: {
    type: String,
    default: 'JPG, PNG o WebP hasta 5MB cada una'
  }
})

// Events
const emit = defineEmits(['update:modelValue', 'upload-complete', 'upload-error'])

// Estado
const fileInputRef = ref(null)
const isDragging = ref(false)
const files = ref([])
const error = ref('')

// Computed
const uploadAreaClass = computed(() => {
  const classes = ['upload-area']
  
  if (isDragging.value) {
    classes.push('upload-area-dragging')
  } else if (files.value.length > 0) {
    classes.push('upload-area-with-files')
  } else {
    classes.push('upload-area-empty')
  }
  
  return classes.join(' ')
})

const canAddMore = computed(() => {
  return props.multiple && files.value.length < props.maxFiles
})

// Métodos
const openFileSelector = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = async (event) => {
  const selectedFiles = Array.from(event.target.files)
  await addFiles(selectedFiles)
  event.target.value = '' // Reset
}

const handleDrop = async (event) => {
  event.preventDefault()
  isDragging.value = false
  
  const droppedFiles = Array.from(event.dataTransfer.files)
  await addFiles(droppedFiles)
}

const addFiles = async (newFiles) => {
  error.value = ''
  
  // Validar límite
  if (files.value.length + newFiles.length > props.maxFiles) {
    error.value = `Máximo ${props.maxFiles} archivos permitidos`
    return
  }

  // Validar y procesar archivos
  for (const file of newFiles) {
    const validation = validateFile(file)
    if (validation.isValid) {
      const preview = await createPreview(file)
      files.value.push({
        file,
        name: file.name,
        size: file.size,
        preview
      })
    } else {
      error.value = validation.error
      break
    }
  }

  // Emitir cambios
  emit('update:modelValue', files.value.map(f => f.file))
}

const removeFile = (index) => {
  const file = files.value[index]
  
  // Limpiar preview URL
  if (file.preview) {
    URL.revokeObjectURL(file.preview)
  }
  
  files.value.splice(index, 1)
  emit('update:modelValue', files.value.map(f => f.file))
}

const validateFile = (file) => {
  // Validar tipo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Solo se permiten imágenes JPG, PNG o WebP' }
  }

  // Validar tamaño (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    return { isValid: false, error: 'La imagen no puede exceder 5MB' }
  }

  return { isValid: true }
}

const createPreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

const truncateFileName = (name, maxLength = 20) => {
  if (name.length <= maxLength) return name
  
  const extension = name.split('.').pop()
  const nameWithoutExt = name.slice(0, name.lastIndexOf('.'))
  const truncated = nameWithoutExt.slice(0, maxLength - extension.length - 3)
  
  return `${truncated}...${extension}`
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Cleanup al desmontar
import { onUnmounted } from 'vue'

onUnmounted(() => {
  // Limpiar todas las preview URLs
  files.value.forEach(file => {
    if (file.preview) {
      URL.revokeObjectURL(file.preview)
    }
  })
})
</script>

<style>
@import './common.css';
</style>