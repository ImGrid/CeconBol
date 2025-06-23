<template>
  <div :class="containerClass">
    <div class="checkbox-wrapper">
      <!-- Checkbox input -->
      <input
        :id="checkboxId"
        ref="checkboxRef"
        type="checkbox"
        :checked="isChecked"
        :disabled="disabled"
        :required="required"
        :class="checkboxClass"
        @change="handleChange"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />
      
      <!-- Custom checkbox visual -->
      <div v-if="customStyle" :class="customCheckboxClass">
        <!-- Check icon -->
        <Transition
          enter-active-class="transition-all duration-150"
          enter-from-class="scale-50 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition-all duration-150"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-50 opacity-0"
        >
          <svg 
            v-if="isChecked"
            class="checkbox-check-icon"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="3" 
              d="M5 13l4 4L19 7"
            />
          </svg>
        </Transition>
        
        <!-- Indeterminate icon -->
        <Transition
          enter-active-class="transition-all duration-150"
          enter-from-class="scale-50 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition-all duration-150"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-50 opacity-0"
        >
          <svg 
            v-if="indeterminate && !isChecked"
            class="checkbox-indeterminate-icon"
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M6 12h12"/>
          </svg>
        </Transition>
      </div>
      
      <!-- Label -->
      <label 
        v-if="label || $slots.default"
        :for="checkboxId" 
        :class="labelClass"
      >
        <slot>{{ label }}</slot>
      </label>
    </div>
    
    <!-- Description -->
    <div v-if="description || $slots.description" class="checkbox-description">
      <slot name="description">{{ description }}</slot>
    </div>
    
    <!-- Error message -->
    <p v-if="error" class="checkbox-error">
      {{ error }}
    </p>
    
    <!-- Help text -->
    <p v-if="helpText && !error" class="checkbox-help">
      {{ helpText }}
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: [Boolean, Array],
    default: false
  },
  value: {
    type: [String, Number, Boolean],
    default: null
  },
  label: {
    type: String,
    default: ''
  },
  description: {
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
  indeterminate: {
    type: Boolean,
    default: false
  },
  customStyle: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'brand', 'success', 'warning', 'error'].includes(value)
  }
})

// Events
const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

// Refs
const checkboxRef = ref(null)

// Computed
const checkboxId = computed(() => `checkbox-${Math.random().toString(36).substr(2, 9)}`)

const isChecked = computed(() => {
  if (Array.isArray(props.modelValue)) {
    return props.value !== null ? props.modelValue.includes(props.value) : false
  }
  return !!props.modelValue
})

const containerClass = computed(() => {
  const classes = ['checkbox-container']
  
  if (props.disabled) {
    classes.push('checkbox-container-disabled')
  }
  
  if (props.error) {
    classes.push('checkbox-container-error')
  }
  
  return classes.join(' ')
})

const checkboxClass = computed(() => {
  const classes = []
  
  if (props.customStyle) {
    classes.push('checkbox-hidden') // Ocultar checkbox nativo
  } else {
    classes.push('checkbox-brand') // Usar clase de main.css
  }
  
  return classes.join(' ')
})

const customCheckboxClass = computed(() => {
  const classes = ['checkbox-custom']
  
  // Tamaños
  const sizeClasses = {
    'small': 'checkbox-custom-small',
    'medium': 'checkbox-custom-medium',
    'large': 'checkbox-custom-large'
  }
  
  classes.push(sizeClasses[props.size])
  
  // Variantes de color
  const variantClasses = {
    'default': 'checkbox-custom-default',
    'brand': 'checkbox-custom-brand',
    'success': 'checkbox-custom-success',
    'warning': 'checkbox-custom-warning',
    'error': 'checkbox-custom-error'
  }
  
  classes.push(variantClasses[props.variant])
  
  // Estados
  if (isChecked.value) {
    classes.push('checkbox-custom-checked')
  }
  
  if (props.indeterminate && !isChecked.value) {
    classes.push('checkbox-custom-indeterminate')
  }
  
  if (props.disabled) {
    classes.push('checkbox-custom-disabled')
  }
  
  if (props.error) {
    classes.push('checkbox-custom-error')
  }
  
  return classes.join(' ')
})

const labelClass = computed(() => {
  const classes = ['checkbox-label']
  
  // Tamaños
  const sizeClasses = {
    'small': 'checkbox-label-small',
    'medium': 'checkbox-label-medium',
    'large': 'checkbox-label-large'
  }
  
  classes.push(sizeClasses[props.size])
  
  // Estados
  if (props.disabled) {
    classes.push('checkbox-label-disabled')
  }
  
  if (props.error) {
    classes.push('checkbox-label-error')
  }
  
  return classes.join(' ')
})

// Métodos
const handleChange = (event) => {
  const checked = event.target.checked
  
  if (Array.isArray(props.modelValue)) {
    // Checkbox group mode
    const newValue = [...props.modelValue]
    
    if (checked) {
      if (props.value !== null && !newValue.includes(props.value)) {
        newValue.push(props.value)
      }
    } else {
      const index = newValue.indexOf(props.value)
      if (index > -1) {
        newValue.splice(index, 1)
      }
    }
    
    emit('update:modelValue', newValue)
    emit('change', newValue, event)
  } else {
    // Single checkbox mode
    emit('update:modelValue', checked)
    emit('change', checked, event)
  }
}

// Métodos expuestos
const focus = () => {
  checkboxRef.value?.focus()
}

const blur = () => {
  checkboxRef.value?.blur()
}

defineExpose({
  focus,
  blur
})
</script>

<style>
@import './ui.css';
</style>