import { ref, reactive, computed } from 'vue'
import { debounce } from '@/utils/helpers.js'

/**
 * Composable simplificado para validación de formularios
 * @param {Object} initialData - Datos iniciales del formulario
 * @param {Object} validationRules - Reglas de validación por campo
 */
export const useFormValidation = (initialData = {}, validationRules = {}) => {
  // === ESTADO ===
  const formData = reactive({ ...initialData })
  const errors = reactive({})
  const touched = reactive({})
  const isSubmitting = ref(false)

  // === COMPUTED ===
  const isValid = computed(() => {
    return Object.keys(errors).length === 0 || 
           !Object.values(errors).some(error => error)
  })

  const hasErrors = computed(() => {
    return Object.values(errors).some(error => error)
  })

  // === VALIDACIÓN DE CAMPO ===
  const validateField = async (fieldName, value = formData[fieldName]) => {
    const rule = validationRules[fieldName]
    if (!rule) return true

    try {
      let result
      if (typeof rule === 'function') {
        result = await rule(value, formData)
      } else if (Array.isArray(rule)) {
        // Ejecutar reglas en secuencia
        for (const r of rule) {
          result = await r(value, formData)
          if (result !== true) break
        }
      }

      if (result === true) {
        errors[fieldName] = ''
        return true
      } else {
        errors[fieldName] = result
        return false
      }
    } catch (error) {
      errors[fieldName] = 'Error de validación'
      return false
    }
  }

  // === VALIDACIÓN CON DEBOUNCE ===
  const validateFieldDebounced = debounce(validateField, 300)

  // === VALIDACIÓN COMPLETA ===
  const validateForm = async () => {
    const fieldNames = Object.keys(validationRules)
    const results = await Promise.all(
      fieldNames.map(fieldName => validateField(fieldName))
    )
    return results.every(result => result === true)
  }

  // === MANEJADORES ===
  const handleFieldChange = (fieldName, value) => {
    formData[fieldName] = value
    
    // Validar inmediatamente si ya fue tocado
    if (touched[fieldName]) {
      validateFieldDebounced(fieldName, value)
    }
  }

  const handleFieldBlur = (fieldName) => {
    touched[fieldName] = true
    validateField(fieldName)
  }

  const handleSubmit = async (submitCallback) => {
    isSubmitting.value = true

    try {
      // Marcar todos como touched
      Object.keys(validationRules).forEach(fieldName => {
        touched[fieldName] = true
      })

      // Validar formulario
      const isFormValid = await validateForm()
      
      if (!isFormValid) {
        return { success: false, errors: { ...errors } }
      }

      // Ejecutar callback
      if (submitCallback) {
        const result = await submitCallback({ ...formData })
        return { success: true, data: result }
      }

      return { success: true, data: { ...formData } }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Error al enviar el formulario' 
      }
    } finally {
      isSubmitting.value = false
    }
  }

  // === UTILIDADES ===
  const resetForm = (newData = initialData) => {
    Object.keys(formData).forEach(field => {
      formData[field] = newData[field] || ''
    })
    Object.keys(errors).forEach(field => {
      errors[field] = ''
    })
    Object.keys(touched).forEach(field => {
      touched[field] = false
    })
    isSubmitting.value = false
  }

  const setFieldValue = (fieldName, value) => {
    formData[fieldName] = value
  }

  const setFieldError = (fieldName, error) => {
    errors[fieldName] = error
  }

  const clearErrors = () => {
    Object.keys(errors).forEach(field => {
      errors[field] = ''
    })
  }

  return {
    // Estado
    formData,
    errors,
    touched,
    isSubmitting,

    // Computed
    isValid,
    hasErrors,

    // Métodos
    validateField,
    validateForm,
    handleFieldChange,
    handleFieldBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    clearErrors
  }
}

// === COMPOSABLE ESPECÍFICO PARA SALONES ===
export const useSalonFormValidation = (initialData = {}) => {
  const validationRules = {
    nombre: (value) => {
      if (!value) return 'El nombre es requerido'
      if (value.length < 3) return 'El nombre debe tener al menos 3 caracteres'
      if (value.length > 100) return 'El nombre no puede exceder 100 caracteres'
      return true
    },
    
    descripcion: (value) => {
      if (!value) return 'La descripción es requerida'
      if (value.length < 50) return 'La descripción debe tener al menos 50 caracteres'
      if (value.length > 1000) return 'La descripción no puede exceder 1000 caracteres'
      return true
    },
    
    direccion: (value) => {
      if (!value) return 'La dirección es requerida'
      if (value.length < 10) return 'La dirección debe ser más específica'
      return true
    },
    
    ciudad: (value) => {
      if (!value) return 'La ciudad es requerida'
      return true
    },
    
    capacidadMinima: (value) => {
      if (!value) return 'La capacidad mínima es requerida'
      const num = parseInt(value)
      if (isNaN(num) || num <= 0) return 'Debe ser un número positivo'
      if (num > 10000) return 'No puede exceder 10,000 personas'
      return true
    },
    
    capacidadMaxima: (value, formData) => {
      if (!value) return 'La capacidad máxima es requerida'
      const num = parseInt(value)
      if (isNaN(num) || num <= 0) return 'Debe ser un número positivo'
      if (num > 10000) return 'No puede exceder 10,000 personas'
      
      const min = parseInt(formData.capacidadMinima)
      if (!isNaN(min) && num < min) {
        return 'Debe ser mayor o igual a la capacidad mínima'
      }
      return true
    },
    
    precioBase: (value, formData) => {
      if (formData.modeloPrecio === 'personalizado') return true
      if (!value) return 'El precio es requerido'
      const num = parseFloat(value)
      if (isNaN(num) || num <= 0) return 'Debe ser un número positivo'
      if (num < 100) return 'El precio mínimo es Bs. 100'
      if (num > 1000000) return 'El precio no puede exceder Bs. 1,000,000'
      return true
    },
    
    telefonoContacto: (value) => {
      if (!value) return 'El teléfono es requerido'
      const phoneRegex = /^\d{7,8}$/
      if (!phoneRegex.test(value)) return 'Debe tener 7 u 8 dígitos'
      return true
    },
    
    emailContacto: (value) => {
      if (!value) return true // Opcional
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) return 'Email inválido'
      return true
    },
    
    whatsapp: (value) => {
      if (!value) return true // Opcional
      const phoneRegex = /^\d{7,8}$/
      if (!phoneRegex.test(value)) return 'Debe tener 7 u 8 dígitos'
      return true
    }
  }

  return useFormValidation(initialData, validationRules)
}

// === HELPER PARA CREAR PROPS DE CAMPO ===
export const createFieldProps = (formValidation, fieldName) => {
  return {
    modelValue: formValidation.formData[fieldName],
    error: formValidation.errors[fieldName],
    'onUpdate:modelValue': (value) => formValidation.handleFieldChange(fieldName, value),
    onBlur: () => formValidation.handleFieldBlur(fieldName)
  }
}