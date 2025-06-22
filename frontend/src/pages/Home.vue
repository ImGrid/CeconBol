<template>
  <div class="min-h-screen bg-white">
    <!-- Header temporal -->
    <header class="navbar">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-white">
              CECONBOL
            </h1>
          </div>

          <!-- Navegación -->
          <nav class="flex items-center space-x-4">
            <template v-if="isAuthenticated">
              <!-- Usuario autenticado -->
              <div class="flex items-center space-x-4">
                <span class="text-white text-sm">
                  Hola, {{ user.nombre }}
                </span>
                
                <!-- Enlace al dashboard según rol -->
                <router-link
                  v-if="isProveedor"
                  to="/dashboard"
                  class="nav-link"
                >
                  Mi Dashboard
                </router-link>
                
                <router-link
                  v-if="isAdmin"
                  to="/admin/dashboard"
                  class="nav-link"
                >
                  Panel Admin
                </router-link>
                
                <Button
                  variant="outline-primary"
                  size="small"
                  :loading="loading"
                  @click="handleLogout"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </template>
            
            <template v-else>
              <!-- Usuario no autenticado -->
              <router-link
                to="/login"
                class="nav-link"
              >
                Iniciar Sesión
              </router-link>
              
              <Button
                variant="secondary"
                size="small"
                @click="$router.push('/register')"
              >
                Registrarse
              </Button>
            </template>
          </nav>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-gradient">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div class="text-center">
          <h1 class="text-4xl md:text-6xl font-bold text-white mb-6">
            Celebra y conecta tu salon en Bolivia<br>
          </h1>
          
          <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            La plataforma líder en Bolivia para conectar organizadores de eventos 
            con los mejores salones del país.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="large"
              @click="$router.push('/salones')"
            >
              Explorar Salones
            </Button>
            
            <Button
              v-if="!isAuthenticated"
              variant="outline-primary"
              size="large"
              @click="$router.push('/register')"
            >
              Publicar mi Salón
            </Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            ¿Por qué elegir CECONBOL?
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Conectamos a organizadores de eventos con salones en toda Bolivia de manera simple y segura.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <!-- Feature 1 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl text-white">🎪</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Variedad de Salones
            </h3>
            <p class="text-gray-600">
              Desde salones íntimos hasta espacios para grandes celebraciones en todas las ciudades de Bolivia.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-brand-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl text-white">💬</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Comunicación Directa
            </h3>
            <p class="text-gray-600">
              Conecta directamente con los propietarios para negociar precios y coordinar detalles.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="text-center">
            <div class="w-16 h-16 bg-brand-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-2xl text-white">⭐</span>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">
              Reseñas Reales
            </h3>
            <p class="text-gray-600">
              Lee opiniones de otros clientes para tomar la mejor decisión para tu evento.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-gradient py-20">
      <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-white mb-4">
          ¿Listo para encontrar tu salón ideal?
        </h2>
        <p class="text-xl text-white/90 mb-8">
          Únete a miles de bolivianos que ya confían en CECONBOL para sus eventos especiales.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="secondary"
            size="large"
            @click="$router.push('/register')"
          >
            Crear Cuenta Gratis
          </Button>
          
          <Button
            variant="outline-primary"
            size="large"
            @click="$router.push('/salones')"
          >
            Ver Salones Disponibles
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import Button from '@/components/ui/Button.vue'

// Router
const router = useRouter()

// Auth
const { 
  user, 
  loading, 
  isAuthenticated, 
  isProveedor, 
  isAdmin, 
  logout 
} = useAuth()

// Métodos
const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>