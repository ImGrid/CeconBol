import { MONEDA } from './constants.js'

// Formatea precios en bolivianos
export const formatPrice = (price) => {
  if (!price || isNaN(price)) return `${MONEDA}. 0`
  
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price).replace('BOB', `${MONEDA}.`)
}

// Formatea fechas - format: 'short', 'long', 'relative'
export const formatDate = (date, format = 'short') => {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  if (isNaN(dateObj.getTime())) return ''
  
  const options = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    long: { year: 'numeric', month: 'long', day: 'numeric' }
  }
  
  if (format === 'relative') {
    return formatRelativeTime(dateObj)
  }
  
  return new Intl.DateTimeFormat('es-BO', options[format] || options.short).format(dateObj)
}

// Tiempo relativo - "hace 2 días"
export const formatRelativeTime = (date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'hace un momento'
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`
  if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`
  if (diffInSeconds < 31536000) return `hace ${Math.floor(diffInSeconds / 2592000)} meses`
  
  return `hace ${Math.floor(diffInSeconds / 31536000)} años`
}

// Rango de capacidad - "50 - 200 personas"
export const formatCapacity = (min, max) => {
  if (!min && !max) return 'No especificado'
  if (!max) return `Desde ${min} personas`
  if (!min) return `Hasta ${max} personas`
  if (min === max) return `${min} personas`
  
  return `${min} - ${max} personas`
}

// Labels amigables para estados - tipo: 'consulta', 'evento', 'salon', 'resena'
export const getEstadoLabel = (estado, tipo = 'consulta') => {
  const labels = {
    consulta: {
      'nueva': 'Nueva Consulta',
      'contactado': 'Contactado',
      'cotizado': 'Cotizado',
      'negociando': 'En Negociación',
      'ganada': 'Confirmado',
      'perdida': 'No Concretado'
    },
    evento: {
      'confirmado': 'Confirmado',
      'en_progreso': 'En Progreso',
      'completado': 'Completado',
      'cancelado': 'Cancelado'
    },
    salon: {
      'borrador': 'Borrador',
      'pendiente': 'Pendiente Aprobación',
      'aprobado': 'Aprobado',
      'rechazado': 'Rechazado',
      'suspendido': 'Suspendido'
    },
    resena: {
      'pendiente': 'Pendiente Moderación',
      'aprobado': 'Aprobado',
      'rechazado': 'Rechazado'
    }
  }
  
  return labels[tipo]?.[estado] || estado
}

// ✨ ACTUALIZADO: Colores de badges para estados con paleta "Elegancia Festiva"
export const getEstadoBadgeColor = (estado, tipo = 'consulta') => {
  const colors = {
    consulta: {
      'nueva': 'bg-primary-50 text-primary-700 border border-primary-200',           // Azul Océano
      'contactado': 'bg-secondary-50 text-secondary-700 border border-secondary-200', // Naranja Dorado
      'cotizado': 'bg-accent-50 text-accent-700 border border-accent-200',           // Dorado Sutil
      'negociando': 'bg-secondary-100 text-secondary-800 border border-secondary-300', // Naranja más intenso
      'ganada': 'bg-success-50 text-success-700 border border-success-200',          // Verde Salvia
      'perdida': 'bg-red-50 text-red-700 border border-red-200'                      // Rojo para perdidas
    },
    evento: {
      'confirmado': 'bg-primary-50 text-primary-700 border border-primary-200',      // Azul Océano
      'en_progreso': 'bg-secondary-50 text-secondary-700 border border-secondary-200', // Naranja Dorado
      'completado': 'bg-success-50 text-success-700 border border-success-200',      // Verde Salvia
      'cancelado': 'bg-red-50 text-red-700 border border-red-200'                    // Rojo
    },
    salon: {
      'borrador': 'bg-gray-50 text-gray-700 border border-gray-200',                 // Gris neutro
      'pendiente': 'bg-accent-50 text-accent-700 border border-accent-200',          // Dorado - espera
      'aprobado': 'bg-success-50 text-success-700 border border-success-200',        // Verde Salvia
      'rechazado': 'bg-red-50 text-red-700 border border-red-200',                   // Rojo
      'suspendido': 'bg-secondary-50 text-secondary-700 border border-secondary-200' // Naranja - advertencia
    },
    resena: {
      'pendiente': 'bg-accent-50 text-accent-700 border border-accent-200',          // Dorado - espera
      'aprobado': 'bg-success-50 text-success-700 border border-success-200',        // Verde Salvia
      'rechazado': 'bg-red-50 text-red-700 border border-red-200'                    // Rojo
    }
  }
  
  return colors[tipo]?.[estado] || 'bg-gray-50 text-gray-700 border border-gray-200'
}

// ✨ NUEVA: Función para iconos de estado (opcional, para mejorar UX)
export const getEstadoIcon = (estado, tipo = 'consulta') => {
  const icons = {
    consulta: {
      'nueva': '💬',
      'contactado': '📞', 
      'cotizado': '💰',
      'negociando': '🤝',
      'ganada': '✅',
      'perdida': '❌'
    },
    evento: {
      'confirmado': '📅',
      'en_progreso': '🎉', 
      'completado': '✅',
      'cancelado': '❌'
    },
    salon: {
      'borrador': '📝',
      'pendiente': '⏳',
      'aprobado': '✅', 
      'rechazado': '❌',
      'suspendido': '⏸️'
    },
    resena: {
      'pendiente': '⏳',
      'aprobado': '⭐',
      'rechazado': '❌'
    }
  }
  
  return icons[tipo]?.[estado] || '📄'
}

// Corta texto largo
export const truncateText = (text, length = 100) => {
  if (!text || text.length <= length) return text
  return text.substring(0, length) + '...'
}

// Validaciones básicas
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidBolivianPhone = (phone) => {
  const phoneRegex = /^\d{7,8}$/
  return phoneRegex.test(phone)
}

// Genera slug para URLs
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .replace(/^-|-$/g, '') // Quitar guiones al inicio/final
}

// Debounce para búsquedas
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Formatea teléfonos bolivianos
export const formatPhone = (phone) => {
  if (!phone) return ''
  
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}` // 1234-5678
  } else if (cleaned.length === 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}` // 123-4567
  }
  
  return phone
}

// ✨ NUEVA: Función para obtener clase de color para precios
export const getPriceColorClass = (highlighted = false) => {
  return highlighted ? 'text-brand-primary font-bold' : 'text-gray-900 font-semibold'
}

// ✨ NUEVA: Función para obtener clase de rating/estrellas
export const getRatingColorClass = () => {
  return 'text-brand-accent' // Dorado sutil para las estrellas
}