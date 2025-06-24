import { ref, reactive, computed } from 'vue'
import { debounce } from '@/utils/helpers.js'
// ✅ CORREGIDO: Usar validators.js como fuente única de verdad
import * as validators from '@/utils/validators.js'

/**
 * Composable simplificado para validación de formularios
 * CORREGIDO: Elimina duplicaciones, usa validators.js
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

  const isDirty = computed(() => {
    return Object.values(touched).some(isTouched => isTouched)
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
    isDirty,

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

// === ✅ COMPOSABLE ESPECÍFICO PARA SALONES - SIMPLIFICADO ===
export const useSalonFormValidation = (initialData = {}) => {
  // ✅ CORREGIDO: Usar validators.js como fuente única
  const validationRules = {
    nombre: validators.salonName,
    descripcion: validators.salonDescription,
    direccion: validators.salonAddress,
    ciudad: validators.salonCity,
    capacidadMinima: validators.salonCapacityMin,
    capacidadMaxima: (value) => validators.salonCapacityMax(value, initialData.capacidadMinima),
    modeloPrecio: validators.salonPriceModel,
    precioBase: (value) => {
      // Solo validar precio si no es personalizado
      if (initialData.modeloPrecio === 'personalizado') return true
      return validators.salonPrice(value)
    },
    telefonoContacto: validators.phone,
    emailContacto: (value) => {
      // Email es opcional
      if (!value) return true
      return validators.email(value)
    },
    whatsapp: (value) => {
      // WhatsApp es opcional
      if (!value) return true
      return validators.phone(value)
    }
  }

  return useFormValidation(initialData, validationRules)
}

// === COMPOSABLE PARA AUTH FORMS ===
export const useAuthFormValidation = (formType = 'login', initialData = {}) => {
  const baseRules = {
    email: validators.email,
    contrasena: (value) => {
      if (!value) return 'La contraseña es requerida'
      if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres'
      return true
    }
  }

  let validationRules = { ...baseRules }

  if (formType === 'register') {
    validationRules = {
      ...baseRules,
      nombre: (value) => {
        if (!value) return 'El nombre es requerido'
        if (value.length < 2) return 'El nombre debe tener al menos 2 caracteres'
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return 'El nombre solo puede contener letras'
        }
        return true
      },
      apellido: (value) => {
        if (!value) return 'El apellido es requerido'
        if (value.length < 2) return 'El apellido debe tener al menos 2 caracteres'
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          return 'El apellido solo puede contener letras'
        }
        return true
      },
      ciudad: validators.salonCity,
      telefono: (value) => {
        // Teléfono es opcional en registro
        if (!value) return true
        return validators.phone(value)
      },
      rol: validators.required,
      confirmarContrasena: (value, formData) => {
        if (!value) return 'Confirma tu contraseña'
        if (value !== formData.contrasena) return 'Las contraseñas no coinciden'
        return true
      }
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