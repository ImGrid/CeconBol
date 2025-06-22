<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="navbar sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <router-link to="/" class="flex items-center">
            <h1 class="text-2xl font-bold text-white">
              CECONBOL
            </h1>
          </router-link>

          <!-- Navegación principal -->
          <nav class="hidden md:flex items-center space-x-6">
            <router-link
              to="/"
              class="nav-link"
              active-class="text-brand-accent"
            >
              Inicio
            </router-link>
            
            <router-link
              to="/salones"
              class="nav-link"
              active-class="text-brand-accent"
            >
              Salones
            </router-link>
            
            <template v-if="isAuthenticated">
              <!-- Links para usuarios autenticados -->
              <router-link
                v-if="isProveedor || isAdmin"
                to="/dashboard"
                class="nav-link"
                active-class="text-brand-accent"
              >
                Dashboard
              </router-link>
              
              <router-link
                v-if="isAdmin"
                to="/admin"
                class="nav-link"
                active-class="text-brand-accent"
              >
                Admin
              </router-link>
            </template>
          </nav>

          <!-- User menu -->
          <div class="flex items-center space-x-4">
            <template v-if="isAuthenticated">
              <!-- Usuario autenticado -->
              <div class="relative" ref="userMenuRef">
                <button
                  @click="showUserMenu = !showUserMenu"
                  class="flex items-center space-x-2 text-white hover:text-primary-100 transition-colors"
                >
                  <div class="w-8 h-8 bg-brand-accent rounded-full flex items-center justify-center">
                    <span class="text-sm font-medium text-white">
                      {{ user.nombre[0].toUpperCase() }}
                    </span>
                  </div>
                  <span class="hidden sm:block">{{ user.nombre }}</span>
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- Dropdown menu -->
                <Transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <div
                    v-if="showUserMenu"
                    class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                  >
                    <router-link
                      to="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="showUserMenu = false"
                    >
                      Mi Perfil
                    </router-link>
                    
                    <router-link
                      v-if="isProveedor"
                      to="/mis-salones"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      @click="showUserMenu = false"
                    >
                      Mis Salones
                    </router-link>
                    
                    <hr class="my-1">
                    
                    <button
                      @click="handleLogout"
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </Transition>
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
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main>
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid md:grid-cols-4 gap-8">
          <!-- Logo y descripción -->
          <div class="col-span-2">
            <h3 class="text-2xl font-bold mb-4">CECONBOL</h3>
            <p class="text-gray-300 mb-4">
              La plataforma líder en Bolivia para conectar organizadores de eventos 
              con los mejores salones del país.
            </p>
          </div>

          <!-- Enlaces -->
          <div>
            <h4 class="font-semibold mb-4">Enlaces</h4>
            <ul class="space-y-2 text-gray-300">
              <li>
                <router-link to="/salones" class="hover:text-white transition-colors">
                  Buscar Salones
                </router-link>
              </li>
              <li>
                <router-link to="/register" class="hover:text-white transition-colors">
                  Publicar Salón
                </router-link>
              </li>
              <li>
                <router-link to="/about" class="hover:text-white transition-colors">
                  Acerca de
                </router-link>
              </li>
            </ul>
          </div>

          <!-- Contacto -->
          <div>
            <h4 class="font-semibold mb-4">Contacto</h4>
            <ul class="space-y-2 text-gray-300">
              <li>contacto@ceconbol.com</li>
              <li>La Paz, Bolivia</li>
            </ul>
          </div>
        </div>

        <hr class="border-gray-700 my-8">
        
        <div class="text-center text-gray-400">
          <p>&copy; 2024 CECONBOL. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import Button from '@/components/ui/Button.vue'

// Router
const router = useRouter()

// Auth
const { 
  user, 
  isAuthenticated, 
  isProveedor, 
  isAdmin, 
  logout 
} = useAuth()

// User menu
const showUserMenu = ref(false)
const userMenuRef = ref(null)

// Métodos
const handleLogout = async () => {
  showUserMenu.value = false
  try {
    await logout()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

// Click outside para cerrar el menu
const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>