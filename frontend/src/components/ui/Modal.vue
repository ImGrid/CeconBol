<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50" />
        
        <!-- Modal container -->
        <div class="flex min-h-full items-center justify-center p-4">
          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="show"
              :class="modalClass"
              @click.stop
            >
              <!-- Header -->
              <div v-if="!hideHeader" class="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ title }}
                </h3>
                
                <button
                  v-if="!hideCloseButton"
                  type="button"
                  class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  @click="$emit('close')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Body -->
              <div :class="bodyClass">
                <slot />
              </div>

              <!-- Footer -->
              <div v-if="!hideFooter" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <slot name="footer">
                  <div class="flex justify-end space-x-3">
                    <Button
                      v-if="!hideCancelButton"
                      variant="outline-primary"
                      @click="$emit('close')"
                    >
                      {{ cancelText }}
                    </Button>
                    
                    <Button
                      v-if="!hideConfirmButton"
                      :loading="loading"
                      @click="$emit('confirm')"
                    >
                      {{ confirmText }}
                    </Button>
                  </div>
                </slot>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import Button from './Button.vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large', 'xl'].includes(value)
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  hideHeader: {
    type: Boolean,
    default: false
  },
  hideFooter: {
    type: Boolean,
    default: false
  },
  hideCloseButton: {
    type: Boolean,
    default: false
  },
  hideCancelButton: {
    type: Boolean,
    default: false
  },
  hideConfirmButton: {
    type: Boolean,
    default: false
  },
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Events
const emit = defineEmits(['close', 'confirm'])

// Computed
const modalClass = computed(() => {
  const baseClass = 'relative bg-white rounded-xl shadow-xl w-full'
  
  const sizeClasses = {
    'small': 'max-w-md',
    'medium': 'max-w-lg',
    'large': 'max-w-2xl',
    'xl': 'max-w-4xl'
  }
  
  return [baseClass, sizeClasses[props.size]].join(' ')
})

const bodyClass = computed(() => {
  return props.hideHeader && props.hideFooter ? 'p-6' : 'p-6'
})

// Métodos
const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}

// Manejar tecla ESC
watch(() => props.show, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleEscKey)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleEscKey)
    document.body.style.overflow = ''
  }
})

const handleEscKey = (event) => {
  if (event.key === 'Escape' && props.closeOnBackdrop) {
    emit('close')
  }
}

// Cleanup al desmontar
import { onUnmounted } from 'vue'

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
  document.body.style.overflow = ''
})
</script>