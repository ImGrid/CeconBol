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

// ✅ CORREGIDO: Clases CSS que SÍ existen en main.css
export const getEstadoBadgeColor = (estado, tipo = 'consulta') => {
  const colors = {
    consulta: {
      'nueva': 'bg-blue-50 text-blue-700 border border-blue-200',              // Azul para nuevas
      'contactado': 'bg-amber-50 text-amber-700 border border-amber-200',      // Amber para progreso
      'cotizado': 'bg-purple-50 text-purple-700 border border-purple-200',     // Purple para cotizado
      'negociando': 'bg-orange-50 text-orange-700 border border-orange-200',   // Orange para negociación
      'ganada': 'bg-green-50 text-green-700 border border-green-200',          // Verde para ganada
      'perdida': 'bg-red-50 text-red-700 border border-red-200'                // Rojo para perdida
    },
    evento: {
      'confirmado': 'bg-blue-50 text-blue-700 border border-blue-200',         // Azul para confirmado
      'en_progreso': 'bg-amber-50 text-amber-700 border border-amber-200',     // Amber para progreso
      'completado': 'bg-green-50 text-green-700 border border-green-200',      // Verde para completado
      'cancelado': 'bg-red-50 text-red-700 border border-red-200'              // Rojo para cancelado
    },
    salon: {
      'borrador': 'bg-gray-50 text-gray-700 border border-gray-200',           // Gris para borrador
      'pendiente': 'bg-amber-50 text-amber-700 border border-amber-200',       // Amber para pendiente
      'aprobado': 'bg-green-50 text-green-700 border border-green-200',        // Verde para aprobado
      'rechazado': 'bg-red-50 text-red-700 border border-red-200',             // Rojo para rechazado
      'suspendido': 'bg-orange-50 text-orange-700 border border-orange-200'    // Orange para suspendido
    },
    resena: {
      'pendiente': 'bg-amber-50 text-amber-700 border border-amber-200',       // Amber para pendiente
      'aprobado': 'bg-green-50 text-green-700 border border-green-200',        // Verde para aprobado
      'rechazado': 'bg-red-50 text-red-700 border border-red-200'              // Rojo para rechazado
    }
  }
  
  return colors[tipo]?.[estado] || 'bg-gray-50 text-gray-700 border border-gray-200'
}

// ✅ CORREGIDO: Usar clases que SÍ existen en el sistema
export const getEstadoBadgeVariant = (estado, tipo = 'consulta') => {
  // Mapeo a las variantes de Badge.vue que SÍ existen
  const variants = {
    consulta: {
      'nueva': 'primary',
      'contactado': 'warning', 
      'cotizado': 'secondary',
      'negociando': 'warning',
      'ganada': 'success',
      'perdida': 'error'
    },
    evento: {
      'confirmado': 'primary',
      'en_progreso': 'warning',
      'completado': 'success',
      'cancelado': 'error'
    },
    salon: {
      'borrador': 'default',
      'pendiente': 'warning',
      'aprobado': 'success',
      'rechazado': 'error',
      'suspendido': 'warning'
    },
    resena: {
      'pendiente': 'warning',
      'aprobado': 'success',
      'rechazado': 'error'
    }
  }
  
  return variants[tipo]?.[estado] || 'default'
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

// ✅ ELIMINADO: generateSlug duplicado (ya existe en salones.service.js)
// Lo mantendré aquí como función principal y eliminaré de salones.service.js
export const generateSlug = (text) => {
  if (!text) return ''
  
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

// ✅ CORREGIDO: Usar clases del sistema CSS
export const getPriceColorClass = (highlighted = false) => {
  if (highlighted) {
    return 'text-brand-primary font-bold' // Usa variable CSS definida
  }
  return 'text-gray-900 font-semibold'
}

// ✅ CORREGIDO: Usar clases que existen
export const getRatingColorClass = () => {
  return 'text-brand-accent' // Usa variable CSS definida (Dorado)
}

// ✅ NUEVO: Función para obtener clases de botón según estado
export const getButtonVariantForStatus = (estado, tipo = 'salon') => {
  const variants = {
    salon: {
      'borrador': 'outline-primary',
      'pendiente': 'warning',
      'aprobado': 'success',
      'rechazado': 'outline-secondary',
      'suspendido': 'outline-secondary'
    },
    consulta: {
      'nueva': 'primary',
      'contactado': 'secondary',
      'cotizado': 'outline-primary',
      'negociando': 'secondary',
      'ganada': 'success',
      'perdida': 'outline-secondary'
    }
  }
  
  return variants[tipo]?.[estado] || 'primary'
}

// ✅ NUEVO: Función para formatear archivos
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ✅ NUEVO: Función para capitalizar texto
export const capitalize = (text) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// ✅ NUEVO: Función para formatear números con separadores
export const formatNumber = (number) => {
  if (!number && number !== 0) return ''
  return new Intl.NumberFormat('es-BO').format(number)
}

// ✅ NUEVO: Función para obtener iniciales de nombre
export const getInitials = (nombre, apellido = '') => {
  if (!nombre) return 'U'
  
  const firstInitial = nombre.charAt(0).toUpperCase()
  const lastInitial = apellido ? apellido.charAt(0).toUpperCase() : ''
  
  return firstInitial + lastInitial
}

// ✅ NUEVO: Función para validar si una URL es válida
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}