<template>
  <div class="textarea-container">
    <!-- Label -->
    <label 
      v-if="label" 
      :for="textareaId" 
      :class="[
        'form-label',
        { 'input-label-error': hasError, 'input-label-required': required }
      ]"
    >
      {{ label }}
    </label>

    <!-- Textarea container -->
    <div class="textarea-wrapper">
      <textarea
        :id="textareaId"
        ref="textareaRef"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :rows="rows"
        :maxlength="maxLength"
        :class="textareaClass"
        @input="handleInput"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        @keydown="handleKeydown"
      ></textarea>

      <!-- Resize handle (opcional) -->
      <div v-if="showResizeHandle" class="textarea-resize-handle">
        <svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3L3 10h14l-7-7zM10 17l7-7H3l7 7z"/>
        </svg>
      </div>
    </div>

    <!-- Footer con contador y ayuda -->
    <div v-if="showFooter" class="textarea-footer">
      <!-- Help text -->
      <p v-if="helpText && !hasError" class="textarea-help">
        {{ helpText }}
      </p>
      
      <!-- Error message -->
      <p v-if="hasError" class="textarea-error">
        {{ error }}
      </p>
      
      <!-- Character counter -->
      <div v-if="showCounter" class="textarea-counter">
        <span :class="counterClass">
          {{ characterCount }}
          <span v-if="maxLength">/ {{ maxLength }}</span>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 4
  },
  maxLength: {
    type: Number,
    default: null
  },
  minLength: {
    type: Number,
    default: null
  },
  autoResize: {
    type: Boolean,
    default: false
  },
  showCounter: {
    type: Boolean,
    default: true
  },
  showResizeHandle: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

// Events
const emit = defineEmits(['update:modelValue', 'blur', 'focus', 'keydown'])

// Estado local
const textareaRef = ref(null)

// Computed
const textareaId = computed(() => `textarea-${Math.random().toString(36).substr(2, 9)}`)

const hasError = computed(() => !!props.error)

const characterCount = computed(() => props.modelValue?.length || 0)

const showFooter = computed(() => {
  return props.showCounter || props.helpText || hasError.value
})

const counterClass = computed(() => {
  const baseClass = 'text-xs'
  
  if (!props.maxLength) return `${baseClass} text-gray-500`
  
  const percentage = (characterCount.value / props.maxLength) * 100
  
  if (percentage >= 95) return `${baseClass} text-red-600 font-medium`
  if (percentage >= 80) return `${baseClass} text-amber-600`
  return `${baseClass} text-gray-500`
})

const textareaClass = computed(() => {
  const classes = ['form-input', 'textarea-base'] // Usar clases base
  
  // Tamaños
  const sizeClasses = {
    'small': 'textarea-small',
    'medium': 'textarea-medium',
    'large': 'textarea-large'
  }
  
  classes.push(sizeClasses[props.size])
  
  // Estados
  if (hasError.value) {
    classes.push('textarea-error')
  }
  
  if (props.disabled) {
    classes.push('textarea-disabled')
  }
  
  if (props.autoResize) {
    classes.push('textarea-auto-resize')
  }
  
  return classes.join(' ')
})

// Métodos
const handleInput = (event) => {
  const value = event.target.value
  
  // Validar longitud máxima
  if (props.maxLength && value.length > props.maxLength) {
    return // No permitir más caracteres
  }
  
  emit('update:modelValue', value)
  
  // Auto-resize si está habilitado
  if (props.autoResize) {
    autoResizeTextarea(event.target)
  }
}

const handleKeydown = (event) => {
  emit('keydown', event)
  
  // Shortcuts útiles
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'Enter':
        // Ctrl+Enter para enviar formulario (si está en un form)
        const form = event.target.closest('form')
        if (form) {
          event.preventDefault()
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
        }
        break
    }
  }
}

const autoResizeTextarea = (textarea) => {
  // Reset height to get the correct scrollHeight
  textarea.style.height = 'auto'
  
  // Calculate new height
  const newHeight = Math.min(textarea.scrollHeight, 300) // Max 300px
  textarea.style.height = `${newHeight}px`
}

// Métodos expuestos para el componente padre
const focus = () => {
  textareaRef.value?.focus()
}

const blur = () => {
  textareaRef.value?.blur()
}

const selectAll = () => {
  textareaRef.value?.select()
}

// Exponer métodos al padre
defineExpose({
  focus,
  blur,
  selectAll
})
</script>

<style>
@import './ui.css';
</style>