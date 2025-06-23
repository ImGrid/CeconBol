<template>
  <DashboardLayout title="Panel Administrativo">
    <div class="dashboard-content">
      
      <!-- Header admin -->
      <div class="dashboard-header">
        <h1 class="dashboard-title">
          Panel de Administración 🚀
        </h1>
        <p class="dashboard-subtitle">
          Control y supervisión de la plataforma CECONBOL
        </p>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="space-y-6">
        <div class="dashboard-stats">
          <div v-for="n in 6" :key="n" class="stat-card">
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
        
        <!-- Estadísticas principales del sistema -->
        <DashboardStats :stats="globalStats" />

        <!-- Acciones rápidas de admin -->
        <Card>
          <QuickActions @action="handleAdminAction" />
        </Card>

        <!-- Grid principal -->
        <div class="dashboard-grid">
          
          <!-- Columna principal -->
          <div class="dashboard-main-content">
            
            <!-- Tabs de gestión -->
            <Card>
              <Tabs
                v-model="activeTab"
                :tabs="adminTabs"
                @tab-change="handleTabChange"
              >
                <!-- Tab Usuarios -->
                <template #usuarios>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">
                        Gestión de Usuarios
                      </h3>
                      <Button 
                        variant="outline-primary" 
                        size="small"
                        @click="$router.push('/admin/usuarios')"
                      >
                        Ver Todos
                      </Button>
                    </div>
                    
                    <!-- Estadísticas de usuarios -->
                    <div class="grid gap-4 mb-6 md:grid-cols-3">
                      <div class="p-4 border rounded-lg bg-primary-50 border-primary-200">
                        <div class="text-2xl font-bold text-primary-700">
                          {{ usuariosStats.clientes || 0 }}
                        </div>
                        <div class="text-sm text-primary-600">Clientes</div>
                      </div>
                      <div class="p-4 border rounded-lg bg-secondary-50 border-secondary-200">
                        <div class="text-2xl font-bold text-secondary-700">
                          {{ usuariosStats.proveedores || 0 }}
                        </div>
                        <div class="text-sm text-secondary-600">Proveedores</div>
                      </div>
                      <div class="p-4 border rounded-lg bg-success-50 border-success-200">
                        <div class="text-2xl font-bold text-success-700">
                          {{ usuariosStats.nuevosEsteMes || 0 }}
                        </div>
                        <div class="text-sm text-success-600">Nuevos este mes</div>
                      </div>
                    </div>

                    <!-- Usuarios recientes -->
                    <div v-if="usuariosRecientes.length > 0" class="space-y-3">
                      <h4 class="font-medium text-gray-900">Registros Recientes</h4>
                      <div 
                        v-for="usuario in usuariosRecientes" 
                        :key="usuario.id"
                        class="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div class="flex items-center space-x-3">
                          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary">
                            <span class="text-sm font-medium text-white">
                              {{ usuario.nombre[0]?.toUpperCase() }}
                            </span>
                          </div>
                          <div>
                            <p class="font-medium text-gray-900">
                              {{ usuario.nombre }} {{ usuario.apellido }}
                            </p>
                            <p class="text-sm text-gray-600">
                              {{ usuario.email }} • {{ formatDate(usuario.createdAt) }}
                            </p>
                          </div>
                        </div>
                        <Badge :variant="getRolBadgeVariant(usuario.rol)">
                          {{ getRolLabel(usuario.rol) }}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Tab Salones -->
                <template #salones>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">
                        Gestión de Salones
                      </h3>
                      <Button 
                        variant="outline-primary" 
                        size="small"
                        @click="$router.push('/admin/salones')"
                      >
                        Moderar Salones
                      </Button>
                    </div>
                    
                    <!-- Estadísticas de salones -->
                    <div class="grid gap-4 mb-6 md:grid-cols-4">
                      <div class="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div class="text-2xl font-bold text-gray-700">
                          {{ salonesStats.total || 0 }}
                        </div>
                        <div class="text-sm text-gray-600">Total Salones</div>
                      </div>
                      <div class="p-4 border rounded-lg bg-accent-50 border-accent-200">
                        <div class="text-2xl font-bold text-accent-700">
                          {{ salonesStats.pendientes || 0 }}
                        </div>
                        <div class="text-sm text-accent-600">Pendientes</div>
                      </div>
                      <div class="p-4 border rounded-lg bg-success-50 border-success-200">
                        <div class="text-2xl font-bold text-success-700">
                          {{ salonesStats.aprobados || 0 }}
                        </div>
                        <div class="text-sm text-success-600">Aprobados</div>
                      </div>
                      <div class="p-4 border border-red-200 rounded-lg bg-red-50">
                        <div class="text-2xl font-bold text-red-700">
                          {{ salonesStats.rechazados || 0 }}
                        </div>
                        <div class="text-sm text-red-600">Rechazados</div>
                      </div>
                    </div>

                    <!-- Salones pendientes de aprobación -->
                    <div v-if="salonesPendientes.length > 0" class="space-y-3">
                      <h4 class="font-medium text-gray-900">Pendientes de Aprobación</h4>
                      <div 
                        v-for="salon in salonesPendientes" 
                        :key="salon.id"
                        class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div class="flex items-start justify-between">
                          <div class="flex-1">
                            <h5 class="font-medium text-gray-900">{{ salon.nombre }}</h5>
                            <p class="text-sm text-gray-600">
                              📍 {{ salon.ciudad }} • {{ salon.propietario?.nombre }}
                            </p>
                            <p class="text-sm text-gray-600">
                              Enviado {{ formatDate(salon.createdAt, 'relative') }}
                            </p>
                          </div>
                          <div class="flex space-x-2">
                            <Button 
                              variant="success" 
                              size="small"
                              @click="aprobarSalon(salon.id)"
                            >
                              Aprobar
                            </Button>
                            <Button 
                              variant="outline-primary" 
                              size="small"
                              @click="verSalon(salon.id)"
                            >
                              Revisar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-else class="dashboard-empty-state">
                      <svg class="dashboard-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 class="dashboard-empty-title">No hay salones pendientes</h4>
                      <p class="dashboard-empty-description">
                        Todos los salones han sido revisados
                      </p>
                    </div>
                  </div>
                </template>

                <!-- Tab Actividad -->
                <template #actividad>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">
                        Actividad del Sistema
                      </h3>
                      <Button 
                        variant="outline-primary" 
                        size="small"
                        @click="$router.push('/admin/reportes')"
                      >
                        Ver Reportes
                      </Button>
                    </div>
                    
                    <!-- Métricas de actividad -->
                    <div class="grid gap-4 mb-6 md:grid-cols-2">
                      <div class="p-4 border border-blue-200 rounded-lg bg-blue-50">
                        <div class="text-2xl font-bold text-blue-700">
                          {{ actividadStats.consultasHoy || 0 }}
                        </div>
                        <div class="text-sm text-blue-600">Consultas hoy</div>
                      </div>
                      <div class="p-4 border border-green-200 rounded-lg bg-green-50">
                        <div class="text-2xl font-bold text-green-700">
                          {{ actividadStats.eventosEsteMes || 0 }}
                        </div>
                        <div class="text-sm text-green-600">Eventos este mes</div>
                      </div>
                    </div>

                    <!-- Gráfico o tabla de actividad -->
                    <div class="p-6 border border-gray-200 rounded-lg">
                      <h4 class="mb-4 font-medium text-gray-900">Consultas por Ciudad</h4>
                      <div class="space-y-3">
                        <div 
                          v-for="ciudad in ciudadStats" 
                          :key="ciudad.nombre"
                          class="flex items-center justify-between"
                        >
                          <span class="text-gray-700">{{ ciudad.nombre }}</span>
                          <div class="flex items-center space-x-2">
                            <div class="w-32 h-2 bg-gray-200 rounded-full">
                              <div 
                                class="h-2 rounded-full bg-brand-primary" 
                                :style="{ width: `${(ciudad.consultas / maxConsultas) * 100}%` }"
                              ></div>
                            </div>
                            <span class="w-8 text-sm font-medium text-gray-900">
                              {{ ciudad.consultas }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Tab Reportes -->
                <template #reportes>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-semibold text-gray-900">
                        Reportes y Análisis
                      </h3>
                      <Button 
                        variant="outline-primary" 
                        size="small"
                        @click="$router.push('/admin/reportes')"
                      >
                        Ver Todos
                      </Button>
                    </div>
                    
                    <!-- Reportes rápidos -->
                    <div class="grid gap-4 md:grid-cols-2">
                      <div class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <h4 class="mb-2 font-medium text-gray-900">Reporte de Ingresos</h4>
                        <p class="mb-3 text-sm text-gray-600">
                          Análisis de ingresos por comisiones y suscripciones
                        </p>
                        <Button variant="outline-primary" size="small">
                          Generar
                        </Button>
                      </div>
                      
                      <div class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <h4 class="mb-2 font-medium text-gray-900">Reporte de Usuarios</h4>
                        <p class="mb-3 text-sm text-gray-600">
                          Crecimiento y actividad de usuarios por período
                        </p>
                        <Button variant="outline-primary" size="small">
                          Generar
                        </Button>
                      </div>
                      
                      <div class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <h4 class="mb-2 font-medium text-gray-900">Reporte de Salones</h4>
                        <p class="mb-3 text-sm text-gray-600">
                          Performance y estadísticas de salones por ciudad
                        </p>
                        <Button variant="outline-primary" size="small">
                          Generar
                        </Button>
                      </div>
                      
                      <div class="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <h4 class="mb-2 font-medium text-gray-900">Reporte de Eventos</h4>
                        <p class="mb-3 text-sm text-gray-600">
                          Análisis de eventos exitosos y tendencias
                        </p>
                        <Button variant="outline-primary" size="small">
                          Generar
                        </Button>
                      </div>
                    </div>
                  </div>
                </template>
              </Tabs>
            </Card>
          </div>

          <!-- Sidebar -->
          <div class="dashboard-sidebar-content">
            
            <!-- Actividad reciente del sistema -->
            <Card>
              <RecentActivity 
                :activities="actividadSistema"
                :loading="loadingActividad"
                :max-items="8"
                @view-all="$router.push('/admin/actividad')"
                @activity-click="handleActivityClick"
              />
            </Card>

            <!-- Alertas y notificaciones -->
            <Card v-if="alertasAdmin.length > 0" class="mt-6">
              <div class="card-header">
                <h3 class="text-lg font-semibold text-gray-900">
                  🚨 Alertas del Sistema
                </h3>
              </div>
              
              <div class="space-y-3">
                <div 
                  v-for="alerta in alertasAdmin" 
                  :key="alerta.id"
                  :class="getAlertClass(alerta.tipo)"
                >
                  <h4 class="font-medium">{{ alerta.titulo }}</h4>
                  <p class="text-sm">{{ alerta.mensaje }}</p>
                  <p class="text-xs opacity-75">{{ formatDate(alerta.fecha, 'relative') }}</p>
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
            Error al cargar panel administrativo
          </h3>
          <p class="mb-4 text-gray-600">{{ error }}</p>
          <Button variant="primary" @click="loadAdminData">
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
import * as dashboardService from '@/services/dashboard.service.js'
import { formatDate } from '@/utils/helpers.js'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DashboardStats from '@/components/dashboard/DashboardStats.vue'
import QuickActions from '@/components/dashboard/QuickActions.vue'
import RecentActivity from '@/components/dashboard/RecentActivity.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Tabs from '@/components/ui/Tabs.vue'

// Router
const router = useRouter()

// Estado
const loading = ref(true)
const loadingActividad = ref(false)
const error = ref('')
const activeTab = ref('usuarios')

// Datos del dashboard admin
const adminData = ref({})
const usuariosStats = ref({})
const salonesStats = ref({})
const actividadStats = ref({})
const usuariosRecientes = ref([])
const salonesPendientes = ref([])
const actividadSistema = ref([])
const alertasAdmin = ref([])
const ciudadStats = ref([])

// Computed
const globalStats = computed(() => {
  const data = adminData.value
  return [
    {
      icon: 'UsersIcon',
      value: data.totalUsuarios || 0,
      label: 'Usuarios Totales',
      type: 'primary',
      change: data.cambioUsuarios || 0
    },
    {
      icon: 'BuildingIcon',
      value: data.totalSalones || 0,
      label: 'Salones Registrados',
      type: 'secondary', 
      change: data.cambioSalones || 0
    },
    {
      icon: 'ChatIcon',
      value: data.totalConsultas || 0,
      label: 'Consultas Realizadas',
      type: 'tertiary',
      change: data.cambioConsultas || 0
    },
    {
      icon: 'CalendarIcon',
      value: data.totalEventos || 0,
      label: 'Eventos Celebrados',
      type: 'accent',
      change: data.cambioEventos || 0
    },
    {
      icon: 'StarIcon',
      value: data.promedioCalificacion || '0.0',
      label: 'Calificación Promedio',
      type: 'primary',
      change: 0
    },
    {
      icon: 'CurrencyIcon',
      value: `Bs. ${data.ingresosMes || 0}`,
      label: 'Ingresos del Mes',
      type: 'secondary',
      change: data.cambioIngresos || 0
    }
  ]
})

const adminTabs = computed(() => [
  {
    key: 'usuarios',
    label: 'Usuarios',
    icon: 'UsersIcon',
    badge: usuariosStats.value.nuevosHoy || null
  },
  {
    key: 'salones',
    label: 'Salones',
    icon: 'BuildingIcon',
    badge: salonesStats.value.pendientes || null,
    badgeVariant: 'warning'
  },
  {
    key: 'actividad',
    label: 'Actividad',
    icon: 'ActivityIcon'
  },
  {
    key: 'reportes',
    label: 'Reportes',
    icon: 'ChartIcon'
  }
])

const maxConsultas = computed(() => {
  return Math.max(...ciudadStats.value.map(c => c.consultas), 1)
})

// Métodos
const loadAdminData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const data = await dashboardService.getDashboardAdmin()
    
    adminData.value = data
    usuariosStats.value = data.usuarios || {}
    salonesStats.value = data.salones || {}
    actividadStats.value = data.actividad || {}
    usuariosRecientes.value = data.usuarios?.recientes || []
    salonesPendientes.value = data.salones?.pendientes || []
    actividadSistema.value = data.actividadSistema || []
    alertasAdmin.value = data.alertas || []
    ciudadStats.value = data.ciudadStats || []
    
  } catch (err) {
    console.error('Error loading admin dashboard:', err)
    error.value = err.message || 'Error al cargar el panel administrativo'
  } finally {
    loading.value = false
  }
}

