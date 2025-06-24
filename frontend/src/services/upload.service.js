import { upload, post, del, put } from '@/services/api.js'
import { API_ENDPOINTS, FILE_CONFIG } from '@/utils/constants.js'
// ✅ CORREGIDO: Usar validators.js como fuente única para validaciones
import { imageFile, imageFiles } from '@/utils/validators.js'

// === 📸 UPLOAD DE IMÁGENES GENERALES ===

export const uploadImage = async (file, onProgress = null) => {
  try {
    // ✅ CORREGIDO: Usar validator centralizado
    const validation = imageFile(file)
    if (validation !== true) {
      throw new Error(validation)
    }
    
    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', 'salon')
    
    const response = await upload(API_ENDPOINTS.UPLOAD.IMAGE, formData, onProgress)
    return response.data.data
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

export const uploadMultipleImages = async (files, onProgress = null) => {
  try {
    // ✅ CORREGIDO: Usar validator centralizado
    const validation = imageFiles(files)
    if (validation !== true) {
      throw new Error(validation)
    }
    
    const formData = new FormData()
    
    // Agregar todos los archivos
    files.forEach((file, index) => {
      formData.append(`images`, file)
    })
    
    formData.append('type', 'salon')
    formData.append('count', files.length)
    
    const response = await upload(API_ENDPOINTS.UPLOAD.IMAGES, formData, onProgress)
    return response.data.data
  } catch (error) {
    console.error('Error uploading multiple images:', error)
    throw error
  }
}

// === 🏢 UPLOAD DE FOTOS DE SALONES - FASE 4 ===

export const uploadSalonPhotos = async (salonId, files, onProgress = null) => {
  try {
    if (!salonId) {
      throw new Error('ID del salón requerido')
    }
    
    // ✅ CORREGIDO: Usar validator centralizado
    const validation = imageFiles(files)
    if (validation !== true) {
      throw new Error(validation)
    }
    
    const formData = new FormData()
    
    // Agregar archivos con metadata
    files.forEach((file, index) => {
      formData.append('fotos', file)
      
      // Metadata opcional por archivo
      if (file.caption) {
        formData.append(`caption_${index}`, file.caption)
      }
      if (file.isMain && index === 0) {
        formData.append(`main_${index}`, 'true')
      }
    })
    
    // ✅ CORREGIDO: Construir URL sin placeholders
    const endpoint = `/api/salones/${salonId}/fotos`
    
    const response = await upload(endpoint, formData, (progressEvent) => {
      if (onProgress && progressEvent.lengthComputable) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progressEvent, percentCompleted)
      }
    })
    
    return response.data.data
  } catch (error) {
    console.error('Error uploading salon photos:', error)
    throw error
  }
}

export const updateSalonPhoto = async (salonId, photoId, updates) => {
  try {
    const endpoint = `/api/salones/${salonId}/fotos/${photoId}`
    const response = await put(endpoint, updates)
    return response.data.data
  } catch (error) {
    console.error('Error updating salon photo:', error)
    throw error
  }
}

export const deleteSalonPhoto = async (salonId, photoId) => {
  try {
    const endpoint = `/api/salones/${salonId}/fotos/${photoId}`
    const response = await del(endpoint)
    return response.data.data
  } catch (error) {
    console.error('Error deleting salon photo:', error)
    throw error
  }
}

export const reorderSalonPhotos = async (salonId, photoIds) => {
  try {
    const endpoint = `/api/salones/${salonId}/fotos/reorder`
    const response = await put(endpoint, { order: photoIds })
    return response.data.data
  } catch (error) {
    console.error('Error reordering salon photos:', error)
    throw error
  }
}

export const setMainSalonPhoto = async (salonId, photoId) => {
  try {
    return await updateSalonPhoto(salonId, photoId, { esPrincipal: true })
  } catch (error) {
    console.error('Error setting main salon photo:', error)
    throw error
  }
}

// === ✅ VALIDACIONES - AHORA USA validators.js ===

// ✅ ELIMINADAS: validateImageFile y validateImageFiles duplicadas
// Ahora se importan de validators.js

// Re-export para compatibilidad con código existente
export const validateImageFile = imageFile
export const validateImageFiles = imageFiles

// === 🛠️ UTILIDADES DE ARCHIVOS SIMPLIFICADAS ===

