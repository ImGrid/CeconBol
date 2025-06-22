<template>
  <DefaultLayout>
    <!-- Loading state -->
    <div v-if="loading" class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="animate-pulse">
        <div class="w-1/3 h-8 mb-4 bg-gray-200 rounded"></div>
        <div class="h-64 mb-6 bg-gray-200 rounded"></div>
        <div class="grid gap-8 lg:grid-cols-3">
          <div class="space-y-6 lg:col-span-2">
            <div class="h-32 bg-gray-200 rounded"></div>
            <div class="h-48 bg-gray-200 rounded"></div>
          </div>
          <div class="bg-gray-200 rounded h-96"></div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="max-w-4xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
      <div class="error-state">
        <div class="py-8 text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 class="mb-2 text-2xl font-bold text-gray-900">
            Salón no encontrado
          </h1>
          <p class="mb-6 text-gray-600">
            {{ error }}
          </p>
          <div class="space-x-4">
            <Button variant="primary" @click="retry">
              Intentar de nuevo
            </Button>
            <Button variant="outline-primary" @click="goBack">
              Volver atrás
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div v-else-if="salon" class="salon-details">
      
      <!-- Breadcrumb -->
      <nav class="px-4 mx-auto mb-6 max-w-7xl sm:px-6 lg:px-8">
        <div class="flex items-center space-x-2 text-sm text-gray-500">
          <router-link to="/" class="hover:text-brand-primary">
            Inicio
          </router-link>
          <span>/</span>
          <router-link to="/salones" class="hover:text-brand-primary">
            Salones
          </router-link>
          <span>/</span>
          <span class="text-gray-900">{{ salon.nombre }}</span>
        </div>
      </nav>

      <div class="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <!-- Galería de fotos -->
        <div class="salon-gallery">
          <div v-if="salon.fotos && salon.fotos.length > 0" class="gallery-grid">
            <!-- Foto principal -->
            <div class="gallery-main">
              <img 
                :src="mainPhoto.url"
                :alt="mainPhoto.textoAlternativo || salon.nombre"
                class="object-cover w-full h-full cursor-pointer rounded-l-xl"
                @click="openGallery(0)"
              />
            </div>
            
            <!-- Fotos secundarias -->
            <div class="gallery-secondary">
              <div 
                v-for="(foto, index) in secondaryPhotos.slice(0, 4)" 
                :key="index"
                class="gallery-secondary-item"
                @click="openGallery(index + 1)"
              >
                <img 
                  :src="foto.url"
                  :alt="foto.textoAlternativo || `${salon.nombre} - Foto ${index + 2}`"
                  class="object-cover w-full h-full cursor-pointer"
                  :class="{ 'rounded-tr-xl': index === 1, 'rounded-br-xl': index === 3 }"
                />
                
                <!-- Overlay para "Ver más fotos" en la última imagen -->
                <div 
                  v-if="index === 3 && remainingPhotosCount > 0"
                  class="gallery-overlay"
                >
                  <div class="gallery-overlay-content">
                    <svg class="gallery-overlay-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span class="gallery-overlay-text">
                      +{{ remainingPhotosCount }} fotos más
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Placeholder si no hay fotos -->
          <div v-else class="flex items-center justify-center h-64 bg-gray-200 rounded-xl">
            <div class="text-center text-gray-500">
              <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No hay fotos disponibles</p>
            </div>
          </div>
        </div>

        <!-- Detalles del salón -->
        <SalonDetails 
          :salon="salon"
          @contact-salon="handleContactSalon" 
        />

        <!-- Modal de galería -->
        <Modal
          v-model:show="showGallery"
          :title="salon.nombre"
          size="xl"
          :hide-footer="true"
        >
          <div class="gallery-modal">
            <div class="relative">
              <img 
                :src="currentGalleryPhoto.url"
                :alt="currentGalleryPhoto.textoAlternativo || salon.nombre"
                class="object-contain w-full bg-gray-900 h-96"
              />
              
              <!-- Controles de navegación -->
              <button
                v-if="salon.fotos.length > 1"
                @click="previousPhoto"
                class="gallery-nav gallery-nav-prev"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <button
                v-if="salon.fotos.length > 1"
                @click="nextPhoto"
                class="gallery-nav gallery-nav-next"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <!-- Contador de fotos -->
            <div class="mt-4 text-center">
              <span class="text-sm text-gray-600">
                {{ currentPhotoIndex + 1 }} de {{ salon.fotos.length }}
              </span>
            </div>
          </div>
        </Modal>

        <!-- Modal de contacto -->
        <Modal
          v-model:show="showContactModal"
          title="Contactar Salón"
          size="large"
        >
          <div class="py-4 text-center">
            <h3 class="mb-4 text-lg font-semibold">
              ¿Quieres contactar {{ salon.nombre }}?
            </h3>
            <p class="mb-6 text-gray-600">
              Para enviar una consulta, necesitas iniciar sesión o crear una cuenta.
            </p>
            <div class="flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="primary" @click="goToLogin">
                Iniciar Sesión
              </Button>
              <Button variant="outline-primary" @click="goToRegister">
                Crear Cuenta
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import * as salonesService from '@/services/salones.service.js'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import SalonDetails from '@/components/salones/SalonDetails.vue'
import Button from '@/components/ui/Button.vue'
import Modal from '@/components/ui/Modal.vue'

