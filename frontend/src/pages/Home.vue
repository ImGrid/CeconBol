<template>
  <DefaultLayout>
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="px-4 py-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="mb-6 text-4xl font-bold text-white md:text-6xl">
            Celebra y conecta tu salón en Bolivia
          </h1>
          
          <p class="max-w-2xl mx-auto mb-8 text-xl text-white/90">
            La plataforma líder en Bolivia para conectar organizadores de eventos 
            con los mejores salones del país.
          </p>
          <div class="flex flex-col justify-center gap-4 mb-12 sm:flex-row">
            <Button
              variant="secondary"
              size="large"
              @click="goToSalones"
            >
              Explorar Salones
            </Button>
            
            <Button
              v-if="!isAuthenticated"
              variant="secondary" 
              size="large"
              @click="goToRegister"
            >
              Publicar mi Salón
            </Button>
          </div>

          <!-- Búsqueda rápida en el hero -->
          <div class="max-w-2xl mx-auto">
            <SearchBar
              v-model="heroSearchQuery"
              placeholder="¿Qué tipo de evento quieres celebrar?"
              :show-quick-filters="true"
              @search="handleHeroSearch"
              @quick-filter="handleQuickFilter"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Salones Destacados -->
    <section class="py-20 bg-gray-50">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">
            Salones Destacados
          </h2>
          <p class="max-w-2xl mx-auto text-lg text-gray-600">
            Descubre los salones mejor valorados por nuestros usuarios en toda Bolivia
          </p>
        </div>

        <!-- Loading state -->
        <div v-if="loadingSalones" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="n in 6" 
            :key="n"
            class="animate-pulse"
          >
            <div class="bg-gray-200 rounded-xl h-80"></div>
          </div>
        </div>

        <!-- Salones destacados -->
        <div v-else-if="salonesDestacados.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SalonCard 
            v-for="salon in salonesDestacados" 
            :key="salon.id"
            :salon="salon"
          />
        </div>

        <!-- Estado vacío -->
        <div v-else class="py-12 text-center">
          <p class="mb-6 text-gray-500">
            Aún no hay salones destacados disponibles
          </p>
        </div>

        <!-- Ver todos los salones -->
        <div class="mt-12 text-center">
          <Button
            variant="outline-primary"
            size="large"
            @click="goToSalones"
          >
            Ver Todos los Salones
          </Button>
        </div>
      </div>
    </section>

    <!-- Salones Populares -->
    <section class="py-20 bg-white">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">
            Salones Más Populares
          </h2>
          <p class="max-w-2xl mx-auto text-lg text-gray-600">
            Los salones con mejor calificación y más reservas
          </p>
        </div>

        <!-- Salones populares -->
        <div v-if="salonesPopulares.length > 0" class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SalonCard 
            v-for="salon in salonesPopulares" 
            :key="salon.id"
            :salon="salon"
          />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-gray-50">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-16 text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">
            ¿Por qué elegir CECONBOL?
          </h2>
          <p class="max-w-2xl mx-auto text-lg text-gray-600">
            Conectamos a organizadores de eventos con salones en toda Bolivia de manera simple y segura.
          </p>
        </div>

        <div class="grid gap-8 md:grid-cols-3">
          <!-- Feature 1 -->
          <div class="text-center">
            <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-brand-primary">
              <span class="text-2xl text-white">🎪</span>
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">
              Variedad de Salones
            </h3>
            <p class="text-gray-600">
              Desde salones íntimos hasta espacios para grandes celebraciones en todas las ciudades de Bolivia.
            </p>
          </div>

          <!-- Feature 2 -->
          <div class="text-center">
            <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-brand-secondary">
              <span class="text-2xl text-white">💬</span>
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">
              Comunicación Directa
            </h3>
            <p class="text-gray-600">
              Conecta directamente con los propietarios para negociar precios y coordinar detalles.
            </p>
          </div>

          <!-- Feature 3 -->
          <div class="text-center">
            <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-brand-tertiary">
              <span class="text-2xl text-white">⭐</span>
            </div>
            <h3 class="mb-2 text-xl font-semibold text-gray-900">
              Reseñas Reales
            </h3>
            <p class="text-gray-600">
              Lee opiniones de otros clientes para tomar la mejor decisión para tu evento.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Búsqueda por ciudad -->
    <section class="py-20 bg-white">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="mb-12 text-center">
          <h2 class="mb-4 text-3xl font-bold text-gray-900">
            Buscar por Ciudad
          </h2>
          <p class="text-lg text-gray-600">
            Encuentra salones en tu ciudad favorita
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
          <Button
            v-for="ciudad in CIUDADES_BOLIVIA"
            :key="ciudad"
            variant="outline-primary"
            class="!p-6 !h-auto flex flex-col items-center justify-center"
            @click="searchByCity(ciudad)"
          >
            <span class="mb-1 text-lg font-semibold">{{ ciudad }}</span>
            <span class="text-sm opacity-75">{{ getCiudadStats(ciudad) }} salones</span>
          </Button>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 cta-gradient">
      <div class="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
        <h2 class="mb-4 text-3xl font-bold text-white">
          ¿Listo para encontrar tu salón ideal?
        </h2>
        <p class="mb-8 text-xl text-white/90">
          Únete a miles de bolivianos que ya confían en CECONBOL para sus eventos especiales.
        </p>
        
        <div class="flex flex-col justify-center gap-4 sm:flex-row">
          <Button
            variant="secondary"
            size="large"
            @click="goToRegister"
          >
            Crear Cuenta Gratis
          </Button>
          
          <Button
            variant="outline-primary"
            size="large"
            @click="goToSalones"
          >
            Ver Salones Disponibles
          </Button>
        </div>
      </div>
    </section>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import * as busquedaService from '@/services/busqueda.service.js'
