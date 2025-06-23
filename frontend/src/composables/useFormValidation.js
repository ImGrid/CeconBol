import { ref, reactive, computed, watch, nextTick } from 'vue'
import { debounce } from '@/utils/helpers.js'

/**
 * Composable para manejar validaciones de formularios
 * @param {Object} initialData - Datos iniciales del formulario
 * @param {Object} validationRules - Reglas de validación por campo
 * @param {Object} options - Opciones de configuración
 */
export const useFormValidation = (initialData = {}, validationRules = {}, options = {}) => {
  // === CONFIGURACIÓN ===
  const config = {
    validateOnBlur: true,
    validateOnChange: false,
    validateOnSubmit: true,
    debounceMs: 300,
    showErrorsImmediately: false,
    ...options
  }

  // === ESTADO ===
  const formData = reactive({ ...initialData })
  const errors = reactive({})
  const touched = reactive({})
  const validating = reactive({})
  const isSubmitting = ref(false)
  const hasAttemptedSubmit = ref(false)

  // === COMPUTED ===
  const isValid = computed(() => {
    return Object.keys(errors).length === 0 || 
           Object.values(errors).every(error => !error)
  })

  const isDirty = computed(() => {
    return Object.keys(touched).some(field => touched[field])
  })

  const hasErrors = computed(() => {
    return Object.values(errors).some(error => error && error.length > 0)
  })

  const touchedFields = computed(() => {
    return Object.keys(touched).filter(field => touched[field])
  })

  const invalidFields = computed(() => {
    return Object.keys(errors).filter(field => errors[field] && errors[field].length > 0)
  })

  // === VALIDACIÓN DE CAMPO INDIVIDUAL ===
  const validateField = async (fieldName, value = formData[fieldName]) => {
    const rules = validationRules[fieldName]
    if (!rules) return true

    validating[fieldName] = true
    errors[fieldName] = ''

    try {
      // Si rules es una función, ejecutarla
      if (typeof rules === 'function') {
        const result = await rules(value, formData)
        if (result !== true) {
          errors[fieldName] = result
          return false
        }
      }
      
      // Si rules es un array de funciones
      else if (Array.isArray(rules)) {
        for (const rule of rules) {
          const result = await rule(value, formData)
          if (result !== true) {
            errors[fieldName] = result
            return false
          }
        }
      }

      return true
    } catch (error) {
      errors[fieldName] = 'Error de validación'
      console.error(`Validation error for ${fieldName}:`, error)
      return false
    } finally {
      validating[fieldName] = false
    }
  }

  // === VALIDACIÓN CON DEBOUNCE ===
  const debouncedValidateField = debounce(validateField, config.debounceMs)

  // === VALIDACIÓN DE TODO EL FORMULARIO ===
  const validateForm = async () => {
    const fieldNames = Object.keys(validationRules)
    const results = await Promise.all(
      fieldNames.map(fieldName => validateField(fieldName))
    )

    return results.every(result => result === true)
  }

  // === MANEJO DE EVENTOS ===
  const handleFieldChange = async (fieldName, value) => {
    formData[fieldName] = value

    if (config.validateOnChange || touched[fieldName] || hasAttemptedSubmit.value) {
      await debouncedValidateField(fieldName, value)
    }
  }

  const handleFieldBlur = async (fieldName) => {
    touched[fieldName] = true

    if (config.validateOnBlur) {
      await validateField(fieldName)
    }
  }

  const handleFieldFocus = (fieldName) => {
    // Limpiar error al hacer focus si la configuración lo permite
    if (config.showErrorsImmediately && errors[fieldName]) {
      errors[fieldName] = ''
    }
  }

  // === SUBMIT DEL FORMULARIO ===
  const handleSubmit = async (submitCallback) => {
    hasAttemptedSubmit.value = true
    isSubmitting.value = true

    try {
      // Marcar todos los campos como touched
      Object.keys(validationRules).forEach(fieldName => {
        touched[fieldName] = true
      })

      // Validar todo el formulario
      const isFormValid = await validateForm()

      if (!isFormValid) {
        // Scroll al primer error
        await nextTick()
        scrollToFirstError()
        return { success: false, errors: { ...errors } }
      }

      // Ejecutar callback de submit
      if (submitCallback) {
        const result = await submitCallback({ ...formData })
        return { success: true, data: result }
      }

      return { success: true, data: { ...formData } }
    } catch (error) {
      console.error('Form submission error:', error)
      return { 
        success: false, 
        error: error.message || 'Error al enviar el formulario' 
      }
    } finally {
      isSubmitting.value = false
    }
  }

  // === UTILIDADES ===
  const scrollToFirstError = () => {
    const firstErrorField = invalidFields.value[0]
    if (firstErrorField) {
      const element = document.querySelector(`[name="${firstErrorField}"], #${firstErrorField}`)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        })
        element.focus()
      }
    }
  }

  const clearErrors = () => {
    Object.keys(errors).forEach(field => {
      errors[field] = ''
    })
  }

  const clearTouched = () => {
    Object.keys(touched).forEach(field => {
      touched[field] = false
    })
  }

  const resetForm = (newData = initialData) => {
    Object.keys(formData).forEach(field => {
      delete formData[field]
    })
    Object.assign(formData, { ...newData })
    
    clearErrors()
    clearTouched()
    hasAttemptedSubmit.value = false
    isSubmitting.value = false
  }

  const setFieldValue = (fieldName, value) => {
    formData[fieldName] = value
  }

  const setFieldError = (fieldName, error) => {
    errors[fieldName] = error
  }

  const clearFieldError = (fieldName) => {
    errors[fieldName] = ''
  }

  const setFormData = (newData) => {
    Object.assign(formData, newData)
  }

  const setFormErrors = (newErrors) => {
    Object.assign(errors, newErrors)
  }

  // === WATCHERS ===
  // Watch para validación automática en cambios (opcional)
  if (config.validateOnChange) {
    Object.keys(validationRules).forEach(fieldName => {
      watch(
        () => formData[fieldName],
        (newValue) => {
          if (touched[fieldName] || hasAttemptedSubmit.value) {
            debouncedValidateField(fieldName, newValue)
          }
        }
      )
    })
  }

  // === RETURN ===
  return {
    // Estado
    formData,
    errors,
    touched,
    validating,
    isSubmitting,
    hasAttemptedSubmit,

    // Computed
    isValid,
    isDirty,
    hasErrors,
    touchedFields,
    invalidFields,

    // Métodos de validación
    validateField,
    validateForm,

    // Manejadores de eventos
    handleFieldChange,
    handleFieldBlur,
    handleFieldFocus,
    handleSubmit,

    // Utilidades
    clearErrors,
    clearTouched,
    resetForm,
    setFieldValue,
    setFieldError,
    clearFieldError,
    setFormData,
    setFormErrors,
    scrollToFirstError
  }
}

