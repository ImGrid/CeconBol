<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Nombre -->
    <div class="form-group">
      <Input
        v-model="form.nombre"
        type="text"
        label="Nombre"
        placeholder="Tu nombre"
        :error="errors.nombre"
        required
      />
    </div>

    <!-- Apellido -->
    <div class="form-group">
      <Input
        v-model="form.apellido"
        type="text"
        label="Apellido"
        placeholder="Tu apellido"
        :error="errors.apellido"
        required
      />
    </div>

    <!-- Email -->
    <div class="form-group">
      <Input
        v-model="form.email"
        type="email"
        label="Correo electrónico"
        placeholder="ejemplo@correo.com"
        :error="errors.email"
        required
      />
    </div>

    <!-- Teléfono -->
    <div class="form-group">
      <Input
        v-model="form.telefono"
        type="tel"
        label="Teléfono (opcional)"
        placeholder="70123456"
        :error="errors.telefono"
        help-text="Formato: 7 u 8 dígitos"
      />
    </div>

    <!-- Ciudad -->
    <div class="form-group">
      <label class="form-label">
        Ciudad <span class="text-red-500 ml-1">*</span>
      </label>
      <select
        v-model="form.ciudad"
        class="form-select"
        :class="{ 'border-red-300': errors.ciudad }"
        required
      >
        <option value="">Selecciona tu ciudad</option>
        <option v-for="ciudad in CIUDADES_BOLIVIA" :key="ciudad" :value="ciudad">
          {{ ciudad }}
        </option>
      </select>
      <p v-if="errors.ciudad" class="text-sm text-red-600">
        {{ errors.ciudad }}
      </p>
    </div>

    <!-- Rol -->
    <div class="form-group">
      <label class="form-label">
        Tipo de cuenta <span class="text-red-500 ml-1">*</span>
      </label>
      <div class="space-y-3">
        <label class="flex items-center">
          <input
            v-model="form.rol"
            type="radio"
            value="cliente"
            class="radio-brand"
          />
          <span class="ml-3">
            <span class="font-medium">Cliente</span>
            <span class="block text-sm text-gray-500">Busco salones para mis eventos</span>
          </span>
        </label>
        <label class="flex items-center">
          <input
            v-model="form.rol"
            type="radio"
            value="proveedor"
            class="radio-brand"
          />
          <span class="ml-3">
            <span class="font-medium">Proveedor</span>
            <span class="block text-sm text-gray-500">Tengo salones para ofrecer</span>
          </span>
        </label>
      </div>
      <p v-if="errors.rol" class="text-sm text-red-600">
        {{ errors.rol }}
      </p>
    </div>

    <!-- Contraseña -->
    <div class="form-group">
      <Input
        v-model="form.contrasena"
        type="password"
        label="Contraseña"
        placeholder="Mínimo 6 caracteres"
        :error="errors.contrasena"
        help-text="Debe contener al menos una mayúscula, una minúscula y un número"
        required
      />
    </div>

    <!-- Confirmar contraseña -->
    <div class="form-group">
      <Input
        v-model="form.confirmarContrasena"
        type="password"
        label="Confirmar contraseña"
        placeholder="Repite tu contraseña"
        :error="errors.confirmarContrasena"
        required
      />
    </div>

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
      Crear Cuenta
    </Button>

    <!-- Enlaces adicionales -->
    <div class="text-center space-y-2">
      <p class="text-sm text-gray-600">
        ¿Ya tienes cuenta?
        <button
          type="button"
          class="text-brand-primary hover:text-primary-700 font-medium"
          @click="$emit('switch-to-login')"
        >
          Inicia sesión aquí
        </button>
      </p>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuth } from '@/composables/useAuth.js'
import { isValidEmail, isValidBolivianPhone } from '@/utils/helpers.js'
import { CIUDADES_BOLIVIA } from '@/utils/constants.js'
import Input from '@/components/ui/Input.vue'
import Button from '@/components/ui/Button.vue'

// Events
const emit = defineEmits(['success', 'switch-to-login'])

// Composables
const { register, loading, error } = useAuth()

// Form data
const form = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  ciudad: '',
  rol: 'cliente',
  contrasena: '',
  confirmarContrasena: ''
})

// Validation errors
const errors = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  ciudad: '',
  rol: '',
  contrasena: '',
  confirmarContrasena: ''
})

// Computed
const isFormValid = computed(() => {
  return form.value.nombre &&
         form.value.apellido &&
         form.value.email &&
         form.value.ciudad &&
         form.value.rol &&
         form.value.contrasena &&
         form.value.confirmarContrasena &&
         !Object.values(errors.value).some(error => error)
})

// Validaciones
watch(() => form.value.nombre, (newName) => {
  if (newName && (newName.length < 2 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(newName))) {
    errors.value.nombre = 'Nombre inválido (solo letras, mínimo 2 caracteres)'
  } else {
    errors.value.nombre = ''
  }
})

watch(() => form.value.apellido, (newLastName) => {
  if (newLastName && (newLastName.length < 2 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(newLastName))) {
    errors.value.apellido = 'Apellido inválido (solo letras, mínimo 2 caracteres)'
  } else {
    errors.value.apellido = ''
  }
})

watch(() => form.value.email, (newEmail) => {
  if (newEmail && !isValidEmail(newEmail)) {
    errors.value.email = 'Correo electrónico inválido'
  } else {
    errors.value.email = ''
  }
})

watch(() => form.value.telefono, (newPhone) => {
  if (newPhone && !isValidBolivianPhone(newPhone)) {
    errors.value.telefono = 'Teléfono inválido (7 u 8 dígitos)'
  } else {
    errors.value.telefono = ''
  }
})

watch(() => form.value.contrasena, (newPassword) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/
  if (newPassword && (newPassword.length < 6 || !passwordRegex.test(newPassword))) {
    errors.value.contrasena = 'Contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número'
  } else {
    errors.value.contrasena = ''
  }
})

watch(() => form.value.confirmarContrasena, (newConfirm) => {
  if (newConfirm && newConfirm !== form.value.contrasena) {
    errors.value.confirmarContrasena = 'Las contraseñas no coinciden'
  } else {
    errors.value.confirmarContrasena = ''
  }
})

// Métodos
const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  try {
    const userData = {
      nombre: form.value.nombre,
      apellido: form.value.apellido,
      email: form.value.email,
      telefono: form.value.telefono || undefined,
      ciudad: form.value.ciudad,
      rol: form.value.rol,
      contrasena: form.value.contrasena
    }
    
    await register(userData)
    emit('success')
    
  } catch (err) {
    console.error('Register failed:', err)
  }
}
</script>