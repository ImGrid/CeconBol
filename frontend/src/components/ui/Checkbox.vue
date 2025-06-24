<template>
  <div class="checkbox-container">
    <label class="checkbox-wrapper">
      <input
        :id="checkboxId"
        ref="checkboxRef"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="checkbox-brand"
        @change="handleChange"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
      />
      
      <span v-if="label" class="checkbox-label">
        {{ label }}
      </span>
      <slot v-else />
    </label>
    
    <!-- Description slot -->
    <div v-if="$slots.description" class="checkbox-description">
      <slot name="description" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props SIMPLIFICADOS - Solo 3 esenciales
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['update:modelValue', 'change', 'focus', 'blur'])

// Refs
const checkboxRef = ref(null)

// Computed
const checkboxId = computed(() => `checkbox-${Math.random().toString(36).substr(2, 9)}`)

// Métodos
const handleChange = (event) => {
  const checked = event.target.checked
  emit('update:modelValue', checked)
  emit('change', checked, event)
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

<style scoped>
.checkbox-container {
  @apply space-y-2;
}

.checkbox-wrapper {
  @apply flex items-center space-x-3 cursor-pointer;
}

.checkbox-label {
  @apply text-sm font-medium text-gray-700 select-none;
}

.checkbox-description {
  @apply ml-6 text-sm text-gray-600;
}

.checkbox-wrapper:has(input:disabled) {
  @apply opacity-60 cursor-not-allowed;
}

.checkbox-wrapper:has(input:disabled) .checkbox-label {
  @apply cursor-not-allowed;
}
</style>