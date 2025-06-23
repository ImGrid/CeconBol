<template>
  <DashboardLayout title="Mi Dashboard">
    <div class="dashboard-content">
      
      <!-- Header del cliente -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">
          ¡Bienvenido, {{ user?.nombre }}! 🎉
        </h1>
        <p class="dashboard-subtitle">
          Organiza tus eventos perfectos con los mejores salones de Bolivia
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="space-y-6">
        <div class="dashboard-stats">
          <div v-for="n in 3" :key="n" class="stat-card">
            <div class="animate-pulse">
              <div class="w-12 h-12 mb-4 bg-gray-200 rounded-lg"></div>
              <div class="w-16 h-8 mb-2 bg-gray-200 rounded"></div>
              <div class="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard content -->
      <div v-else class="space-y-8">
        
        <!-- Estadísticas del cliente -->
        <DashboardStats :stats="clienteStats" />

        <!-- Acciones rápidas para cliente -->
        <Card>
          <QuickActions @action="handleClientAction" />
        </Card>

        <!-- Grid principal -->
        <div class="dashboard-grid">
          
          <!-- Columna principal -->
          <div class="dashboard-main-content">
            
            <!-- Tabs del cliente -->
            <Card>
              <Tabs
                v-model="activeTab"
                :tabs="clienteTabs"
                @tab-change="handleTabChange"
              >
                <!-- Tab Mis Consultas -->
                <template #consultas>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">
                        Mis Consultas
                      </h3>
                      <Button 
                        variant="primary" 
                        size="small"
                        @click="$router.push('/consultas/create')"
                      >
                        Nueva Consulta
                      </Button>
                    </div>
                    
                    <div v-if="misConsultas.length > 0" class="space-y-4">
                      <div 
                        v-for="consulta in misConsultas" 
                        :key="consulta.id"
                        class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        @click="verConsulta(consulta.id)"
                      >
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <div class="flex items-center mb-2 space-x-2">
                              <h4 class="font-medium text-gray-900">
                                {{ consulta.salon?.nombre || 'Salón consultado' }}
                              </h4>
                              <Badge :variant="getEstadoBadgeVariant(consulta.estado)">
                                {{ getEstadoLabel(consulta.estado, 'consulta') }}
                              </Badge>
                            </div>
                            <p class="mb-1 text-sm text-gray-600">
                              📍 {{ consulta.salon?.ciudad }}
                            </p>
                            <p class="mb-2 text-sm text-gray-600">
                              🎉 {{ consulta.tipoEvento }} • {{ formatDate(consulta.fechaEvento, 'long') }}
                            </p>
                            <p class="text-sm text-gray-700">
                              {{ truncateText(consulta.mensaje, 120) }}
                            </p>
                            <p class="mt-2 text-xs text-gray-500">
                              Enviado {{ formatDate(consulta.createdAt, 'relative') }}
                            </p>
                          </div>
                          <div class="flex flex-col items-end space-y-2">
                            <span v-if="consulta.presupuestoEstimado" class="text-sm font-medium text-brand-primary">
                              {{ formatPrice(consulta.presupuestoEstimado) }}
                            </span>
                            <Button 
                              variant="outline-primary" 
                              size="small"
                              @click.stop="verConsulta(consulta.id)"
                            >
                              Ver Detalles
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div v-else class="dashboard-empty-state">
                      <svg class="dashboard-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <h4 class="dashboard-empty-title">No has enviado consultas</h4>
                      <p class="dashboard-empty-description">
                        Busca salones y envía tu primera consulta para organizar tu evento
                      </p>
                      <Button 
                        variant="primary" 
                        class="mt-4"
                        @click="$router.push('/salones')"
                      >
                        Buscar Salones
                      </Button>
                    </div>
                  </div>
                </template>

                <!-- Tab Mis Eventos -->
                <template #eventos>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">
                        Mis Eventos
                      </h3>
                      <Button 
                        variant="outline-primary" 
                        size="small"
                        @click="$router.push('/mis-eventos')"
                      >
                        Ver Todos
                      </Button>
                    </div>
                    
                    <div v-if="misEventos.length > 0" class="space-y-4">
                      <div 
                        v-for="evento in misEventos" 
                        :key="evento.id"
                        class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <div class="flex items-center mb-2 space-x-2">
                              <h4 class="font-medium text-gray-900">
                                {{ evento.titulo }}
                              </h4>
                              <Badge :variant="getEstadoBadgeVariant(evento.estado, 'evento')">
                                {{ getEstadoLabel(evento.estado, 'evento') }}
                              </Badge>
                            </div>
                            <p class="mb-1 text-sm text-gray-600">
                              🏢 {{ evento.salon?.nombre }}
                            </p>
                            <p class="mb-1 text-sm text-gray-600">
                              📅 {{ formatDate(evento.fechaEvento, 'long') }}
                            </p>
                            <p class="text-sm text-gray-600">
                              👥 {{ evento.cantidadInvitados }} invitados
                            </p>
                          </div>
                          <div class="text-right">
                            <p v-if="evento.costoTotal" class="text-sm font-medium text-brand-primary">
                              {{ formatPrice(evento.costoTotal) }}
                            </p>
                            <p class="mt-1 text-xs text-gray-500">
                              {{ formatDate(evento.fechaEvento, 'relative') }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div v-else class="dashboard-empty-state">
                      <svg class="dashboard-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0v10h8V7m-8 0h8m-4-4v4m0 0l3 3m-3-3l-3 3" />
                      </svg>
                      <h4 class="dashboard-empty-title">No tienes eventos programados</h4>
                      <p class="dashboard-empty-description">
                        Cuando confirmes un evento, aparecerá aquí
                      </p>
                    </div>
                  </div>
                </template>

                <!-- Tab Mis Reseñas -->
                <template #resenas>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">
                        Mis Reseñas
                      </h3>
                      <Button 
                        variant="outline-primary" 
                        size="small"
                        @click="$router.push('/mis-resenas')"
                      >
                        Ver Todas
                      </Button>
                    </div>
                    
                    <div v-if="misResenas.length > 0" class="space-y-4">
                      <div 
                        v-for="resena in misResenas" 
                        :key="resena.id"
                        class="p-4 border border-gray-200 rounded-lg"
                      >
                        <div class="flex items-start justify-between mb-3">
                          <div class="flex-1">
                            <h4 class="font-medium text-gray-900">
                              {{ resena.salon?.nombre }}
                            </h4>
                            <div class="flex items-center mt-1 space-x-2">
                              <Rating :value="resena.calificacion" :show-value="false" size="small" />
                              <span class="text-sm text-gray-600">
                                {{ resena.calificacion }}/5
                              </span>
                            </div>
                          </div>
                          <Badge :variant="getEstadoBadgeVariant(resena.estado, 'resena')">
                            {{ getEstadoLabel(resena.estado, 'resena') }}
                          </Badge>
                        </div>
                        <p class="mb-2 text-sm text-gray-700">
                          {{ resena.comentario }}
                        </p>
                        <p class="text-xs text-gray-500">
                          {{ formatDate(resena.createdAt, 'relative') }}
                        </p>
                      </div>
                    </div>
                    
                    <div v-else class="dashboard-empty-state">
                      <svg class="dashboard-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <h4 class="dashboard-empty-title">No has escrito reseñas</h4>
                      <p class="dashboard-empty-description">
                        Después de tu evento, podrás calificar y reseñar el salón
                      </p>
                    </div>
                  </div>
                </template>

                <!-- Tab Favoritos -->
                <template #favoritos>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">
                        Salones Favoritos
                      </h3>
                      <Button 
                        variant="outline-primary" 
                        size="small"
                        @click="$router.push('/salones')"
                      >
                        Buscar Más
                      </Button>
                    </div>
                    
                    <div v-if="salonesFavoritos.length > 0" class="grid gap-4 md:grid-cols-2">
                      <div 
                        v-for="salon in salonesFavoritos" 
                        :key="salon.id"
                        class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        @click="verSalon(salon.id)"
                      >
                        <div class="flex items-start justify-between mb-2">
                          <h4 class="font-medium text-gray-900">
                            {{ salon.nombre }}
                          </h4>
                          <button 
                            @click.stop="toggleFavorito(salon.id)"
                            class="text-red-500 hover:text-red-600"
                          >
                            ❤️
                          </button>
                        </div>
                        <p class="mb-2 text-sm text-gray-600">
                          📍 {{ salon.ciudad }}
                        </p>
                        <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-1">
                            <Rating :value="salon.calificacionPromedio || 0" :show-value="false" size="small" />
                            <span class="text-sm text-gray-600">
                              ({{ salon.totalResenas || 0 }})
                            </span>
                          </div>
                          <span class="text-sm font-medium text-brand-primary">
                            {{ formatPrice(salon.precioBase) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div v-else class="dashboard-empty-state">
                      <svg class="dashboard-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <h4 class="dashboard-empty-title">No tienes salones favoritos</h4>
                      <p class="dashboard-empty-description">
                        Marca salones como favoritos para encontrarlos fácilmente
                      </p>
                    </div>
                  </div>
                </template>
              </Tabs>
            </Card>
          </div>

          <!-- Sidebar -->
          <div class="dashboard-sidebar-content">
            
            <!-- Búsqueda rápida -->
            <Card class="mb-6">
              <h3 class="mb-4 text-lg font-semibold text-gray-900">
                🔍 Búsqueda Rápida
              </h3>
              <div class="space-y-3">
                <SearchBar
                  v-model="quickSearch"
                  placeholder="Buscar salones..."
                  @search="handleQuickSearch"
                  class="mb-4"
                />
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="ciudad in CIUDADES_PRINCIPALES"
                    :key="ciudad"
                    @click="buscarPorCiudad(ciudad)"
                    class="px-3 py-1 text-sm text-gray-700 transition-colors bg-gray-100 rounded-full hover:bg-brand-primary hover:text-white"
                  >
                    {{ ciudad }}
                  </button>
                </div>
              </div>
            </Card>
            
            <!-- Próximos eventos -->
            <Card v-if="proximosEventos.length > 0">
              <h3 class="mb-4 text-lg font-semibold text-gray-900">
                📅 Próximos Eventos
              </h3>
              <div class="space-y-3">
                <div 
                  v-for="evento in proximosEventos" 
                  :key="evento.id"
                  class="p-3 rounded-lg bg-gray-50"
                >
                  <h4 class="text-sm font-medium text-gray-900">
                    {{ evento.titulo }}
                  </h4>
                  <p class="text-xs text-gray-600">
                    {{ formatDate(evento.fechaEvento, 'long') }}
                  </p>
                </div>
              </div>
            </Card>

            <!-- Consejos y tips -->
            <Card class="mt-6">
              <h3 class="mb-4 text-lg font-semibold text-gray-900">
                💡 Tips para tu Evento
              </h3>
              <div class="space-y-3 text-sm">
                <div class="p-3 border border-blue-200 rounded-lg bg-blue-50">
                  <h4 class="font-medium text-blue-900">Planifica con tiempo</h4>
                  <p class="text-blue-700">Reserva tu salón con al menos 2 meses de anticipación.</p>
                </div>
                <div class="p-3 border border-green-200 rounded-lg bg-green-50">
                  <h4 class="font-medium text-green-900">Visita el lugar</h4>
                  <p class="text-green-700">Siempre visita el salón antes de confirmar tu evento.</p>
                </div>
                <div class="p-3 border rounded-lg bg-amber-50 border-amber-200">
                  <h4 class="font-medium text-amber-900">Lee las reseñas</h4>
                  <p class="text-amber-700">Las experiencias de otros clientes son muy valiosas.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div v-if="error" class="error-state">
        <div class="py-8 text-center">
          <svg class="w-16 h-16 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="mb-2 text-lg font-medium text-gray-900">
            Error al cargar dashboard
          </h3>
          <p class="mb-4 text-gray-600">{{ error }}</p>
          <Button variant="primary" @click="loadClienteData">
            Reintentar
          </Button>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import * as dashboardService from '@/services/dashboard.service.js'
import { formatDate, formatPrice, truncateText, getEstadoLabel, getEstadoBadgeColor } from '@/utils/helpers.js'
import { CIUDADES_BOLIVIA } from '@/utils/constants.js'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Tabs from '@/components/ui/Tabs.vue'
import Rating from '@/components/ui/Rating.vue'
import SearchBar from '@/components/busqueda/SearchBar.vue'

// Router y Auth
const router = useRouter()
const { user } = useAuth()

// Estado
const loading = ref(true)
const error = ref('')
const activeTab = ref('consultas')
const quickSearch = ref('')

// Datos del cliente
const clienteData = ref({})
const misConsultas = ref([])
const misEventos = ref([])
const misResenas = ref([])
const salonesFavoritos = ref([])
const proximosEventos = ref([])

// Constantes
const CIUDADES_PRINCIPALES = ['La Paz', 'Santa Cruz', 'Cochabamba']

// Computed
const clienteStats = computed(() => {
  const data = clienteData.value
  return [
    {
      icon: 'ChatIcon',
      value: data.totalConsultas || 0,
      label: 'Consultas Enviadas',
      type: 'primary',
      description: 'consultas realizadas'
    },
    {
      icon: 'CalendarIcon',
      value: data.totalEventos || 0,
      label: 'Eventos Realizados',
      type: 'secondary',
      description: 'eventos celebrados'
    },
    {
      icon: 'StarIcon',
      value: data.totalResenas || 0,
      label: 'Reseñas Escritas',
      type: 'tertiary',
      description: 'salones calificados'
    }
  ]
})

const clienteTabs = computed(() => [
  {
    key: 'consultas',
    label: 'Mis Consultas',
    icon: 'ChatIcon',
    badge: misConsultas.value.filter(c => c.estado === 'nueva' || c.estado === 'cotizado').length || null
  },
  {
    key: 'eventos',
    label: 'Mis Eventos',
    icon: 'CalendarIcon',
    badge: proximosEventos.value.length || null
  },
  {
    key: 'resenas',
    label: 'Mis Reseñas',
    icon: 'StarIcon'
  },
  {
    key: 'favoritos',
    label: 'Favoritos',
    icon: 'HeartIcon',
    badge: salonesFavoritos.value.length || null
  }
])

// Métodos
const loadClienteData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await dashboardService.getDashboardCompleto('cliente')
    
    clienteData.value = data
    misConsultas.value = data.consultas || []
    misEventos.value = data.eventos || []
    misResenas.value = data.resenas || []
    salonesFavoritos.value = data.favoritos || []
    proximosEventos.value = data.eventos?.filter(e => new Date(e.fechaEvento) > new Date()).slice(0, 3) || []
    
  } catch (err) {
    console.error('Error loading cliente dashboard:', err)
    error.value = err.message || 'Error al cargar los datos'
  } finally {
    loading.value = false
  }
}

const handleClientAction = (action) => {
  switch (action) {
    case 'search-salon':
      router.push('/salones')
      break
    case 'new-consulta':
      router.push('/consultas/create')
      break
    default:
      console.log('Client action:', action)
  }
}

const handleTabChange = ({ key }) => {
  activeTab.value = key
}

const handleQuickSearch = (query) => {
  router.push({
    path: '/salones',
    query: { q: query }
  })
}

const buscarPorCiudad = (ciudad) => {
  router.push({
    path: '/salones',
    query: { ciudad }
  })
}

const verConsulta = (consultaId) => {
  router.push(`/consultas/${consultaId}`)
}

const verSalon = (salonId) => {
  router.push(`/salones/${salonId}`)
}

const toggleFavorito = async (salonId) => {
  try {
    // Lógica para toggle favorito
    console.log('Toggle favorito:', salonId)
    // await favoritosService.toggle(salonId)
    await loadClienteData()
  } catch (error) {
    console.error('Error toggle favorito:', error)
  }
}

const getEstadoBadgeVariant = (estado, tipo = 'consulta') => {
  const colorToBadge = {
    'nueva': 'primary',
    'contactado': 'secondary',
    'cotizado': 'warning',
    'ganada': 'success',
    'perdida': 'error',
    'confirmado': 'primary',
    'en_progreso': 'secondary',
    'completado': 'success',
    'cancelado': 'error',
    'aprobado': 'success',
    'pendiente': 'warning',
    'rechazado': 'error'
  }
  
  return colorToBadge[estado] || 'default'
}

// Lifecycle
onMounted(() => {
  loadClienteData()
})
</script>

<style>
@import '../../components/dashboard/dashboard.css';
</style>