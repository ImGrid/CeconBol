import { useBusquedaStore } from '@/stores/busqueda.store.js'
import { computed } from 'vue'

/**
 * Composable simplificado para búsqueda - Wrapper limpio del store
 * CORREGIDO: Ahora usa los métodos de API del store
 */
export const useBusqueda = () => {
  const busquedaStore = useBusquedaStore()

  // === MÉTODOS DE BÚSQUEDA (Ahora conectados correctamente) ===
  
  const buscarSalones = async (resetPage = true) => {
    return await busquedaStore.buscarSalones(resetPage)
  }

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

  // === AUTOCOMPLETADO ===
  
  const buscarSugerencias = async (texto) => {
    return await busquedaStore.buscarSugerencias(texto)
  }

  // === CONTENIDO DESTACADO ===

  const obtenerSalonesPopulares = async (limite = 8) => {
    return await busquedaStore.obtenerSalonesPopulares(limite)
  }

  const obtenerSalonesDestacados = async (limite = 6) => {
    return await busquedaStore.obtenerSalonesDestacados(limite)
  }

  // === FILTROS ===

  const cargarOpcionesFiltros = async () => {
    return await busquedaStore.cargarOpcionesFiltros()
  }

  // === HELPERS DE FILTROS ===

  const updateFiltro = (key, value) => {
    busquedaStore.updateFiltro(key, value)
  }

  const clearFiltro = (key) => {
    busquedaStore.updateFiltro(key, key === 'ordenarPor' ? 'relevancia' : null)
  }

  // === PAGINACIÓN ===

  const cambiarPagina = async (page) => {
    busquedaStore.setPage(page)
    return await buscarSalones(false) // No resetear, solo cambiar página
  }

  // === COMPUTED PROPERTIES (acceso directo al store) ===

  const canLoadMore = computed(() => {
    const { page, totalPages } = busquedaStore.pagination
    return page < totalPages && !busquedaStore.loading
  })

  const hasActiveFilters = computed(() => {
    return busquedaStore.filtrosActivos
  })

  const searchSummary = computed(() => {
    const { total } = busquedaStore.pagination
    const { texto, ciudad } = busquedaStore.filtros
    
    let summary = `${total} ${total === 1 ? 'salón encontrado' : 'salones encontrados'}`
    
    if (texto) {
      summary += ` para "${texto}"`
    }
    
    if (ciudad) {
      summary += ` en ${ciudad}`
    }
    
    return summary
  })

  return {
    // Estado del store (readonly)
    resultados: computed(() => busquedaStore.resultados),
    loading: computed(() => busquedaStore.loading),
    error: computed(() => busquedaStore.error),
    filtros: busquedaStore.filtros, // Reactive object
    pagination: computed(() => busquedaStore.pagination),
    historial: computed(() => busquedaStore.historial),
    sugerencias: computed(() => busquedaStore.sugerencias),
    opcionesFiltros: computed(() => busquedaStore.opcionesFiltros),
    
    // Getters computed
    hasResultados: computed(() => busquedaStore.hasResultados),
    hasHistorial: computed(() => busquedaStore.hasHistorial),
    hasSugerencias: computed(() => busquedaStore.hasSugerencias),
    canLoadMore,
    hasActiveFilters,
    searchSummary,
    
    // Métodos de búsqueda principales
    buscarSalones,
    cargarMasResultados,
    aplicarFiltros,
    limpiarFiltros,
    
    // Autocompletado
    buscarSugerencias,
    
    // Contenido destacado
    obtenerSalonesPopulares,
    obtenerSalonesDestacados,
    
    // Gestión de filtros
    updateFiltro,
    clearFiltro,
    cargarOpcionesFiltros,
    
    // Paginación
    cambiarPagina,
    
    // Acciones directas del store (para casos específicos)
    clearResultados: busquedaStore.clearResultados,
    clearError: busquedaStore.clearError,
    clearHistorial: busquedaStore.clearHistorial,
    clearSugerencias: busquedaStore.clearSugerencias
  }
}