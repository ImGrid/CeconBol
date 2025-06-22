<template>
  <div class="quick-actions">
    <div class="quick-actions-header">
      <h3 class="quick-actions-title">Acciones Rápidas</h3>
    </div>
    
    <div class="quick-actions-grid">
      <button
        v-for="action in actions"
        :key="action.key"
        @click="handleAction(action)"
        class="quick-action-btn"
        :disabled="action.disabled"
      >
        <component :is="action.icon" class="quick-action-icon" />
        <span class="quick-action-label">{{ action.label }}</span>
        <span v-if="action.description" class="mt-1 text-xs text-gray-500">
          {{ action.description }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePermissions } from '@/composables/usePermissions.js'

// Router
const router = useRouter()

// Composables
const { isAdmin, isProveedor, isCliente } = usePermissions()

// Events
const emit = defineEmits(['action'])

// Computed - Acciones según el rol
const actions = computed(() => {
  const allActions = []
  
  // Acciones para Cliente
  if (isCliente.value) {
    allActions.push(
      {
        key: 'search-salon',
        label: 'Buscar Salón',
        description: 'Encuentra el salón perfecto',
        icon: 'SearchIcon',
        route: '/salones'
      },
      {
        key: 'new-consulta',
        label: 'Nueva Consulta',
        description: 'Contactar un salón',
        icon: 'ChatIcon',
        route: '/consultas/create'
      },
      {
        key: 'view-eventos',
        label: 'Mis Eventos',
        description: 'Ver eventos programados',
        icon: 'CalendarIcon',
        route: '/mis-eventos'
      },
      {
        key: 'write-review',
        label: 'Escribir Reseña',
        description: 'Califica tu experiencia',
        icon: 'StarIcon',
        route: '/mis-resenas'
      }
    )
  }
  
  // Acciones para Proveedor
  if (isProveedor.value) {
    allActions.push(
      {
        key: 'add-salon',
        label: 'Agregar Salón',
        description: 'Publicar nuevo salón',
        icon: 'PlusIcon',
        route: '/mis-salones/crear'
      },
      {
        key: 'manage-consultas',
        label: 'Ver Consultas',
        description: 'Gestionar consultas',
        icon: 'InboxIcon',
        route: '/consultas'
      },
      {
        key: 'manage-eventos',
        label: 'Gestionar Eventos',
        description: 'Organizar eventos',
        icon: 'CalendarIcon',
        route: '/eventos'
      },
      {
        key: 'view-stats',
        label: 'Ver Estadísticas',
        description: 'Analizar rendimiento',
        icon: 'ChartBarIcon',
        action: 'show-stats'
      }
    )
  }
  
  // Acciones para Admin
  if (isAdmin.value) {
    allActions.push(
      {
        key: 'manage-users',
        label: 'Gestionar Usuarios',
        description: 'Administrar usuarios',
        icon: 'UsersIcon',
        route: '/admin/usuarios'
      },
      {
        key: 'approve-salones',
        label: 'Aprobar Salones',
        description: 'Revisar publicaciones',
        icon: 'CheckIcon',
        route: '/admin/salones'
      },
      {
        key: 'view-reports',
        label: 'Ver Reportes',
        description: 'Análisis del sistema',
        icon: 'DocumentReportIcon',
        route: '/admin/reportes'
      },
      {
        key: 'system-config',
        label: 'Configuración',
        description: 'Ajustes del sistema',
        icon: 'CogIcon',
        route: '/admin/configuracion'
      }
    )
  }
  
  return allActions
})

// Métodos
const handleAction = (action) => {
  if (action.disabled) return
  
  if (action.route) {
    // Navegar a una ruta
    router.push(action.route)
  } else if (action.action) {
    // Emitir un evento personalizado
    emit('action', action.action, action)
  } else if (action.onClick) {
    // Ejecutar función personalizada
    action.onClick()
  }
}

// Iconos como strings (se pueden reemplazar con componentes reales)
const SearchIcon = 'svg'
const ChatIcon = 'svg'
const CalendarIcon = 'svg'
const StarIcon = 'svg'
const PlusIcon = 'svg'
const InboxIcon = 'svg'
const ChartBarIcon = 'svg'
const UsersIcon = 'svg'
const CheckIcon = 'svg'
const DocumentReportIcon = 'svg'
const CogIcon = 'svg'
</script>