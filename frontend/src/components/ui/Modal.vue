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
        class="modal-backdrop"
        @click="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="modal-backdrop-overlay" />
        
        <!-- Modal container -->
        <div class="modal-container">
          <Transition
            enter-active-class="transition-all duration-300"
            enter-from-class="scale-95 opacity-0"
            enter-to-class="scale-100 opacity-100"
            leave-active-class="transition-all duration-200"
            leave-from-class="scale-100 opacity-100"
            leave-to-class="scale-95 opacity-0"
          >
            <div
              v-if="show"
              :class="modalClass"
              @click.stop
            >
              <!-- Header -->
              <div v-if="!hideHeader" class="modal-header">
                <h3 class="modal-title">
                  {{ title }}
                </h3>
                
                <button
                  v-if="!hideCloseButton"
                  type="button"
                  class="modal-close-btn"
                  @click="$emit('close')"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Body -->
              <div class="modal-body">
                <slot />
              </div>

              <!-- Footer -->
              <div v-if="!hideFooter" class="modal-footer">
                <slot name="footer">
                  <div class="modal-footer-actions">
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
import { computed, watch, onUnmounted } from 'vue'
import Button from './Button.vue' // ✅ CORREGIDO: Import correcto

// Props SIMPLIFICADOS - Solo lo esencial
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
    validator: (value) => ['small', 'medium', 'large'].includes(value) // Eliminamos 'xl'
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
  const classes = ['modal-content']
  
  // Solo 3 tamaños reales (eliminamos xl que nunca se usa)
  const sizeClasses = {
    'small': 'modal-small',
    'medium': 'modal-medium',
    'large': 'modal-large'
  }
  
  classes.push(sizeClasses[props.size])
  return classes.join(' ')
})

// Métodos
const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}

// Manejar tecla ESC
const handleEscKey = (event) => {
  if (event.key === 'Escape' && props.closeOnBackdrop) {
    emit('close')
  }
}

// Watchers
watch(() => props.show, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleEscKey)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleEscKey)
    document.body.style.overflow = ''
  }
})

// Cleanup al desmontar
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
  document.body.style.overflow = ''
})
</script>

<style>
@import './ui.css';
</style>