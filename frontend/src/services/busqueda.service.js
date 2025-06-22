import { get, post } from '@/services/api.js'
import { API_ENDPOINTS } from '@/utils/constants.js'

// === BÚSQUEDA AVANZADA ===

export const buscarSalones = async (criterios = {}, paginacion = {}) => {
  try {
    const params = new URLSearchParams()
    
    // Criterios de búsqueda
    if (criterios.texto) params.append('q', criterios.texto)
    if (criterios.ciudad) params.append('ciudad', criterios.ciudad)
    if (criterios.capacidadMinima) params.append('capacidadMinima', criterios.capacidadMinima)
    if (criterios.capacidadMaxima) params.append('capacidadMaxima', criterios.capacidadMaxima)
    if (criterios.precioMin) params.append('precioMin', criterios.precioMin)
    if (criterios.precioMax) params.append('precioMax', criterios.precioMax)
    if (criterios.calificacion) params.append('calificacion', criterios.calificacion)
    if (criterios.ordenarPor) params.append('ordenarPor', criterios.ordenarPor)
    if (criterios.orden) params.append('orden', criterios.orden)
    
    // Paginación
    if (paginacion.page) params.append('page', paginacion.page)
    if (paginacion.limit) params.append('limit', paginacion.limit)
    
    const queryString = params.toString()
    const url = queryString ? `${API_ENDPOINTS.BUSQUEDA.SALONES}?${queryString}` : API_ENDPOINTS.BUSQUEDA.SALONES
    
    const response = await get(url)
    return response.data.data
  } catch (error) {
    console.error('Error in buscar salones:', error)
    throw error
  }
}

// === SUGERENCIAS Y DESTACADOS ===

export const getSugerencias = async (criterios = {}) => {
  try {
    const params = new URLSearchParams()
    if (criterios.capacidad) params.append('capacidad', criterios.capacidad)
    if (criterios.ciudad) params.append('ciudad', criterios.ciudad)
    if (criterios.presupuesto) params.append('presupuesto', criterios.presupuesto)
    
    const queryString = params.toString()
    const url = queryString ? `${API_ENDPOINTS.BUSQUEDA.SUGERENCIAS}?${queryString}` : API_ENDPOINTS.BUSQUEDA.SUGERENCIAS
    
    const response = await get(url)
    return response.data.data
  } catch (error) {
    console.error('Error getting sugerencias:', error)
    throw error
  }
}

export const getSalonesPopulares = async (limite = 8) => {
  try {
    const response = await get(`${API_ENDPOINTS.BUSQUEDA.POPULARES}?limite=${limite}`)
    return response.data.data
  } catch (error) {
    console.error('Error getting salones populares:', error)
    throw error
  }
}

export const getSalonesDestacados = async (limite = 6) => {
  try {
    const response = await get(`${API_ENDPOINTS.BUSQUEDA.DESTACADOS}?limite=${limite}`)
    return response.data.data
  } catch (error) {
    console.error('Error getting salones destacados:', error)
    throw error
  }
}

// === FILTROS Y OPCIONES ===

export const getOpcionesFiltros = async () => {
  try {
    const response = await get(API_ENDPOINTS.BUSQUEDA.FILTROS)
    return response.data.data
  } catch (error) {
    console.error('Error getting opciones filtros:', error)
    throw error
  }
}

export const getAutocompletado = async (texto, limite = 5) => {
  try {
    const response = await get(`${API_ENDPOINTS.BUSQUEDA.AUTOCOMPLETADO}?q=${texto}&limite=${limite}`)
    return response.data.data
  } catch (error) {
    console.error('Error getting autocompletado:', error)
    throw error
  }
}

// === BÚSQUEDA RÁPIDA ===

export const busquedaRapida = async (criterios) => {
  try {
    const response = await post(`${API_ENDPOINTS.BUSQUEDA.SALONES}`, criterios)
    return response.data.data
  } catch (error) {
    console.error('Error in busqueda rapida:', error)
    throw error
  }
}