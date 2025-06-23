import { CIUDADES_BOLIVIA, FILE_CONFIG } from '@/utils/constants.js'

// === VALIDACIONES BÁSICAS ===

export const required = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0 || 'Este campo es requerido'
  }
  return !!value || 'Este campo es requerido'
}

export const minLength = (min) => (value) => {
  if (!value) return true // Se maneja con required
  return value.length >= min || `Mínimo ${min} caracteres`
}

export const maxLength = (max) => (value) => {
  if (!value) return true
  return value.length <= max || `Máximo ${max} caracteres`
}

export const email = (value) => {
  if (!value) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(value) || 'Correo electrónico inválido'
}

export const phone = (value) => {
  if (!value) return true
  const phoneRegex = /^\d{7,8}$/
  return phoneRegex.test(value) || 'Teléfono debe tener 7 u 8 dígitos'
}

export const numeric = (value) => {
  if (!value) return true
  return !isNaN(value) && !isNaN(parseFloat(value)) || 'Debe ser un número válido'
}

export const positiveNumber = (value) => {
  if (!value) return true
  const num = parseFloat(value)
  return (!isNaN(num) && num > 0) || 'Debe ser un número positivo'
}

export const integer = (value) => {
  if (!value) return true
  return Number.isInteger(Number(value)) || 'Debe ser un número entero'
}

// === VALIDACIONES ESPECÍFICAS PARA SALONES ===

export const salonName = (value) => {
  if (!value) return 'El nombre del salón es requerido'
  if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres'
  if (value.length > 100) return 'El nombre no puede exceder 100 caracteres'
  
  // Solo letras, números, espacios y algunos caracteres especiales
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\-&\.]+$/
  if (!nameRegex.test(value)) {
    return 'El nombre contiene caracteres no permitidos'
  }
  
  return true
}

export const salonDescription = (value) => {
  if (!value) return 'La descripción es requerida'
  if (value.length < 50) return 'La descripción debe tener al menos 50 caracteres'
  if (value.length > 1000) return 'La descripción no puede exceder 1000 caracteres'
  return true
}

export const salonAddress = (value) => {
  if (!value) return 'La dirección es requerida'
  if (value.length < 10) return 'La dirección debe ser más específica (mínimo 10 caracteres)'
  if (value.length > 200) return 'La dirección no puede exceder 200 caracteres'
  return true
}

export const salonCity = (value) => {
  if (!value) return 'La ciudad es requerida'
  if (!CIUDADES_BOLIVIA.includes(value)) {
    return 'Por favor selecciona una ciudad válida'
  }
  return true
}

export const salonCapacity = (min, max) => {
  // Validar capacidad mínima
  const validateMin = (value) => {
    if (!value) return 'La capacidad mínima es requerida'
    const num = parseInt(value)
    if (isNaN(num) || num <= 0) return 'La capacidad debe ser un número positivo'
    if (num > 10000) return 'La capacidad mínima no puede exceder 10,000 personas'
    return true
  }
  
  // Validar capacidad máxima
  const validateMax = (value) => {
    if (!value) return 'La capacidad máxima es requerida'
    const num = parseInt(value)
    if (isNaN(num) || num <= 0) return 'La capacidad debe ser un número positivo'
    if (num > 10000) return 'La capacidad máxima no puede exceder 10,000 personas'
    
    // Validar que máxima >= mínima
    const minNum = parseInt(min)
    if (!isNaN(minNum) && num < minNum) {
      return 'La capacidad máxima debe ser mayor o igual a la mínima'
    }
    
    return true
  }
  
  return { validateMin, validateMax }
}

export const salonPrice = (value) => {
  if (!value) return 'El precio base es requerido'
  const num = parseFloat(value)
  if (isNaN(num) || num <= 0) return 'El precio debe ser un número positivo'
  if (num > 1000000) return 'El precio no puede exceder Bs. 1,000,000'
  if (num < 100) return 'El precio mínimo es Bs. 100'
  return true
}

export const salonPriceModel = (value) => {
  const validModels = ['fijo', 'por_persona', 'personalizado']
  if (!value) return 'El modelo de precio es requerido'
  if (!validModels.includes(value)) {
    return 'Modelo de precio inválido'
  }
  return true
}

export const salonContact = {
  phone: (value) => {
    if (!value) return 'El teléfono de contacto es requerido'
    return phone(value)
  },
  
  email: (value) => {
    if (!value) return true // Email es opcional
    return email(value)
  },
  
  whatsapp: (value) => {
    if (!value) return true // WhatsApp es opcional
    return phone(value)
  }
}

// === VALIDACIONES DE ARCHIVOS ===

