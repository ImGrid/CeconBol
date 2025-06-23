<template>
  <DashboardLayout title="Dashboard">
    <div class="dashboard-content">
      
      <!-- Header con saludo -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">
          ¡Hola, {{ user?.nombre }}! 👋
        </h1>
        <p class="dashboard-subtitle">
          Aquí tienes un resumen de tu actividad como proveedor
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="space-y-6">
        <div class="dashboard-stats">
          <div v-for="n in 4" :key="n" class="stat-card">
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
        
        <!-- Estadísticas principales -->
        <DashboardStats :stats="statsData" />

        <!-- Grid de contenido -->
        <div class="dashboard-grid">
          
          <!-- Columna principal -->
          <div class="dashboard-main-content">
            
            <!-- Acciones rápidas -->
            <Card class="mb-8">
              <QuickActions @action="handleQuickAction" />
            </Card>

            <!-- Tabs con información detallada -->
            <Card>
              <Tabs
                v-model="activeTab"
                :tabs="dashboardTabs"
                @tab-change="handleTabChange"
              >
                <!-- Tab Consultas -->
                <template #consultas>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">
                        Consultas Recientes
                      </h3>
                      <Button 
                        variant="outline-primary" 
                        size="small"
                        @click="$router.push('/consultas')"
                      >
                        Ver Todas
                      </Button>
                    </div>
                    
                    <div v-if="consultasRecientes.length > 0" class="space-y-3">
                      <div 
                        v-for="consulta in consultasRecientes" 
                        :key="consulta.id"
                        class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <h4 class="font-medium text-gray-900">
                              {{ consulta.nombreCliente }}
                            </h4>
                            <p class="text-sm text-gray-600">
                              {{ consulta.tipoEvento }} • {{ formatDate(consulta.fechaConsulta) }}
                            </p>
                            <p class="mt-1 text-sm text-gray-700">
                              {{ truncateText(consulta.mensaje, 100) }}
                            </p>
                          </div>
                          <Badge :variant="getEstadoBadgeVariant(consulta.estado)">
                            {{ getEstadoLabel(consulta.estado, 'consulta') }}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div v-else class="dashboard-empty-state">
                      <svg class="dashboard-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <h4 class="dashboard-empty-title">No hay consultas</h4>
                      <p class="dashboard-empty-description">
                        Las nuevas consultas aparecerán aquí
                      </p>
                    </div>
                  </div>
                </template>

                <!-- Tab Eventos -->
                <template #eventos>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">
                        Eventos Próximos
                      </h3>
                      <Button 
                        variant="outline-primary" 
                        size="small"
                        @click="$router.push('/eventos')"
                      >
                        Gestionar Eventos
                      </Button>
                    </div>
                    
                    <div v-if="eventosProximos.length > 0" class="space-y-3">
                      <div 
                        v-for="evento in eventosProximos" 
                        :key="evento.id"
                        class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <h4 class="font-medium text-gray-900">
                              {{ evento.titulo }}
                            </h4>
                            <p class="text-sm text-gray-600">
                              📅 {{ formatDate(evento.fechaEvento, 'long') }}
                            </p>
                            <p class="text-sm text-gray-600">
                              👥 {{ evento.cantidadInvitados }} invitados
                            </p>
                          </div>
                          <Badge :variant="getEstadoBadgeVariant(evento.estado, 'evento')">
                            {{ getEstadoLabel(evento.estado, 'evento') }}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div v-else class="dashboard-empty-state">
                      <svg class="dashboard-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0v10h8V7m-8 0h8m-4-4v4m0 0l3 3m-3-3l-3 3" />
                      </svg>
                      <h4 class="dashboard-empty-title">No hay eventos próximos</h4>
                      <p class="dashboard-empty-description">
                        Los eventos confirmados aparecerán aquí
                      </p>
                    </div>
                  </div>
                </template>

                <!-- Tab Mis Salones -->
                <template #salones>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">
                        Mis Salones
                      </h3>
                      <Button 
                        variant="outline-primary" 
                        size="small"
                        @click="$router.push('/mis-salones')"
                      >
                        Gestionar Salones
                      </Button>
                    </div>
                    
                    <div v-if="misSalones.length > 0" class="grid gap-4 md:grid-cols-2">
                      <div 
                        v-for="salon in misSalones" 
                        :key="salon.id"
                        class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div class="flex items-start justify-between mb-2">
                          <h4 class="font-medium text-gray-900">
                            {{ salon.nombre }}
                          </h4>
                          <Badge :variant="getEstadoBadgeVariant(salon.estado, 'salon')">
                            {{ getEstadoLabel(salon.estado, 'salon') }}
                          </Badge>
                        </div>
                        <p class="mb-2 text-sm text-gray-600">
                          📍 {{ salon.ciudad }}
                        </p>
                        <div class="flex items-center justify-between text-sm">
                          <span class="text-gray-600">
                            ⭐ {{ salon.calificacionPromedio || '0.0' }}
                          </span>
                          <span class="font-medium text-brand-primary">
                            {{ formatPrice(salon.precioBase) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div v-else class="dashboard-empty-state">
                      <svg class="dashboard-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <h4 class="dashboard-empty-title">No tienes salones registrados</h4>
                      <p class="dashboard-empty-description">
                        Agrega tu primer salón para empezar a recibir consultas
                      </p>
                      <Button 
                        variant="primary" 
                        class="mt-4"
                        @click="$router.push('/mis-salones/crear')"
                      >
                        Agregar Salón
                      </Button>
                    </div>
                  </div>
                </template>
              </Tabs>
            </Card>
          </div>

          <!-- Sidebar -->
          <div class="dashboard-sidebar-content">
            
            <!-- Actividad reciente -->
            <Card>
              <RecentActivity 
                :activities="actividadReciente"
                :loading="loadingActividad"
                :max-items="5"
                @view-all="$router.push('/actividad')"
                @activity-click="handleActivityClick"
              />
            </Card>

            <!-- Métricas del mes -->
            <Card v-if="metricasMes" class="mt-6">
              <div class="card-header">
                <h3 class="text-lg font-semibold text-gray-900">
                  Resumen del Mes
                </h3>
              </div>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Consultas recibidas</span>
                  <span class="font-medium">{{ metricasMes.consultasNuevas || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Eventos confirmados</span>
                  <span class="font-medium">{{ metricasMes.eventosConfirmados || 0 }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Ingresos estimados</span>
                  <span class="font-medium text-brand-primary">
                    {{ formatPrice(metricasMes.ingresosEstimados || 0) }}
                  </span>
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
          <p class="mb-4 text-gray-600">
            {{ error }}
          </p>
          <Button variant="primary" @click="loadDashboardData">
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
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import RecentActivity from '@/components/dashboard/RecentActivity.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Tabs from '@/components/ui/Tabs.vue'

// Router y Auth
const router = useRouter()
const { user } = useAuth()

// Estado
const loading = ref(true)
const loadingActividad = ref(false)
const error = ref('')
const activeTab = ref('consultas')

// Datos del dashboard
const dashboardData = ref({})
const consultasRecientes = ref([])
const eventosProximos = ref([])
const misSalones = ref([])
const actividadReciente = ref([])
const metricasMes = ref(null)

// Computed
const statsData = computed(() => {
  const data = dashboardData.value
  return [
    {
      icon: 'ChatIcon',
      value: data.totalConsultas || 0,
      label: 'Consultas Totales',
      type: 'primary',
      change: data.cambioConsultas || 0,
      description: 'vs mes anterior'
    },
    {
      icon: 'CalendarIcon', 
      value: data.eventosConfirmados || 0,
      label: 'Eventos Confirmados',
      type: 'secondary',
      change: data.cambioEventos || 0,
      description: 'este mes'
    },
    {
      icon: 'BuildingIcon',
      value: data.totalSalones || 0,
      label: 'Salones Activos',
      type: 'tertiary',
      change: 0,
      description: 'publicados'
    },
    {
      icon: 'StarIcon',
      value: data.promedioCalificacion || '0.0',
      label: 'Calificación Promedio',
      type: 'accent',
      change: data.cambioCalificacion || 0,
      description: 'de 5 estrellas'
    }
  ]
})

const dashboardTabs = computed(() => [
  {
    key: 'consultas',
    label: 'Consultas',
    icon: 'ChatIcon',
    badge: consultasRecientes.value.filter(c => c.estado === 'nueva').length || null,
    badgeVariant: 'primary'
  },
  {
    key: 'eventos',
    label: 'Eventos',
    icon: 'CalendarIcon',
    badge: eventosProximos.value.length || null,
    badgeVariant: 'secondary'
  },
  {
    key: 'salones',
    label: 'Mis Salones',
    icon: 'BuildingIcon'
  }
])

// Métodos
const loadDashboardData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await dashboardService.getDashboardCompleto('proveedor')
    
    dashboardData.value = data
    consultasRecientes.value = data.consultas?.recientes || []
    eventosProximos.value = data.eventos?.proximos || []
    misSalones.value = data.salones?.mis_salones || []
    actividadReciente.value = data.actividadReciente || []
    metricasMes.value = data.consultas?.metricas || null
    
  } catch (err) {
    console.error('Error loading dashboard:', err)
    error.value = err.message || 'Error al cargar los datos del dashboard'
  } finally {
    loading.value = false
  }
}

const handleQuickAction = (action) => {
  switch (action) {
    case 'show-stats':
      // Mostrar modal de estadísticas o navegar a página de reportes
      console.log('Mostrar estadísticas detalladas')
      break
    default:
      console.log('Acción no manejada:', action)
  }
}

const handleTabChange = ({ tab, index, key }) => {
  console.log('Tab changed:', { tab, index, key })
  activeTab.value = key
}

const handleActivityClick = (activity) => {
  console.log('Activity clicked:', activity)
}

const getEstadoBadgeVariant = (estado, tipo = 'consulta') => {
  // Mapear colores CSS de helpers a variantes de Badge
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
  loadDashboardData()
})
</script>

<style>
@import '../../components/dashboard/dashboard.css';
</style>