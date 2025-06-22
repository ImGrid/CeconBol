import { get } from '@/services/api.js'
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
    
    const queryString = params.toString()
    const url = queryString ? `${API_ENDPOINTS.SALONES.MIS_SALONES}?${queryString}` : API_ENDPOINTS.SALONES.MIS_SALONES
    
    const response = await get(url)
    return response.data.data
  } catch (error) {
    console.error('Error getting mis salones:', error)
    throw error
  }
}