export const imageFile = (file) => {
  if (!file) return 'La imagen es requerida'
  
  // Verificar tipo de archivo
  if (!FILE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    return 'Solo se permiten imágenes JPG, PNG o WebP'
  }
  
  // Verificar tamaño
  if (file.size > FILE_CONFIG.MAX_SIZE) {
    const maxSizeMB = FILE_CONFIG.MAX_SIZE / (1024 * 1024)
    return `La imagen no puede exceder ${maxSizeMB}MB`
  }
  
  return true
}

export const imageFiles = (files) => {
  if (!files || files.length === 0) {
    return 'Debe subir al menos una imagen'
  }
  
  if (files.length > FILE_CONFIG.MAX_FILES) {
    return `Máximo ${FILE_CONFIG.MAX_FILES} imágenes permitidas`
  }
  
  // Validar cada archivo
  for (let i = 0; i < files.length; i++) {
    const validation = imageFile(files[i])
    if (validation !== true) {
      return `Imagen ${i + 1}: ${validation}`
    }
  }
  
  return true
}

// === VALIDACIONES DE SERVICIOS ===

export const salonServices = (services) => {
  if (!Array.isArray(services)) {
    return 'Los servicios deben ser una lista'
  }
  
  // Al menos un servicio debe estar incluido
  const hasIncludedService = services.some(service => service.incluido)
  if (!hasIncludedService) {
    return 'Debe incluir al menos un servicio básico'
  }
  
  // Validar cada servicio
  for (const service of services) {
    if (!service.nombre || service.nombre.length < 2) {
      return 'Todos los servicios deben tener un nombre válido'
    }
    
    if (!service.incluido && (!service.costoAdicional || service.costoAdicional <= 0)) {
      return 'Los servicios adicionales deben tener un costo válido'
    }
  }
  
  return true
}

// === VALIDACIONES COMPUESTAS ===

export const validateSalonForm = (formData) => {
  const errors = {}
  
  // Información básica
  const nameValidation = salonName(formData.nombre)
  if (nameValidation !== true) errors.nombre = nameValidation
  
  const descValidation = salonDescription(formData.descripcion)
  if (descValidation !== true) errors.descripcion = descValidation
  
  const addressValidation = salonAddress(formData.direccion)
  if (addressValidation !== true) errors.direccion = addressValidation
  
  const cityValidation = salonCity(formData.ciudad)
  if (cityValidation !== true) errors.ciudad = cityValidation
  
  // Capacidad
  const { validateMin, validateMax } = salonCapacity(formData.capacidadMinima, formData.capacidadMaxima)
  
  const minCapValidation = validateMin(formData.capacidadMinima)
  if (minCapValidation !== true) errors.capacidadMinima = minCapValidation
  
  const maxCapValidation = validateMax(formData.capacidadMaxima)
  if (maxCapValidation !== true) errors.capacidadMaxima = maxCapValidation
  
  // Precio
  if (formData.modeloPrecio !== 'personalizado') {
    const priceValidation = salonPrice(formData.precioBase)
    if (priceValidation !== true) errors.precioBase = priceValidation
  }
  
  const priceModelValidation = salonPriceModel(formData.modeloPrecio)
  if (priceModelValidation !== true) errors.modeloPrecio = priceModelValidation
  
  // Contacto
  const phoneValidation = salonContact.phone(formData.telefonoContacto)
  if (phoneValidation !== true) errors.telefonoContacto = phoneValidation
  
  if (formData.emailContacto) {
    const emailValidation = salonContact.email(formData.emailContacto)
    if (emailValidation !== true) errors.emailContacto = emailValidation
  }
  
  if (formData.whatsapp) {
    const whatsappValidation = salonContact.whatsapp(formData.whatsapp)
    if (whatsappValidation !== true) errors.whatsapp = whatsappValidation
  }
  
  // Servicios
  if (formData.servicios && formData.servicios.length > 0) {
    const servicesValidation = salonServices(formData.servicios)
    if (servicesValidation !== true) errors.servicios = servicesValidation
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// === VALIDACIONES EN TIEMPO REAL ===

export const createRealTimeValidator = (fieldName, validator) => {
  let timeout
  
  return (value, callback) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      const result = validator(value)
      callback(fieldName, result === true ? '' : result)
    }, 300) // Debounce de 300ms
  }
}

// === HELPERS DE VALIDACIÓN ===

export const hasErrors = (errors) => {
  return Object.values(errors).some(error => error && error.length > 0)
}

export const getFirstError = (errors) => {
  for (const error of Object.values(errors)) {
    if (error && error.length > 0) {
      return error
    }
  }
  return null
}

export const clearError = (errors, fieldName) => {
  return {
    ...errors,
    [fieldName]: ''
  }
}

export const setError = (errors, fieldName, message) => {
  return {
    ...errors,
    [fieldName]: message
  }
}