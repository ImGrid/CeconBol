<template>
  <div class="recent-activity">
    <div class="recent-activity-header">
      <h3 class="recent-activity-title">Actividad Reciente</h3>
      <button 
        v-if="activities.length > 0"
        @click="$emit('view-all')"
        class="recent-activity-view-all"
      >
        Ver todo
      </button>
    </div>
    
    <!-- Lista de actividades -->
    <div v-if="!loading && activities.length > 0" class="activity-list">
      <div
        v-for="activity in displayedActivities"
        :key="activity.id"
        class="activity-item"
        @click="handleActivityClick(activity)"
      >
        <!-- Icono -->
        <div :class="getActivityIconClass(activity.type)">
          <component :is="getActivityIcon(activity.type)" class="w-4 h-4" />
        </div>
        
        <!-- Contenido -->
        <div class="activity-content">
          <p class="activity-title">{{ activity.title }}</p>
          <p class="activity-description">{{ activity.description }}</p>
          <p class="activity-time">{{ formatTime(activity.createdAt) }}</p>
        </div>
        
        <!-- Estado o badge -->
        <div v-if="activity.status" class="flex-shrink-0">
          <Badge :variant="getStatusVariant(activity.status)" size="small">
            {{ getStatusLabel(activity.status) }}
          </Badge>
        </div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-else-if="loading" class="space-y-4">
      <div 
        v-for="n in 5" 
        :key="n"
        class="activity-item animate-pulse"
      >
        <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div class="activity-content">
          <div class="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
          <div class="w-1/2 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
    
    <!-- Empty state -->
    <div v-else class="dashboard-empty-state">
      <svg class="dashboard-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h4 class="dashboard-empty-title">No hay actividad reciente</h4>
      <p class="dashboard-empty-description">
        Cuando realices acciones en la plataforma, aparecerán aquí.
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatRelativeTime } from '@/utils/helpers.js'
import Badge from '@/components/ui/Badge.vue'

// Props
const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  maxItems: {
    type: Number,
    default: 5
  }
})

// Events
const emit = defineEmits(['view-all', 'activity-click'])

// Router
const router = useRouter()

// Computed
const displayedActivities = computed(() => {
  return props.activities.slice(0, props.maxItems)
})

// Métodos
const getActivityIconClass = (type) => {
  const baseClass = 'activity-icon'
  const typeClasses = {
    'consulta': 'activity-icon-consulta',
    'evento': 'activity-icon-evento',
    'resena': 'activity-icon-resena',
    'salon': 'activity-icon-salon',
    'pago': 'activity-icon-consulta',
    'notificacion': 'activity-icon-evento'
  }
  
  return [baseClass, typeClasses[type] || typeClasses.consulta].join(' ')
}

const getActivityIcon = (type) => {
  const icons = {
    'consulta': 'ChatIcon',
    'evento': 'CalendarIcon',
    'resena': 'StarIcon',
    'salon': 'BuildingIcon',
    'pago': 'CreditCardIcon',
    'notificacion': 'BellIcon'
  }
  
  return icons[type] || 'DocumentIcon'
}

const getStatusVariant = (status) => {
  const variants = {
    'nueva': 'primary',
    'pendiente': 'warning',
    'completado': 'success',
    'aprobado': 'success',
    'rechazado': 'error',
    'cancelado': 'error',
    'en_progreso': 'secondary'
  }
  
  return variants[status] || 'default'
}

const getStatusLabel = (status) => {
  const labels = {
    'nueva': 'Nueva',
    'pendiente': 'Pendiente',
    'completado': 'Completado',
    'aprobado': 'Aprobado',
    'rechazado': 'Rechazado',
    'cancelado': 'Cancelado',
    'en_progreso': 'En Progreso'
  }
  
  return labels[status] || status
}

const formatTime = (date) => {
  return formatRelativeTime(new Date(date))
}

const handleActivityClick = (activity) => {
  emit('activity-click', activity)
  
  // Navegación automática según el tipo
  if (activity.url) {
    router.push(activity.url)
  } else {
    // Navegación por defecto según el tipo
    switch (activity.type) {
      case 'consulta':
        router.push(`/consultas/${activity.entityId}`)
        break
      case 'evento':
        router.push(`/eventos/${activity.entityId}`)
        break
      case 'salon':
        router.push(`/salones/${activity.entityId}`)
        break
      case 'resena':
        router.push(`/resenas/${activity.entityId}`)
        break
    }
  }
}

// Iconos como strings (se pueden reemplazar con componentes reales)
const ChatIcon = 'svg'
const CalendarIcon = 'svg'
const StarIcon = 'svg'
const BuildingIcon = 'svg'
const CreditCardIcon = 'svg'
const BellIcon = 'svg'
const DocumentIcon = 'svg'
</script>