// === COMPOSABLE ESPECÍFICO PARA SALONES ===
export const useSalonFormValidation = (initialData = {}) => {
  // Importar validadores específicos

  const validationRules = {
    nombre: async (value) => {
      const { salonName } = await import('@/utils/validators.js')
      return salonName(value)
    },
    
    descripcion: async (value) => {
      const { salonDescription } = await import('@/utils/validators.js')
      return salonDescription(value)
    },
    
    direccion: async (value) => {
      const { salonAddress } = await import('@/utils/validators.js')
      return salonAddress(value)
    },
    
    ciudad: async (value) => {
      const { salonCity } = await import('@/utils/validators.js')
      return salonCity(value)
    },
    
    capacidadMinima: async (value, formData) => {
      const { salonCapacity } = await import('@/utils/validators.js')
      const { validateMin } = salonCapacity(value, formData.capacidadMaxima)
      return validateMin(value)
    },
    
    capacidadMaxima: async (value, formData) => {
      const { salonCapacity } = await import('@/utils/validators.js')
      const { validateMax } = salonCapacity(formData.capacidadMinima, value)
      return validateMax(value)
    },
    
    precioBase: async (value, formData) => {
      if (formData.modeloPrecio === 'personalizado') return true
      const { salonPrice } = await import('@/utils/validators.js')
      return salonPrice(value)
    },
    
    modeloPrecio: async (value) => {
      const { salonPriceModel } = await import('@/utils/validators.js')
      return salonPriceModel(value)
    },
    
    telefonoContacto: async (value) => {
      const { salonContact } = await import('@/utils/validators.js')
      return salonContact.phone(value)
    },
    
    emailContacto: async (value) => {
      if (!value) return true // Opcional
      const { salonContact } = await import('@/utils/validators.js')
      return salonContact.email(value)
    },
    
    whatsapp: async (value) => {
      if (!value) return true // Opcional
      const { salonContact } = await import('@/utils/validators.js')
      return salonContact.whatsapp(value)
    }
  }

  return useFormValidation(initialData, validationRules, {
    validateOnBlur: true,
    validateOnChange: false,
    debounceMs: 500 // Más lento para formularios complejos
  })
}

// === HELPERS PARA FORMULARIOS ===
export const createFieldProps = (formValidation, fieldName) => {
  return {
    modelValue: formValidation.formData[fieldName],
    error: formValidation.errors[fieldName],
    'onUpdate:modelValue': (value) => formValidation.handleFieldChange(fieldName, value),
    onBlur: () => formValidation.handleFieldBlur(fieldName),
    onFocus: () => formValidation.handleFieldFocus(fieldName)
  }
}

export const createSelectProps = (formValidation, fieldName) => {
  return {
    ...createFieldProps(formValidation, fieldName),
    onChange: (value) => formValidation.handleFieldChange(fieldName, value)
  }
}