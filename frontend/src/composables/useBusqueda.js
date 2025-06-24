import { useBusquedaStore } from '@/stores/busqueda.store.js'
import { debounce } from '@/utils/helpers.js'

/**
 * Composable simplificado para búsqueda - Wrapper del store sin duplicar lógica
 */
export const useBusqueda = () => {
  const busquedaStore = useBusquedaStore()

  // === WRAPPER SIMPLE DEL STORE ===
  const buscarSalones = async (resetPage = true) => {
    return await busquedaStore.buscarSalones(resetPage)
  }

  const buscarConDebounce = debounce(buscarSalones, 500)

  const cargarMasResultados = async () => {
    return await busquedaStore.cargarMasResultados()
  }

  const aplicarFiltros = async (filtros) => {
    busquedaStore.updateFiltros(filtros)
    return await buscarSalones()
  }

  const limpiarFiltros = async () => {
    busquedaStore.clearFiltros()
    return await buscarSalones()
  }

  // === AUTOCOMPLETADO SIMPLE ===
  const buscarSugerencias = async (texto) => {
    return await busquedaStore.buscarSugerencias(texto)
  }

  const buscarSugerenciasDebounce = debounce(buscarSugerencias, 300)

  return {
    // Estado del store (readonly)
    resultados: busquedaStore.resultados,
    loading: busquedaStore.loading,
    error: busquedaStore.error,
    filtros: busquedaStore.filtros,
    pagination: busquedaStore.pagination,
    historial: busquedaStore.historial,
    sugerencias: busquedaStore.sugerencias,
    
    // Getters del store
    hasResultados: busquedaStore.hasResultados,
    hasHistorial: busquedaStore.hasHistorial,
    hasSugerencias: busquedaStore.hasSugerencias,
    
    // Métodos wrapper
    buscarSalones,
    buscarConDebounce,
    cargarMasResultados,
    aplicarFiltros,
    limpiarFiltros,
    buscarSugerencias,
    buscarSugerenciasDebounce,
    
    // Acciones directas del store
    clearResultados: busquedaStore.clearResultados,
    clearError: busquedaStore.clearError,
    clearHistorial: busquedaStore.clearHistorial
  }
}