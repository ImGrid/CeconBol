<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- Logo -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-brand-primary">
          CECONBOL
        </h1>
        <p class="text-gray-600 mt-2">
          Marketplace de Salones de Eventos en Bolivia
        </p>
      </div>

      <!-- Formulario -->
      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="card">
          <div class="text-center mb-6">
            <h2 class="text-xl font-semibold text-gray-900">
              Iniciar Sesión
            </h2>
            <p class="text-gray-600 text-sm mt-1">
              Accede a tu cuenta para continuar
            </p>
          </div>

          <LoginForm
            @success="handleLoginSuccess"
            @switch-to-register="goToRegister"
          />
        </div>
      </div>

      <!-- Enlace adicional -->
      <div class="text-center mt-6">
        <router-link
          to="/"
          class="text-brand-primary hover:text-primary-700 text-sm font-medium"
        >
          ← Volver al inicio
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import LoginForm from '@/components/auth/LoginForm.vue'

// Router
const router = useRouter()
const { user } = useAuth()

// Métodos
const handleLoginSuccess = () => {
  // Redirigir según el rol del usuario
  if (user.value.rol === 'admin') {
    router.push('/admin/dashboard')
  } else if (user.value.rol === 'proveedor') {
    router.push('/dashboard')
  } else {
    router.push('/') // Cliente va al home
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>