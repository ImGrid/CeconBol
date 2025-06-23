import { get, post, put, del } from '@/services/api.js'
import { API_ENDPOINTS } from '@/utils/constants.js'

// === SALONES PÚBLICOS ===

export const getSalones = async (filtros = {}, paginacion = {}) => {
  try {
    const params = new URLSearchParams()
    
    // Filtros
    if (filtros.ciudad) params.append('ciudad', filtros.ciudad)
    if (filtros.capacidadMinima) params.append('capacidadMinima', filtros.capacidadMinima)
    if (filtros.precioMaximo) params.append('precioMaximo', filtros.precioMaximo)
    if (filtros.search) params.append('search', filtros.search)
    
    // Paginación
    if (paginacion.page) params.append('page', paginacion.page)
    if (paginacion.limit) params.append('limit', paginacion.limit)
    
    const queryString = params.toString()
    const url = queryString ? `${API_ENDPOINTS.SALONES.LIST}?${queryString}` : API_ENDPOINTS.SALONES.LIST
    
    const response = await get(url)
    return response.data.data
  } catch (error) {
    console.error('Error getting salones:', error)
    throw error
  }
}

export const getSalonById = async (salonId) => {
  try {
    const response = await get(`${API_ENDPOINTS.SALONES.BY_ID}/${salonId}`)
    return response.data.data
  } catch (error) {
    console.error('Error getting salon by ID:', error)
    throw error
  }
}

export const getSalonBySlug = async (slug) => {
  try {
    const response = await get(`${API_ENDPOINTS.SALONES.BY_SLUG}/${slug}`)
    return response.data.data
  } catch (error) {
    console.error('Error getting salon by slug:', error)
    throw error
  }
}

// === MIS SALONES (PROVEEDOR) ===

export const getMisSalones = async (filtros = {}) => {
  try {
    const params = new URLSearchParams()
    if (filtros.estado) params.append('estado', filtros.estado)
    if (filtros.page) params.append('page', filtros.page)
    if (filtros.limit) params.append('limit', filtros.limit)
    
    const queryString = params.toString()
    const url = queryString ? `${API_ENDPOINTS.SALONES.MIS_SALONES}?${queryString}` : API_ENDPOINTS.SALONES.MIS_SALONES
    
    const response = await get(url)
    return response.data.data
  } catch (error) {
    console.error('Error getting mis salones:', error)
    throw error
  }
}

// === CREAR SALÓN ===

export const createSalon = async (salonData) => {
  try {
    const response = await post(API_ENDPOINTS.SALONES.CREATE, salonData)
    return response.data.data
  } catch (error) {
    console.error('Error creating salon:', error)
    throw error
  }
}

// === ACTUALIZAR SALÓN ===

export const updateSalon = async (salonId, salonData) => {
  try {
    const response = await put(`${API_ENDPOINTS.SALONES.BY_ID}/${salonId}`, salonData)
    return response.data.data
  } catch (error) {
    console.error('Error updating salon:', error)
    throw error
  }
}

// === ELIMINAR SALÓN ===

export const deleteSalon = async (salonId) => {
  try {
    const response = await del(`${API_ENDPOINTS.SALONES.BY_ID}/${salonId}`)
    return response.data.data
  } catch (error) {
    console.error('Error deleting salon:', error)
    throw error
  }
}

// === CAMBIAR ESTADO DEL SALÓN ===

export const changeSalonStatus = async (salonId, nuevoEstado) => {
  try {
    const endpoint = API_ENDPOINTS.SALONES.CHANGE_STATUS.replace('{id}', salonId)
    const response = await put(endpoint, { estado: nuevoEstado })
    return response.data.data
  } catch (error) {
    console.error('Error changing salon status:', error)
    throw error
  }
}

// === SALÓN DRAFT ===

export const saveSalonDraft = async (salonData) => {
  try {
    const draftData = { ...salonData, estado: 'borrador' }
    const response = await post(API_ENDPOINTS.SALONES.CREATE, draftData)
    return response.data.data
  } catch (error) {
    console.error('Error saving salon draft:', error)
    throw error
  }
}

