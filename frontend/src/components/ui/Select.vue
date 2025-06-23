<template>
  <div class="select-container">
    <!-- Label -->
    <label 
      v-if="label" 
      :for="selectId" 
      :class="[
        'form-label',
        { 'input-label-error': hasError, 'input-label-required': required }
      ]"
    >
      {{ label }}
    </label>

    <!-- Select container -->
    <div class="select-wrapper">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="selectClass"
        @change="handleChange"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      >
        <!-- Placeholder option -->
        <option 
          v-if="placeholder" 
          value="" 
          disabled 
          :selected="!modelValue"
        >
          {{ placeholder }}
        </option>
        
        <!-- Options normales -->
        <option
          v-for="option in normalizedOptions"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option>
        
        <!-- Slot para opciones personalizadas -->
        <slot name="options" />
      </select>

      <!-- Icono de chevron -->
      <div class="select-icon">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <!-- Loading spinner -->
      <div 
        v-if="loading" 
        class="select-loading"
      >
        <svg class="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      </div>
    </div>

    <!-- Error message -->
    <p 
      v-if="hasError" 
      class="input-error-message"
    >
      {{ error }}
    </p>

    <!-- Help text -->
    <p 
      v-if="helpText && !hasError" 
      class="input-help-text"
    >
      {{ helpText }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    default: ''
  },
  options: {
    type: Array,
    default: () => []
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
  loading: {
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
const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

// Computed
const selectId = computed(() => `select-${Math.random().toString(36).substr(2, 9)}`)

const hasError = computed(() => !!props.error)

const selectClass = computed(() => {
  const classes = ['form-select'] // Usar clase unificada de main.css
  
  // Tamaños
  const sizeClasses = {
    'small': 'select-small',
    'medium': 'select-medium',
    'large': 'select-large'
  }
  
  classes.push(sizeClasses[props.size])
  
  // Estados
  if (hasError.value) {
    classes.push('select-error')
  }
  
  if (props.disabled) {
    classes.push('select-disabled')
  }
  
  if (props.loading) {
    classes.push('select-loading-state')
  }
  
  return classes.join(' ')
})

// Normalizar options para manejar diferentes formatos
const normalizedOptions = computed(() => {
  return props.options.map(option => {
    // Si es string simple
    if (typeof option === 'string') {
      return { value: option, label: option, disabled: false }
    }
    
    // Si es objeto
    if (typeof option === 'object') {
      return {
        value: option.value !== undefined ? option.value : option.id,
        label: option.label || option.name || option.text || option.value || option.id,
        disabled: option.disabled || false
      }
    }
    
    // Fallback
    return { value: option, label: String(option), disabled: false }
  })
})

// Métodos
const handleChange = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)
  emit('change', value, event)
}
</script>

<style>
@import './ui.css';
</style>