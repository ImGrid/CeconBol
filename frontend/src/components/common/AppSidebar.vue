<template>
  <nav :class="sidebarClass">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="flex items-center justify-between">
        <router-link 
          to="/" 
          class="sidebar-logo"
          @click="$emit('close')"
        >
          CECONBOL
        </router-link>
        
        <!-- Botón cerrar en móvil -->
        <button
          @click="$emit('close')"
          class="p-2 text-gray-400 rounded-md lg:hidden hover:text-gray-600"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Info del usuario -->
      <div class="p-3 mt-4 rounded-lg bg-gray-50">
        <div class="flex items-center space-x-3">
          <div class="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary">
            <span class="font-medium text-white">
              {{ userInitials }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">
              {{ user.nombre }} {{ user.apellido }}
            </p>
            <p class="text-xs text-gray-500 capitalize">
              {{ getRoleLabel(user.rol) }}
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Navegación -->
    <div class="sidebar-nav">
      <!-- Enlaces comunes -->
      <router-link
        v-for="item in commonNavItems"
        :key="item.path"
        :to="item.path"
        :class="getNavItemClass(item.path)"
        @click="$emit('close')"
      >
        <component :is="item.icon" class="sidebar-nav-icon" />
        {{ item.label }}
      </router-link>
      
      <!-- Separador -->
      <div v-if="roleNavItems.length > 0" class="my-4 border-t border-gray-200"></div>
      
      <!-- Enlaces específicos por rol -->
      <router-link
        v-for="item in roleNavItems"
        :key="item.path"
        :to="item.path"
        :class="getNavItemClass(item.path)"
        @click="$emit('close')"
      >
        <component :is="item.icon" class="sidebar-nav-icon" />
        {{ item.label }}
        <Badge v-if="item.badge" :variant="item.badgeVariant" size="small" class="ml-auto">
          {{ item.badge }}
        </Badge>
      </router-link>
      
      <!-- Enlaces de administración -->
      <template v-if="adminNavItems.length > 0">
        <div class="my-4 border-t border-gray-200"></div>
        <div class="px-3 py-2">
          <p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Administración
          </p>
        </div>
        
        <router-link
          v-for="item in adminNavItems"
          :key="item.path"
          :to="item.path"
          :class="getNavItemClass(item.path)"
          @click="$emit('close')"
        >
          <component :is="item.icon" class="sidebar-nav-icon" />
          {{ item.label }}
          <Badge v-if="item.badge" :variant="item.badgeVariant" size="small" class="ml-auto">
            {{ item.badge }}
          </Badge>
        </router-link>
      </template>
    </div>
    
    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="text-center">
        <p class="text-xs text-gray-500">
          CECONBOL v1.0
        </p>
        <p class="mt-1 text-xs text-gray-400">
          © 2024 Bolivia
        </p>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { usePermissions } from '@/composables/usePermissions.js'
import Badge from '@/components/ui/Badge.vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

// Events
defineEmits(['close'])

// Composables
const route = useRoute()
const { user } = useAuth()
const { 
  isAdmin, 
  isProveedor, 
  isCliente,
  navigationPermissions 
} = usePermissions()
const sidebarClass = computed(() => {
  return [
    'dashboard-sidebar',
    props.show ? 'dashboard-sidebar-visible' : 'dashboard-sidebar-hidden'
  ].join(' ')
})

const userInitials = computed(() => {
  if (!user.value) return 'U'
  const firstName = user.value.nombre?.charAt(0) || ''
  const lastName = user.value.apellido?.charAt(0) || ''
  return (firstName + lastName).toUpperCase() || 'U'
})

// Enlaces comunes para todos los usuarios
const commonNavItems = computed(() => {
  const items = [
    {
      path: getDashboardPath(),
      label: 'Dashboard',
      icon: 'HomeIcon'
    }
  ]
  
  // Solo agregar si está autenticado
  if (user.value) {
    items.push({
      path: '/salones',
      label: 'Buscar Salones',
      icon: 'SearchIcon'
    })
  }
  
  return items
})

// Enlaces específicos por rol
const roleNavItems = computed(() => {
  const items = []
  
  if (isCliente.value) {
    items.push(
      {
        path: '/mis-consultas',
        label: 'Mis Consultas',
        icon: 'ChatIcon',
        badge: 2, // Simulado
        badgeVariant: 'primary'
      },
      {
        path: '/mis-eventos',
        label: 'Mis Eventos',
        icon: 'CalendarIcon'
      },
      {
        path: '/mis-resenas',
        label: 'Mis Reseñas',
        icon: 'StarIcon'
      }
    )
  }
  
  if (isProveedor.value) {
    items.push(
      {
        path: '/mis-salones',
        label: 'Mis Salones',
        icon: 'BuildingIcon'
      },
      {
        path: '/consultas',
        label: 'Consultas Recibidas',
        icon: 'InboxIcon',
        badge: 5, // Simulado
        badgeVariant: 'warning'
      },
      {
        path: '/eventos',
        label: 'Eventos',
        icon: 'CalendarIcon'
      },
      {
        path: '/resenas',
        label: 'Reseñas',
        icon: 'StarIcon'
      }
    )
  }
  
  return items
})

// Enlaces de administración
const adminNavItems = computed(() => {
  if (!isAdmin.value) return []
  
  return [
    {
      path: '/admin/usuarios',
      label: 'Usuarios',
      icon: 'UsersIcon'
    },
    {
      path: '/admin/salones',
      label: 'Gestión Salones',
      icon: 'BuildingIcon',
      badge: 3, // Pendientes de aprobación
      badgeVariant: 'warning'
    },
    {
      path: '/admin/reportes',
      label: 'Reportes',
      icon: 'ChartBarIcon'
    },
    {
      path: '/admin/configuracion',
      label: 'Configuración',
      icon: 'CogIcon'
    }
  ]
})

// Métodos
const getDashboardPath = () => {
  if (isAdmin.value) return '/admin/dashboard'
  if (isProveedor.value) return '/dashboard'
  return '/dashboard' // Cliente también usa dashboard básico
}

const getNavItemClass = (path) => {
  const isActive = route.path === path || route.path.startsWith(path + '/')
  
  return [
    'sidebar-nav-item',
    isActive ? 'sidebar-nav-item-active' : 'sidebar-nav-item-inactive'
  ].join(' ')
}

const getRoleLabel = (rol) => {
  const labels = {
    'cliente': 'Cliente',
    'proveedor': 'Proveedor',
    'admin': 'Administrador'
  }
  return labels[rol] || rol
}

// Iconos como strings (se pueden reemplazar con componentes reales)
const HomeIcon = 'svg'
const SearchIcon = 'svg'
const ChatIcon = 'svg'
const CalendarIcon = 'svg'
const StarIcon = 'svg'
const BuildingIcon = 'svg'
const InboxIcon = 'svg'
const UsersIcon = 'svg'
const ChartBarIcon = 'svg'
const CogIcon = 'svg'
</script>