import { CIUDADES_BOLIVIA } from '@/utils/constants.js'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import SearchBar from '@/components/busqueda/SearchBar.vue'
import SalonCard from '@/components/salones/SalonCard.vue'
import Button from '@/components/ui/Button.vue'

// Router
const router = useRouter()

// Composables
const { isAuthenticated } = useAuth()

// Estado
const heroSearchQuery = ref('')
const salonesDestacados = ref([])
const salonesPopulares = ref([])
const loadingSalones = ref(true)
const stats = ref({
  totalSalones: 0,
  totalEventos: 0,
  totalResenas: 0
})

// Computed
const getCiudadStats = computed(() => {
  return (ciudad) => {
    // Por ahora retornamos un número fijo, en el futuro se puede hacer una consulta real
    const counts = {
      'La Paz': 25,
      'Santa Cruz': 18,
      'Cochabamba': 12,
      'Sucre': 8,
      'Potosí': 6,
      'Oruro': 4
    }
    return counts[ciudad] || 0
  }
})

const loadInitialData = async () => {
  loadingSalones.value = true
  
  try {
    // Cargar datos en paralelo
    const [destacados, populares, estadisticas] = await Promise.all([
      busquedaService.getSalonesDestacados(6),
      busquedaService.getSalonesPopulares(8),
      loadStats()
    ])
    
    salonesDestacados.value = destacados
    salonesPopulares.value = populares
    stats.value = estadisticas
    
  } catch (error) {
    console.error('Error loading initial data:', error)
  } finally {
    loadingSalones.value = false
  }
}

const loadStats = async () => {
  try {
    // En el futuro esto vendrá del backend, por ahora simulamos
    return {
      totalSalones: 73,
      totalEventos: 1250,
      totalResenas: 890
    }
  } catch (error) {
    console.error('Error loading stats:', error)
    return {
      totalSalones: 0,
      totalEventos: 0,
      totalResenas: 0
    }
  }
}

const handleHeroSearch = (query) => {
  router.push({
    path: '/salones',
    query: { q: query }
  })
}

const handleQuickFilter = (filters) => {
  const query = {}
  
  filters.forEach(filter => {
    if (CIUDADES_BOLIVIA.includes(filter.value)) {
      query.ciudad = filter.value
    } else if (filter.value === 'small') {
      query.capacidadMax = 100
    } else if (filter.value === 'large') {
      query.capacidadMin = 200
    }
  })
  
  router.push({
    path: '/salones',
    query
  })
}

const searchByCity = (ciudad) => {
  router.push({
    path: '/salones',
    query: { ciudad }
  })
}

const goToSalones = () => {
  router.push('/salones')
}

const goToRegister = () => {
  router.push('/register')
}

// Lifecycle
onMounted(() => {
  loadInitialData()
})
</script>

<style>
@import '../components/salones/salones.css';
</style>