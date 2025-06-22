import { useBusquedaStore } from '@/stores/busqueda.store.js'
import * as busquedaService from '@/services/busqueda.service.js'
import { debounce } from '@/utils/helpers.js'

export const useBusqueda = () => {
  const busquedaStore = useBusquedaStore()

  // === BÚSQUEDA PRINCIPAL ===
  const buscarSalones = async (resetPage = true) => {
    if (resetPage) {
      busquedaStore.setPage(1)
    }
    
    busquedaStore.setLoading(true)
    busquedaStore.clearError()
    
    try {
      const criterios = { ...busquedaStore.filtros }
      const paginacion = {
        page: busquedaStore.pagination.page,
        limit: busquedaStore.pagination.limit
      }
      
      const resultado = await busquedaService.buscarSalones(criterios, paginacion)
      
      if (resetPage) {
        busquedaStore.setResultados(resultado)
      } else {
        // Cargar más resultados (append)
        busquedaStore.addResultados(resultado.salones)
        busquedaStore.pagination.page = resultado.pagination.page
        busquedaStore.pagination.totalPages = resultado.pagination.totalPages
      }
      
      // Agregar al historial si hay texto de búsqueda
      if (criterios.texto) {
        busquedaStore.addToHistorial(criterios.texto)
      }
      
      return resultado
    } catch (error) {
      const message = error.response?.data?.message || 'Error al buscar salones'
      busquedaStore.setError(message)
      throw new Error(message)
    } finally {
      busquedaStore.setLoading(false)
    }
  }

  // === BÚSQUEDA CON DEBOUNCE ===
  const buscarConDebounce = debounce(buscarSalones, 500)

  // === CARGAR MÁS RESULTADOS ===
  const cargarMasResultados = async () => {
    if (busquedaStore.pagination.page >= busquedaStore.pagination.totalPages) {
      return false // No hay más páginas
    }
    
    busquedaStore.setPage(busquedaStore.pagination.page + 1)
    await buscarSalones(false) // No resetear página
    return true
  }

  // === AUTOCOMPLETADO ===
  const buscarSugerencias = async (texto) => {
    if (!texto || texto.length < 2) {
      busquedaStore.clearSugerencias()
      return
    }
    
    try {
      const sugerencias = await busquedaService.getAutocompletado(texto)
      busquedaStore.setSugerencias(sugerencias)
      return sugerencias
    } catch (error) {
      console.error('Error getting sugerencias:', error)
      busquedaStore.clearSugerencias()
    }
  }

  const buscarSugerenciasDebounce = debounce(buscarSugerencias, 300)

  // === FILTROS ===
  const aplicarFiltro = async (key, value) => {
    busquedaStore.updateFiltro(key, value)
    await buscarSalones()
  }

  const aplicarFiltros = async (filtros) => {
    busquedaStore.updateFiltros(filtros)
    await buscarSalones()
  }

  const limpiarFiltros = async () => {
    busquedaStore.clearFiltros()
    await buscarSalones()
  }

  // === CARGAR OPCIONES ===
  const cargarOpcionesFiltros = async () => {
    try {
      const opciones = await busquedaService.getOpcionesFiltros()
      busquedaStore.setOpcionesFiltros(opciones)
      return opciones
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  // === BÚSQUEDA RÁPIDA ===
  const busquedaRapida = async (criterios) => {
    busquedaStore.setLoading(true)
    busquedaStore.clearError()
    
    try {
      const resultado = await busquedaService.busquedaRapida(criterios)
      busquedaStore.setResultados(resultado)
      return resultado
    } catch (error) {
      const message = error.response?.data?.message || 'Error en búsqueda rápida'
      busquedaStore.setError(message)
      throw new Error(message)
    } finally {
      busquedaStore.setLoading(false)
    }
  }

  return {
    // Estado del store
    resultados: busquedaStore.resultados,
    loading: busquedaStore.loading,
    error: busquedaStore.error,
    filtros: busquedaStore.filtros,
    pagination: busquedaStore.pagination,
    opcionesFiltros: busquedaStore.opcionesFiltros,
    historial: busquedaStore.historial,
    sugerencias: busquedaStore.sugerencias,
    
    // Getters
    hasResultados: busquedaStore.hasResultados,
    hasHistorial: busquedaStore.hasHistorial,
    hasSugerencias: busquedaStore.hasSugerencias,
    filtrosActivos: busquedaStore.filtrosActivos,
    
    // Acciones
    buscarSalones,
    buscarConDebounce,
    cargarMasResultados,
    buscarSugerencias,
    buscarSugerenciasDebounce,
    aplicarFiltro,
    aplicarFiltros,
    limpiarFiltros,
    cargarOpcionesFiltros,
    busquedaRapida,
    
    // Acciones del store
    clearResultados: busquedaStore.clearResultados,
    clearError: busquedaStore.clearError,
    clearHistorial: busquedaStore.clearHistorial
  }
}