const handleAdminAction = (action) => {
  console.log('Admin action:', action)
}

const handleTabChange = ({ key }) => {
  activeTab.value = key
}

const handleActivityClick = (activity) => {
  console.log('Activity clicked:', activity)
}

const aprobarSalon = async (salonId) => {
  try {
    // Lógica para aprobar salón
    console.log('Aprobando salón:', salonId)
    // await salonesService.aprobar(salonId)
    // Recargar datos
    await loadAdminData()
  } catch (error) {
    console.error('Error aprobando salón:', error)
  }
}

const verSalon = (salonId) => {
  router.push(`/admin/salones/${salonId}`)
}

const getRolBadgeVariant = (rol) => {
  const variants = {
    'admin': 'error',
    'proveedor': 'secondary',
    'cliente': 'primary'
  }
  return variants[rol] || 'default'
}

const getRolLabel = (rol) => {
  const labels = {
    'admin': 'Administrador',
    'proveedor': 'Proveedor', 
    'cliente': 'Cliente'
  }
  return labels[rol] || rol
}

const getAlertClass = (tipo) => {
  const classes = {
    'warning': 'p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800',
    'error': 'p-3 bg-red-50 border border-red-200 rounded-lg text-red-800',
    'info': 'p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800'
  }
  return classes[tipo] || classes.info
}

// Lifecycle
onMounted(() => {
  loadAdminData()
})
</script>

<style>
@import '../../components/dashboard/dashboard.css';
</style>