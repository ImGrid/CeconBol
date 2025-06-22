<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Email -->
    <Input
      v-model="form.email"
      type="email"
      label="Correo electrónico"
      placeholder="ejemplo@correo.com"
      :error="errors.email"
      required
    />

    <!-- Contraseña -->
    <Input
      v-model="form.contrasena"
      type="password"
      label="Contraseña"
      placeholder="Ingresa tu contraseña"
      :error="errors.contrasena"
      required
    />

    <!-- Error general -->
    <div v-if="error" class="alert-error">
      {{ error }}
    </div>

    <!-- Botón de submit -->
    <Button
      type="submit"
      :loading="loading"
      :disabled="!isFormValid"
      full-width
    >
      Iniciar Sesión
    </Button>

    <!-- Enlaces adicionales -->
    <div class="text-center space-y-2">
      <p class="text-sm text-gray-600">
        ¿No tienes cuenta?
        <button
          type="button"
          class="text-brand-primary hover:text-primary-700 font-medium"
          @click="$emit('switch-to-register')"
        >
          Regístrate aquí
        </button>
      </p>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { isValidEmail } from '@/utils/helpers.js'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

// Events
const emit = defineEmits(['success', 'switch-to-register'])

// Composables
const { login, loading, error } = useAuth()

// Form data
const form = ref({
  email: '',
  contrasena: ''
})

// Validation errors
const errors = ref({
  email: '',
  contrasena: ''
})

// Computed
const isFormValid = computed(() => {
  return form.value.email && 
         form.value.contrasena && 
         !errors.value.email && 
         !errors.value.contrasena
})

// Validaciones en tiempo real
watch(() => form.value.email, (newEmail) => {
  if (newEmail && !isValidEmail(newEmail)) {
    errors.value.email = 'Correo electrónico inválido'
  } else {
    errors.value.email = ''
  }
})

watch(() => form.value.contrasena, (newPassword) => {
  if (newPassword && newPassword.length < 6) {
    errors.value.contrasena = 'La contraseña debe tener al menos 6 caracteres'
  } else {
    errors.value.contrasena = ''
  }
})

// Métodos
const handleSubmit = async () => {
  // Validación final
  if (!isFormValid.value) return
  
  try {
    await login({
      email: form.value.email,
      contrasena: form.value.contrasena
    })
    
    // Emitir evento de éxito
    emit('success')
    
  } catch (err) {
    // El error ya se maneja en el composable useAuth
    console.error('Login failed:', err)
  }
}
</script>