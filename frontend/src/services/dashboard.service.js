import { get } from '@/services/api.js'
import { API_ENDPOINTS } from '@/utils/constants.js'

// === DASHBOARD PROVEEDOR ===

export const getDashboardProveedor = async () => {
  try {
    const response = await get(API_ENDPOINTS.CONSULTAS.DASHBOARD)
    return response.data.data
  } catch (error) {
    console.error('Error getting dashboard proveedor:', error)
    throw error
  }
}

export const getEstadisticasConsultas = async (filtros = {}) => {
  try {
    const params = new URLSearchParams()
    if (filtros.periodo) params.append('periodo', filtros.periodo)
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)
    
    const queryString = params.toString()
    const url = queryString ? `${API_ENDPOINTS.CONSULTAS.STATS}?${queryString}` : API_ENDPOINTS.CONSULTAS.STATS
    
    const response = await get(url)
    return response.data.data
  } catch (error) {
    console.error('Error getting estadisticas consultas:', error)
    throw error
  }
}

// === DASHBOARD EVENTOS ===

export const getDashboardEventos = async () => {
  try {
    const response = await get(API_ENDPOINTS.EVENTOS.DASHBOARD)
    return response.data.data
  } catch (error) {
    console.error('Error getting dashboard eventos:', error)
    throw error
  }
}

export const getEstadisticasEventos = async (filtros = {}) => {
  try {
    const params = new URLSearchParams()
    if (filtros.periodo) params.append('periodo', filtros.periodo)
    if (filtros.estado) params.append('estado', filtros.estado)
    
    const queryString = params.toString()
    const url = queryString ? `${API_ENDPOINTS.EVENTOS.STATS}?${queryString}` : API_ENDPOINTS.EVENTOS.STATS
    
    const response = await get(url)
    return response.data.data
  } catch (error) {
    console.error('Error getting estadisticas eventos:', error)
    throw error
  }
}

// === DASHBOARD RESEÑAS ===

export const getDashboardResenas = async () => {
  try {
    const response = await get(API_ENDPOINTS.RESENAS.DASHBOARD)
    return response.data.data
  } catch (error) {
    console.error('Error getting dashboard resenas:', error)
    throw error
  }
}

// === DASHBOARD ADMIN ===

export const getDashboardAdmin = async () => {
  try {
    // Obtener datos de múltiples endpoints para el admin
    const [consultasStats, eventosStats, resenasStats, salonesStats] = await Promise.all([
      getEstadisticasConsultas({ periodo: 'mes' }),
      getEstadisticasEventos({ periodo: 'mes' }),
      getDashboardResenas(),
      getEstadisticasSalones()
    ])
    
    return {
      consultas: consultasStats,
      eventos: eventosStats,
      resenas: resenasStats,
      salones: salonesStats
    }
  } catch (error) {
    console.error('Error getting dashboard admin:', error)
    throw error
  }
}

export const getEstadisticasSalones = async (filtros = {}) => {
  try {
    const params = new URLSearchParams()
    if (filtros.periodo) params.append('periodo', filtros.periodo)
    if (filtros.ciudad) params.append('ciudad', filtros.ciudad)
    if (filtros.estado) params.append('estado', filtros.estado)
    
    const queryString = params.toString()
    // Usando endpoint genérico de salones con stats
    const url = queryString ? `/api/salones/stats?${queryString}` : '/api/salones/stats'
    
    const response = await get(url)
    return response.data.data
  } catch (error) {
    console.error('Error getting estadisticas salones:', error)
    throw error
  }
}

// === ACTIVIDAD RECIENTE ===

export const getActividadReciente = async (limite = 10) => {
  try {
    const response = await get(`/api/actividad/reciente?limite=${limite}`)
    return response.data.data
  } catch (error) {
    console.error('Error getting actividad reciente:', error)
    // Si no existe el endpoint, devolver array vacío
    return []
  }
}

// === DATOS COMBINADOS PARA DASHBOARD ===

export const getDashboardCompleto = async (tipoUsuario = 'proveedor') => {
  try {
    let dashboardData = {}
    
    switch (tipoUsuario) {
      case 'admin':
        dashboardData = await getDashboardAdmin()
        break
        
      case 'proveedor':
        const [consultasData, eventosData, resenasData, actividadData] = await Promise.all([
          getDashboardProveedor(),
          getDashboardEventos(),
          getDashboardResenas(),
          getActividadReciente(5)
        ])
        
        dashboardData = {
          consultas: consultasData,
          eventos: eventosData,
          resenas: resenasData,
          actividadReciente: actividadData
        }
        break
        
      case 'cliente':
        // Para cliente, datos más limitados
        const actividadCliente = await getActividadReciente(10)
        dashboardData = {
          actividadReciente: actividadCliente
        }
        break
        
      default:
        throw new Error('Tipo de usuario no válido')
    }
    
    return dashboardData
  } catch (error) {
    console.error('Error getting dashboard completo:', error)
    throw error
  }
}

// === MÉTRICAS RÁPIDAS ===

export const getMetricasRapidas = async () => {
  try {
    const response = await get('/api/dashboard/metricas')
    return response.data.data
  } catch (error) {
    console.error('Error getting metricas rapidas:', error)
    // Devolver métricas por defecto si falla
    return {
      totalSalones: 0,
      totalConsultas: 0,
      totalEventos: 0,
      promedioCalificacion: 0
    }
  }
}

// === NOTIFICACIONES DASHBOARD ===

export const getNotificacionesDashboard = async () => {
  try {
    const response = await get('/api/notificaciones/dashboard')
    return response.data.data
  } catch (error) {
    console.error('Error getting notificaciones dashboard:', error)
    return []
  }
}

// === ESTADÍSTICAS POR PERÍODO ===

export const getEstadisticasPeriodo = async (tipoUsuario, periodo = 'mes') => {
  try {
    const params = new URLSearchParams()
    params.append('periodo', periodo)
    params.append('tipoUsuario', tipoUsuario)
    
    const response = await get(`/api/dashboard/estadisticas?${params.toString()}`)
    return response.data.data
  } catch (error) {
    console.error('Error getting estadisticas periodo:', error)
    throw error
  }
}