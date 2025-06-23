import { upload, post, del, put } from '@/services/api.js'
import { API_ENDPOINTS, FILE_CONFIG } from '@/utils/constants.js'

// === 📸 UPLOAD DE IMÁGENES GENERALES ===

export const uploadImage = async (file, onProgress = null) => {
  try {
    // Validar archivo antes de subir
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error)
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
    // Validar archivos
    const validation = validateImageFiles(files)
    if (!validation.isValid) {
      throw new Error(validation.error)
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
    
    const validation = validateImageFiles(files)
    if (!validation.isValid) {
      throw new Error(validation.error)
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
    
    // Endpoint específico para salones
    const endpoint = API_ENDPOINTS.SALONES.UPLOAD_PHOTOS.replace('{id}', salonId)
    
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
    const endpoint = API_ENDPOINTS.SALONES.UPDATE_PHOTO
      .replace('{id}', salonId)
      .replace('{photoId}', photoId)
    const response = await put(endpoint, updates)
    return response.data.data
  } catch (error) {
    console.error('Error updating salon photo:', error)
    throw error
  }
}

export const deleteSalonPhoto = async (salonId, photoId) => {
  try {
    const endpoint = API_ENDPOINTS.SALONES.DELETE_PHOTO
      .replace('{id}', salonId)
      .replace('{photoId}', photoId)
    const response = await del(endpoint)
    return response.data.data
  } catch (error) {
    console.error('Error deleting salon photo:', error)
    throw error
  }
}

export const reorderSalonPhotos = async (salonId, photoIds) => {
  try {
    const endpoint = API_ENDPOINTS.SALONES.REORDER_PHOTOS.replace('{id}', salonId)
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

// === ✅ VALIDACIONES DE ARCHIVOS ===

export const validateImageFile = (file) => {
  if (!file) {
    return { isValid: false, error: 'Archivo requerido' }
  }
  
  // Verificar que es un archivo
  if (!(file instanceof File)) {
    return { isValid: false, error: 'Debe ser un archivo válido' }
  }
  
  // Verificar tipo MIME
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Solo se permiten imágenes JPG, PNG o WebP' 
    }
  }
  
  // Verificar tamaño
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    const maxSizeMB = FILE_CONFIG.MAX_SIZE / (1024 * 1024)
    return { 
      isValid: false, 
      error: `La imagen no puede exceder ${maxSizeMB}MB` 
    }
  }
  
  // Verificar tamaño mínimo (opcional)
  const minSize = 10 * 1024 // 10KB mínimo
  if (file.size < minSize) {
    return { 
      isValid: false, 
      error: 'La imagen es demasiado pequeña' 
    }
  }
  
  return { isValid: true }
}

export const validateImageFiles = (files) => {
  if (!files || files.length === 0) {
    return { isValid: false, error: 'Debe seleccionar al menos una imagen' }
  }
  
  if (files.length > FILE_CONFIG.MAX_FILES) {
    return { 
      isValid: false, 
      error: `Máximo ${FILE_CONFIG.MAX_FILES} imágenes permitidas` 
    }
  }
  
  // Validar cada archivo
  for (let i = 0; i < files.length; i++) {
    const validation = validateImageFile(files[i])
    if (!validation.isValid) {
      return { 
        isValid: false, 
        error: `Imagen ${i + 1}: ${validation.error}` 
      }
    }
  }
  
  // Verificar tamaño total
  const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0)
  const maxTotalSize = FILE_CONFIG.MAX_SIZE * files.length // Tamaño máximo total
  
  if (totalSize > maxTotalSize) {
    const maxTotalMB = maxTotalSize / (1024 * 1024)
    return { 
      isValid: false, 
      error: `El tamaño total no puede exceder ${maxTotalMB}MB` 
    }
  }
  
  return { isValid: true }
}

// === 🛠️ UTILIDADES DE ARCHIVOS ===

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

export const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
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
    }
    
    img.onerror = () => {
      reject(new Error('Error cargando imagen'))
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// === 📊 HELPERS DE FORMATO ===

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const isImageFile = (file) => {
  return file && file.type && file.type.startsWith('image/')
}

// === 🧹 CLEANUP ===

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

// === 📈 PROGRESS TRACKING ===

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
        callback({ progress, isComplete })
      })
    },
    
    complete: () => {
      progress = 100
      isComplete = true
      
      callbacks.forEach(callback => {
        callback({ progress, isComplete })
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

// === 🔄 BATCH UPLOADS ===

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