// Router
const route = useRoute()
const router = useRouter()

// Composables
const { isAuthenticated } = useAuth()

// Estado
const salon = ref(null)
const loading = ref(true)
const error = ref('')
const showGallery = ref(false)
const showContactModal = ref(false)
const currentPhotoIndex = ref(0)

// Computed
const mainPhoto = computed(() => {
  if (!salon.value?.fotos?.length) return null
  return salon.value.fotos.find(f => f.esPrincipal) || salon.value.fotos[0]
})

const secondaryPhotos = computed(() => {
  if (!salon.value?.fotos?.length) return []
  return salon.value.fotos.filter(f => !f.esPrincipal || salon.value.fotos.indexOf(f) !== 0)
})

const remainingPhotosCount = computed(() => {
  const total = salon.value?.fotos?.length || 0
  return Math.max(0, total - 5) // 5 = 1 principal + 4 secundarias
})

const currentGalleryPhoto = computed(() => {
  if (!salon.value?.fotos?.length) return null
  return salon.value.fotos[currentPhotoIndex.value]
})

// Watchers
watch(() => route.params, async (newParams) => {
  if (newParams.slug || newParams.id) {
    await loadSalon()
  }
}, { immediate: true })

// Métodos
const loadSalon = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const { slug, id } = route.params
    
    let salonData
    if (slug) {
      salonData = await salonesService.getSalonBySlug(slug)
    } else if (id) {
      salonData = await salonesService.getSalonById(id)
    } else {
      throw new Error('ID o slug de salón requerido')
    }
    
    salon.value = salonData
    
    // Actualizar título de la página
    document.title = `${salonData.nombre} - CECONBOL`
    
  } catch (err) {
    console.error('Error loading salon:', err)
    error.value = err.response?.data?.message || 'Error al cargar el salón'
  } finally {
    loading.value = false
  }
}

const handleContactSalon = () => {
  if (isAuthenticated.value) {
    // Redirigir a formulario de consulta
    router.push(`/consultas/create?salon=${salon.value.id}`)
  } else {
    // Mostrar modal para login/registro
    showContactModal.value = true
  }
}

const openGallery = (index) => {
  currentPhotoIndex.value = index
  showGallery.value = true
}

const nextPhoto = () => {
  const maxIndex = salon.value.fotos.length - 1
  currentPhotoIndex.value = currentPhotoIndex.value >= maxIndex ? 0 : currentPhotoIndex.value + 1
}

const previousPhoto = () => {
  const maxIndex = salon.value.fotos.length - 1
  currentPhotoIndex.value = currentPhotoIndex.value <= 0 ? maxIndex : currentPhotoIndex.value - 1
}

const retry = () => {
  loadSalon()
}

const goBack = () => {
  router.go(-1)
}

const goToLogin = () => {
  router.push({
    path: '/login',
    query: { redirect: route.fullPath }
  })
}

const goToRegister = () => {
  router.push({
    path: '/register',
    query: { redirect: route.fullPath }
  })
}

// Lifecycle
onMounted(() => {
  // El watcher se encarga de cargar cuando la ruta esté lista
})
</script>

<style>
@import '../../components/salones/salones.css';
</style>