export const publishSalon = async (salonId) => {
  try {
    return await changeSalonStatus(salonId, 'pendiente')
  } catch (error) {
    console.error('Error publishing salon:', error)
    throw error
  }
}

// === ESTADÍSTICAS DEL PROVEEDOR ===

export const getMisSalonesStats = async () => {
  try {
    const response = await get('/api/salones/mis-salones/stats')
    return response.data.data
  } catch (error) {
    console.error('Error getting salones stats:', error)
    throw error
  }
}

// === VALIDACIONES ANTES DE ENVÍO ===

export const validateSalonData = (salonData) => {
  const errors = []
  
  // Validaciones básicas
  if (!salonData.nombre || salonData.nombre.length < 3) {
    errors.push('El nombre del salón debe tener al menos 3 caracteres')
  }
  
  if (!salonData.descripcion || salonData.descripcion.length < 50) {
    errors.push('La descripción debe tener al menos 50 caracteres')
  }
  
  if (!salonData.ciudad) {
    errors.push('La ciudad es requerida')
  }
  
  if (!salonData.direccion || salonData.direccion.length < 10) {
    errors.push('La dirección debe ser más específica')
  }
  
  if (!salonData.capacidadMinima || salonData.capacidadMinima <= 0) {
    errors.push('La capacidad mínima es requerida')
  }
  
  if (!salonData.capacidadMaxima || salonData.capacidadMaxima <= 0) {
    errors.push('La capacidad máxima es requerida')
  }
  
  if (salonData.capacidadMaxima < salonData.capacidadMinima) {
    errors.push('La capacidad máxima debe ser mayor a la mínima')
  }
  
  if (!salonData.modeloPrecio) {
    errors.push('El modelo de precio es requerido')
  }
  
  if (salonData.modeloPrecio !== 'personalizado' && (!salonData.precioBase || salonData.precioBase <= 0)) {
    errors.push('El precio base es requerido')
  }
  
  if (!salonData.telefonoContacto) {
    errors.push('El teléfono de contacto es requerido')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// === HELPERS PARA FORMULARIOS ===

export const prepareSalonDataForSubmit = (formData) => {
  // Preparar datos para envío al backend
  const salonData = {
    // Información básica
    nombre: formData.nombre.trim(),
    descripcion: formData.descripcion.trim(),
    direccion: formData.direccion.trim(),
    ciudad: formData.ciudad,
    
    // Capacidad y precios
    capacidadMinima: parseInt(formData.capacidadMinima),
    capacidadMaxima: parseInt(formData.capacidadMaxima),
    modeloPrecio: formData.modeloPrecio,
    precioBase: formData.modeloPrecio === 'personalizado' ? null : parseFloat(formData.precioBase),
    
    // Contacto
    telefonoContacto: formData.telefonoContacto,
    emailContacto: formData.emailContacto || null,
    whatsapp: formData.whatsapp || null,
    
    // Servicios
    servicios: formData.servicios || [],
    
    // Metadatos
    slug: generateSlug(formData.nombre),
    destacado: false,
    activo: true
  }
  
  // Limpiar campos vacíos
  Object.keys(salonData).forEach(key => {
    if (salonData[key] === '' || salonData[key] === null || salonData[key] === undefined) {
      delete salonData[key]
    }
  })
  
  return salonData
}

// === HELPERS INTERNOS ===

const generateSlug = (nombre) => {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .replace(/^-|-$/g, '') // Quitar guiones al inicio/final
}

// === BUSCAR SALONES DISPONIBLES ===

export const checkSalonAvailability = async (salonId, fecha) => {
  try {
    const response = await get(`/api/salones/${salonId}/disponibilidad?fecha=${fecha}`)
    return response.data.data
  } catch (error) {
    console.error('Error checking salon availability:', error)
    throw error
  }
}

// === GESTIÓN DE VISIBILIDAD ===

export const toggleSalonVisibility = async (salonId, visible) => {
  try {
    const response = await put(`/api/salones/${salonId}/visibilidad`, { activo: visible })
    return response.data.data
  } catch (error) {
    console.error('Error toggling salon visibility:', error)
    throw error
  }
}