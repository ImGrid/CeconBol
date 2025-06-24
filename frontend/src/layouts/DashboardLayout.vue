<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <AppSidebar 
      :show="showSidebar"
      @close="closeSidebar"
    />
    
    <!-- Overlay para móvil -->
    <div 
      v-if="showSidebar && isMobile" 
      class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
      @click="closeSidebar"
    />
    
    <!-- Contenido principal -->
    <div :class="['dashboard-main', showSidebar ? 'dashboard-main-with-sidebar' : '']">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 shadow-sm">
        <div class="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <!-- Botón menú móvil -->
          <button
            @click="toggleSidebar"
            class="p-2 text-gray-500 rounded-md lg:hidden hover:text-gray-700 hover:bg-gray-100"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <!-- Título dinámico -->
          <div class="flex-1 lg:flex-none">
            <h1 class="text-lg font-semibold text-gray-900 lg:hidden">
              {{ pageTitle }}
            </h1>
          </div>
          
          <!-- Acciones del header -->
          <div class="flex items-center space-x-4">
            <!-- Notificaciones -->
            <button class="relative p-2 text-gray-500 rounded-md hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-3-3V9a6 6 0 00-12 0v5l-3 3h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <!-- Badge de notificaciones -->
              <span v-if="notificationCount > 0" class="absolute flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full -top-1 -right-1">
                {{ notificationCount > 9 ? '9+' : notificationCount }}
              </span>
            </button>
            
            <!-- Menú de usuario -->
            <div class="relative">
              <button 
                @click="toggleUserMenu"
                class="flex items-center p-2 space-x-2 text-gray-700 rounded-md hover:text-gray-900"
              >
                <div class="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary">
                  <span class="text-sm font-medium text-white">
                    {{ userInitials }}
                  </span>
                </div>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <!-- Dropdown del usuario -->
              <Transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-100"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-100"
                leave-to-class="transform scale-95 opacity-0"
              >
                <div 
                  v-if="showUserMenu"
                  class="absolute right-0 z-50 w-48 mt-2 bg-white border border-gray-200 rounded-md shadow-lg"
                >
                  <div class="py-1">
                    <div class="px-4 py-2 border-b border-gray-100">
                      <p class="text-sm font-medium text-gray-900">{{ user.nombre }}</p>
                      <p class="text-xs text-gray-500">{{ user.email }}</p>
                    </div>
                    
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
                    
                    <button 
                      @click="handleLogout"
                      class="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </header>
      
      <!-- Contenido -->
      <main>
        <div class="dashboard-content">
          <slot />
        </div>
      </main>
    </div>
    
    <!-- Back to top -->
    <BackToTop />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { usePermissions } from '@/composables/usePermissions.js'
import AppSidebar from '@/components/common/AppSidebar.vue'
import BackToTop from '@/components/common/BackToTop.vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'Dashboard'
  }
})

// Router
const router = useRouter()

// Composables
const { user, logout } = useAuth()
const { isProveedor } = usePermissions()

// Estado
const showSidebar = ref(false)
const isMobile = ref(false)
const showUserMenu = ref(false)
const notificationCount = ref(3) // Simulado por ahora

// Computed
const pageTitle = computed(() => props.title)

const userInitials = computed(() => {
  if (!user.value) return 'U'
  const firstName = user.value.nombre?.charAt(0) || ''
  const lastName = user.value.apellido?.charAt(0) || ''
  return (firstName + lastName).toUpperCase() || 'U'
})

// Métodos
const updateScreenSize = () => {
  isMobile.value = window.innerWidth < 1024
  showSidebar.value = !isMobile.value // Mostrar en desktop, ocultar en mobile
}

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const closeSidebar = () => {
  if (isMobile.value) {
    showSidebar.value = false
  }
}

const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

// Cerrar menús al hacer click fuera
const handleClickOutside = (event) => {
  // Cerrar menú de usuario si se hace click fuera
  if (showUserMenu.value && !event.target.closest('.relative')) {
    showUserMenu.value = false
  }
}

// Lifecycle
onMounted(() => {
  updateScreenSize()
  window.addEventListener('resize', updateScreenSize)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenSize)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style>
@import '@/components/dashboard/dashboard.css';
</style>