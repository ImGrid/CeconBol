<template>
  <div class="space-y-2">
    <!-- Label -->
    <label 
      v-if="label" 
      :for="inputId" 
      class="label-field"
      :class="{ 'text-red-600': hasError }"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Input container -->
    <div class="relative">
      <!-- Icon (si se proporciona) -->
      <div 
        v-if="icon" 
        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
      >
        <component :is="icon" class="h-5 w-5 text-gray-400" />
      </div>

      <!-- Input field -->
      <input
        :id="inputId"
        :type="type"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="inputClass"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />

      <!-- Loading spinner -->
      <div 
        v-if="loading" 
        class="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <svg class="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
      </div>
    </div>

    <!-- Error message -->
    <p 
      v-if="hasError" 
      class="text-sm text-red-600"
    >
      {{ error }}
    </p>

    <!-- Help text -->
    <p 
      v-if="helpText && !hasError" 
      class="text-sm text-gray-500"
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
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'email', 'password', 'number', 'tel', 'url'].includes(value)
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
  icon: {
    type: [String, Object],
    default: null
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
  }
})

// Events
defineEmits(['update:modelValue', 'blur', 'focus'])

// Computed
const inputId = computed(() => `input-${Math.random().toString(36).substr(2, 9)}`)

const hasError = computed(() => !!props.error)

const inputClass = computed(() => {
  const baseClass = 'input-field' // Clase definida en main.css
  
  // Estados
  const stateClasses = []
  
  if (hasError.value) {
    stateClasses.push('border-red-300 focus:ring-red-500 focus:border-red-500')
  }
  
  if (props.disabled) {
    stateClasses.push('opacity-50 cursor-not-allowed bg-gray-50')
  }
  
  // Si hay icono, añadir padding izquierdo
  if (props.icon) {
    stateClasses.push('pl-10')
  }
  
  // Si hay loading, añadir padding derecho
  if (props.loading) {
    stateClasses.push('pr-10')
  }
  
  return [baseClass, ...stateClasses].join(' ')
})
</script>