export const getFilePreview = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Archivo requerido'))
      return
    }
    
    const reader = new FileReader()
    
    reader.onload = (e) => {
      resolve({
        file,
        preview: e.target.result,
        name: file.name,
        size: file.size,
        type: file.type,
        id: Date.now() + Math.random() // ID temporal para UI
      })
    }
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'))
    }
    
    reader.readAsDataURL(file)
  })
}

export const getMultipleFilePreviews = async (files) => {
  try {
    const previews = []
    
    for (const file of files) {
      const preview = await getFilePreview(file)
      previews.push(preview)
    }
    
    return previews
  } catch (error) {
    console.error('Error getting file previews:', error)
    throw error
  }
}

// === ✅ COMPRESIÓN SIMPLIFICADA (Opcional, solo si se necesita) ===

export const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // Validar que es una imagen
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo debe ser una imagen'))
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      try {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Crear nuevo archivo con el mismo nombre
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Error comprimiendo imagen'))
            }
          },
          file.type,
          quality
        )
      } catch (error) {
        reject(new Error('Error procesando imagen'))
      }
    }
    
    img.onerror = () => {
      reject(new Error('Error cargando imagen'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// === 📊 HELPERS DE FORMATO - SIMPLIFICADOS ===

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename) => {
  if (!filename) return ''
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const isImageFile = (file) => {
  return file && file.type && file.type.startsWith('image/')
}

// === 🧹 CLEANUP HELPERS ===

export const revokeObjectURL = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

export const cleanupPreviews = (previews) => {
  if (Array.isArray(previews)) {
    previews.forEach(preview => {
      if (preview.preview) {
        revokeObjectURL(preview.preview)
      }
    })
  }
}

// === 📈 PROGRESS TRACKING SIMPLIFICADO ===

export const createProgressTracker = () => {
  let progress = 0
  let isComplete = false
  let callbacks = []
  
  return {
    onProgress: (callback) => {
      callbacks.push(callback)
    },
    
    updateProgress: (newProgress) => {
      progress = Math.min(100, Math.max(0, newProgress))
      isComplete = progress >= 100
      
      callbacks.forEach(callback => {
        try {
          callback({ progress, isComplete })
        } catch (error) {
          console.error('Error en callback de progreso:', error)
        }
      })
    },
    
    complete: () => {
      progress = 100
      isComplete = true
      
      callbacks.forEach(callback => {
        try {
          callback({ progress, isComplete })
        } catch (error) {
          console.error('Error en callback de completado:', error)
        }
      })
    },
    
    reset: () => {
      progress = 0
      isComplete = false
    },
    
    get progress() {
      return progress
    },
    
    get isComplete() {
      return isComplete
    }
  }
}

// === 🔄 BATCH UPLOADS SIMPLIFICADO ===

export const uploadFilesBatch = async (files, salonId, batchSize = 3, onBatchProgress = null) => {
  const results = []
  const batches = []
  
  // Dividir archivos en lotes
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize))
  }
  
  // Subir cada lote
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i]
    
    try {
      const batchResults = await uploadSalonPhotos(salonId, batch, (progressEvent, percent) => {
        if (onBatchProgress) {
          const totalProgress = ((i * batchSize) + (percent * batch.length / 100)) / files.length * 100
          onBatchProgress(Math.round(totalProgress), i + 1, batches.length)
        }
      })
      
      results.push(...batchResults)
    } catch (error) {
      console.error(`Error uploading batch ${i + 1}:`, error)
      throw error
    }
  }
  
  return results
}

// === 📱 UTILIDADES PARA DIFERENTES TIPOS DE ARCHIVO ===

export const getSupportedMimeTypes = () => {
  return FILE_CONFIG.ALLOWED_TYPES
}

export const getMaxFileSize = () => {
  return FILE_CONFIG.MAX_SIZE
}

export const getMaxFiles = () => {
  return FILE_CONFIG.MAX_FILES
}

// === 🎨 HELPERS PARA UI ===

export const createImageThumbnail = async (file, size = 150) => {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = size
        canvas.height = size
        
        // Calcular crop para mantener aspect ratio cuadrado
        const minDimension = Math.min(img.width, img.height)
        const startX = (img.width - minDimension) / 2
        const startY = (img.height - minDimension) / 2
        
        ctx.drawImage(
          img, 
          startX, startY, minDimension, minDimension,
          0, 0, size, size
        )
        
        canvas.toBlob(resolve, 'image/jpeg', 0.8)
      }
      
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  } catch (error) {
    console.error('Error creating thumbnail:', error)
    throw error
  }
}