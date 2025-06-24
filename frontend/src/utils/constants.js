// Constantes para CECONBOL - Basadas en el backend

// URL base de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Endpoints de la API
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    PROFILE: '/api/auth/profile',
    VERIFY: '/api/auth/verify',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    CHANGE_PASSWORD: '/api/auth/change-password'
  },
  
  // 🏢 Salones - FASE 4 COMPLETADA
  SALONES: {
    LIST: '/api/salones',
    CREATE: '/api/salones',
    BY_ID: '/api/salones',
    BY_SLUG: '/api/salones/slug',
    MIS_SALONES: '/api/salones/mis-salones',
    UPLOAD_PHOTOS: '/api/salones/{id}/fotos',
    CHANGE_STATUS: '/api/salones/{id}/estado',
    
    // ⭐ NUEVOS ENDPOINTS FASE 4:
    STATS: '/api/salones/mis-salones/stats',
    VISIBILITY: '/api/salones/{id}/visibilidad',
    DELETE_PHOTO: '/api/salones/{id}/fotos/{photoId}',
    UPDATE_PHOTO: '/api/salones/{id}/fotos/{photoId}',
    REORDER_PHOTOS: '/api/salones/{id}/fotos/reorder',
    DISPONIBILIDAD: '/api/salones/{id}/disponibilidad'
  },
  
  // Búsqueda
  BUSQUEDA: {
    SALONES: '/api/busqueda/salones',
    SUGERENCIAS: '/api/busqueda/sugerencias',
    POPULARES: '/api/busqueda/populares',
    DESTACADOS: '/api/busqueda/destacados',
    UBICACION: '/api/busqueda/ubicacion',
    FILTROS: '/api/busqueda/filtros',
    AUTOCOMPLETADO: '/api/busqueda/autocompletado'
  },
  
  // Consultas
  CONSULTAS: {
    CREATE: '/api/consultas',
    MIS_CONSULTAS: '/api/consultas/mis-consultas',
    BY_SALON: '/api/consultas/salon',
    BY_ID: '/api/consultas',
    UPDATE_STATUS: '/api/consultas/{id}/estado',
    ADD_MESSAGE: '/api/consultas/{id}/mensajes',
    DASHBOARD: '/api/consultas/dashboard',
    STATS: '/api/consultas/stats'
  },
  
  // Eventos
  EVENTOS: {
    FROM_CONSULTA: '/api/eventos/from-consulta',
    MIS_EVENTOS: '/api/eventos/mis-eventos',
    BY_ID: '/api/eventos',
    UPDATE_STATUS: '/api/eventos/{id}/estado',
    DASHBOARD: '/api/eventos/dashboard',
    STATS: '/api/eventos/stats'
  },
  
  // Reseñas
  RESENAS: {
    CREATE: '/api/resenas',
    BY_SALON: '/api/resenas/salon',
    MIS_RESENAS: '/api/resenas/mis-resenas',
    RESPOND: '/api/resenas/{id}/responder',
    MODERATE: '/api/resenas/{id}/moderar',
    DASHBOARD: '/api/resenas/dashboard'
  },
  
  // 📁 Upload - FASE 4
  UPLOAD: {
    IMAGE: '/api/upload/image',
    IMAGES: '/api/upload/images',
    DELETE: '/api/upload/{id}'
  }
}

// Ciudades de Bolivia (igual que en el backend)
export const CIUDADES_BOLIVIA = [
  'La Paz',
  'Santa Cruz', 
  'Cochabamba',
  'Sucre',
  'Potosí',
  'Oruro'
]

// Roles de usuario
export const USER_ROLES = {
  CLIENTE: 'cliente',
  PROVEEDOR: 'proveedor',
  ADMIN: 'admin'
}

// Estados de consultas (del backend)
export const CONSULTA_ESTADOS = {
  NUEVA: 'nueva',
  CONTACTADO: 'contactado',
  COTIZADO: 'cotizado',
  NEGOCIANDO: 'negociando',
  GANADA: 'ganada',
  PERDIDA: 'perdida'
}

// Estados de eventos
export const EVENTO_ESTADOS = {
  CONFIRMADO: 'confirmado',
  EN_PROGRESO: 'en_progreso',
  COMPLETADO: 'completado',
  CANCELADO: 'cancelado'
}

// Estados de salones
export const SALON_ESTADOS = {
  BORRADOR: 'borrador',
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado',
  SUSPENDIDO: 'suspendido'
}

// Estados de reseñas
export const RESENA_ESTADOS = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado'
}

// Tipos de eventos comunes
export const TIPOS_EVENTO = [
  'Quinceañero',
  'Boda',
  'Cumpleaños',
  'Graduación',
  'Aniversario',
  'Bautizo',
  'Primera Comunión',
  'Reunión Familiar',
  'Evento Corporativo',
  'Otro'
]

// Configuración
export const PAGINATION = {
  DEFAULT_LIMIT: 12,
  SEARCH_LIMIT: 20,
  DASHBOARD_LIMIT: 10
}

// 📁 Configuración de archivos - FASE 4
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 10,
  
  // Nuevas configuraciones para Fase 4:
  COMPRESSION: {
    MAX_WIDTH: 1920,
    MAX_HEIGHT: 1080,
    QUALITY: 0.8
  },
  THUMBNAILS: {
    SMALL: { width: 150, height: 150 },
    MEDIUM: { width: 400, height: 300 },
    LARGE: { width: 800, height: 600 }
  }
}

export const MONEDA = 'BOB'

// Mensajes comunes
export const MESSAGES = {
  LOADING: 'Cargando...',
  ERROR_GENERIC: 'Ha ocurrido un error inesperado',
  ERROR_NETWORK: 'Error de conexión. Verifica tu internet.',
  ERROR_UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  SUCCESS_SAVE: 'Guardado exitosamente',
  SUCCESS_DELETE: 'Eliminado exitosamente',
  CONFIRM_DELETE: '¿Estás seguro de que deseas eliminar este elemento?',
  
  // Mensajes específicos de Fase 4:
  SALON_CREATED: 'Salón creado exitosamente',
  SALON_UPDATED: 'Salón actualizado exitosamente',
  SALON_DELETED: 'Salón eliminado exitosamente',
  PHOTOS_UPLOADED: 'Fotos subidas exitosamente',
  PHOTO_DELETED: 'Foto eliminada exitosamente'
}