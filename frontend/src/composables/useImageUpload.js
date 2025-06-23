import { ref, reactive, computed, onUnmounted } from 'vue'
import * as uploadService from '@/services/upload.service.js'

/**
 * Composable para manejar upload de imágenes
 * @param {Object} options - Opciones de configuración
 */
export const useImageUpload = (options = {}) => {
  // === CONFIGURACIÓN ===
  const config = {
    multiple: true,
    maxFiles: 10,
    autoUpload: false,
    compressImages: true,
    showPreviews: true,
    allowReorder: true,
    ...options
  }

  // === ESTADO ===
  const files = ref([])
  const previews = ref([])
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const errors = ref([])
  const uploadedFiles = ref([])

  // Estado por archivo individual
  const fileStates = reactive({})

  // === COMPUTED ===
  const hasFiles = computed(() => files.value.length > 0)
  const hasErrors = computed(() => errors.value.length > 0)
  const isComplete = computed(() => uploadProgress.value >= 100)
  const canUpload = computed(() => hasFiles.value && !uploading.value)
  const canAddMore = computed(() => files.value.length < config.maxFiles)

  const validFiles = computed(() => {
    return files.value.filter(file => {
      const state = fileStates[file.name]
      return !state?.error
    })
  })

  const invalidFiles = computed(() => {
    return files.value.filter(file => {
      const state = fileStates[file.name]
      return state?.error
    })
  })

  const totalSize = computed(() => {
    return files.value.reduce((total, file) => total + file.size, 0)
  })

  // === MANEJO DE ARCHIVOS ===
  const addFiles = async (newFiles) => {
    try {
      const fileArray = Array.isArray(newFiles) ? newFiles : Array.from(newFiles)
      
      // Verificar límite de archivos
      if (files.value.length + fileArray.length > config.maxFiles) {
        throw new Error(`Máximo ${config.maxFiles} archivos permitidos`)
      }

      // Validar cada archivo
      const validatedFiles = []
      const newErrors = []

      for (const file of fileArray) {
        const validation = uploadService.validateImageFile(file)
        
        if (validation.isValid) {
          validatedFiles.push(file)
          
          // Inicializar estado del archivo
          fileStates[file.name] = {
            progress: 0,
            uploading: false,
            uploaded: false,
            error: null,
            url: null
          }
        } else {
          newErrors.push(`${file.name}: ${validation.error}`)
        }
      }

      // Agregar archivos válidos
      files.value.push(...validatedFiles)
      
      // Agregar errores si los hay
      if (newErrors.length > 0) {
        errors.value.push(...newErrors)
      }

      // Generar previews si está habilitado
      if (config.showPreviews) {
        await generatePreviews(validatedFiles)
      }

      // Auto upload si está habilitado
      if (config.autoUpload && validatedFiles.length > 0) {
        await uploadFiles()
      }

      return {
        added: validatedFiles.length,
        errors: newErrors
      }
    } catch (error) {
      errors.value.push(error.message)
      throw error
    }
  }

  const removeFile = (fileToRemove) => {
    const index = files.value.findIndex(file => 
      file.name === fileToRemove.name && file.size === fileToRemove.size
    )
    
    if (index !== -1) {
      const file = files.value[index]
      
      // Limpiar preview
      const previewIndex = previews.value.findIndex(p => p.file.name === file.name)
      if (previewIndex !== -1) {
        const preview = previews.value[previewIndex]
        if (preview.preview) {
          uploadService.revokeObjectURL(preview.preview)
        }
        previews.value.splice(previewIndex, 1)
      }
      
      // Limpiar estado
      delete fileStates[file.name]
      
      // Remover archivo
      files.value.splice(index, 1)
    }
  }

  const clearFiles = () => {
    // Limpiar previews
    uploadService.cleanupPreviews(previews.value)
    
    // Reset estado
    files.value = []
    previews.value = []
    errors.value = []
    uploadedFiles.value = []
    Object.keys(fileStates).forEach(key => delete fileStates[key])
    
    resetUploadState()
  }

  const reorderFiles = (fromIndex, toIndex) => {
    if (!config.allowReorder) return

    const file = files.value.splice(fromIndex, 1)[0]
    files.value.splice(toIndex, 0, file)
    
    // Reordenar previews también
    if (previews.value.length > 0) {
      const preview = previews.value.splice(fromIndex, 1)[0]
      previews.value.splice(toIndex, 0, preview)
    }
  }

  // === PREVIEWS ===
  const generatePreviews = async (filesToPreview) => {
    try {
      const newPreviews = await uploadService.getMultipleFilePreviews(filesToPreview)
      previews.value.push(...newPreviews)
    } catch (error) {
      console.error('Error generating previews:', error)
      errors.value.push('Error al generar previsualizaciones')
    }
  }

  // === UPLOAD PRINCIPAL ===
  const uploadFiles = async (customFiles = null) => {
    const filesToUpload = customFiles || validFiles.value
    
    if (filesToUpload.length === 0) {
      throw new Error('No hay archivos válidos para subir')
    }

    uploading.value = true
    uploadProgress.value = 0
    errors.value = []

    try {
      if (config.multiple && filesToUpload.length > 1) {
        return await uploadMultipleFiles(filesToUpload)
      } else {
        return await uploadSingleFile(filesToUpload[0])
      }
    } catch (error) {
      errors.value.push(error.message)
      throw error
    } finally {
      uploading.value = false
    }
  }

  const uploadSingleFile = async (file) => {
    try {
      // Comprimir si está habilitado
      let fileToUpload = file
      if (config.compressImages) {
        try {
          fileToUpload = await uploadService.compressImage(file)
        } catch (compressionError) {
          console.warn('Compression failed, using original file:', compressionError)
        }
      }

      // Update estado del archivo
      fileStates[file.name].uploading = true

      // Progress callback
      const onProgress = (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          fileStates[file.name].progress = progress
          uploadProgress.value = progress
        }
      }

      // Upload
      const result = await uploadService.uploadImage(fileToUpload, onProgress)
      
      // Update estado
      fileStates[file.name].uploaded = true
      fileStates[file.name].url = result.url
      uploadedFiles.value.push(result)
      uploadProgress.value = 100

      return result
    } catch (error) {
      fileStates[file.name].error = error.message
      throw error
    } finally {
      fileStates[file.name].uploading = false
    }
  }

  const uploadMultipleFiles = async (filesToUpload) => {
    try {
      // Comprimir archivos si está habilitado
      let processedFiles = filesToUpload
      if (config.compressImages) {
        processedFiles = await Promise.all(
          filesToUpload.map(async (file) => {
            try {
              return await uploadService.compressImage(file)
            } catch (error) {
              console.warn(`Compression failed for ${file.name}:`, error)
              return file
            }
          })
        )
      }

      // Marcar archivos como uploading
      filesToUpload.forEach(file => {
        fileStates[file.name].uploading = true
      })

      // Progress callback global
      const onProgress = (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          uploadProgress.value = progress
        }
      }

      // Upload múltiple
      const results = await uploadService.uploadMultipleImages(processedFiles, onProgress)
      
      // Update estado de todos los archivos
      results.forEach((result, index) => {
        const originalFile = filesToUpload[index]
        fileStates[originalFile.name].uploaded = true
        fileStates[originalFile.name].url = result.url
        fileStates[originalFile.name].progress = 100
      })

      uploadedFiles.value.push(...results)
      uploadProgress.value = 100

      return results
    } catch (error) {
      // Marcar archivos con error
      filesToUpload.forEach(file => {
        fileStates[file.name].error = error.message
      })
      throw error
    } finally {
      // Limpiar estado uploading
      filesToUpload.forEach(file => {
        fileStates[file.name].uploading = false
      })
    }
  }

  // === UPLOAD ESPECÍFICO PARA SALONES ===
  const uploadSalonPhotos = async (salonId) => {
    if (!salonId) {
      throw new Error('ID del salón requerido')
    }

    if (validFiles.value.length === 0) {
      throw new Error('No hay archivos para subir')
    }

    uploading.value = true
    uploadProgress.value = 0

    try {
      const onProgress = (progressEvent) => {
        if (progressEvent.lengthComputable) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          uploadProgress.value = progress
        }
      }

      const results = await uploadService.uploadSalonPhotos(
        salonId, 
        validFiles.value, 
        onProgress
      )
      
      uploadedFiles.value = results
      uploadProgress.value = 100

      return results
    } catch (error) {
      errors.value.push(error.message)
      throw error
    } finally {
      uploading.value = false
    }
  }

  // === UTILIDADES ===
  const resetUploadState = () => {
    uploading.value = false
    uploadProgress.value = 0
    uploadedFiles.value = []
  }

  const getFileState = (fileName) => {
    return fileStates[fileName] || {}
  }

  const retryUpload = async (file) => {
    // Limpiar error del archivo
    if (fileStates[file.name]) {
      fileStates[file.name].error = null
    }
    
    // Retry upload
    return await uploadSingleFile(file)
  }

  const formatFileSize = (bytes) => {
    return uploadService.formatFileSize(bytes)
  }

  // === DRAG & DROP ===
  const handleDrop = async (event) => {
    event.preventDefault()
    const droppedFiles = Array.from(event.dataTransfer.files)
    await addFiles(droppedFiles)
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  // === CLEANUP ===
  onUnmounted(() => {
    uploadService.cleanupPreviews(previews.value)
  })

  // === RETURN ===
  return {
    // Estado
    files,
    previews,
    uploading,
    uploadProgress,
    errors,
    uploadedFiles,
    fileStates,

    // Computed
    hasFiles,
    hasErrors,
    isComplete,
    canUpload,
    canAddMore,
    validFiles,
    invalidFiles,
    totalSize,

    // Métodos principales
    addFiles,
    removeFile,
    clearFiles,
    reorderFiles,
    uploadFiles,
    uploadSalonPhotos,

    // Utilidades
    resetUploadState,
    getFileState,
    retryUpload,
    formatFileSize,

    // Drag & Drop
    handleDrop,
    handleDragOver
  }
}

// === COMPOSABLE ESPECÍFICO PARA SALONES ===
export const useSalonImageUpload = (salonId = null) => {
  return useImageUpload({
    multiple: true,
    maxFiles: 10,
    autoUpload: false,
    compressImages: true,
    showPreviews: true,
    allowReorder: true
  })
}

// === COMPOSABLE PARA SINGLE IMAGE ===
export const useSingleImageUpload = () => {
  return useImageUpload({
    multiple: false,
    maxFiles: 1,
    autoUpload: false,
    compressImages: true,
    showPreviews: true,
    allowReorder: false
  })
}