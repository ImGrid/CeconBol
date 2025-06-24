import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import * as busquedaService from '@/services/busqueda.service.js'
import { saveSearchHistory } from '@/utils/storage.js'

export const useBusquedaStore = defineStore('busqueda', () => {
  // === ESTADO ===
  const resultados = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Filtros aplicados
  const filtros = reactive({
    texto: '',
    ciudad: '',
    capacidadMinima: null,
    capacidadMaxima: null,
    precioMin: null,
    precioMax: null,
    calificacion: null,
    ordenarPor: 'relevancia',
    orden: 'desc'
  })
  
  // Paginación de resultados
  const pagination = ref({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  
  // Opciones disponibles para filtros
  const opcionesFiltros = ref({
    ciudades: [],
    capacidad: { minimo: 0, maximo: 1000 },
    precios: { minimo: 0, maximo: 50000 },
    ordenamiento: []
  })
  
  // Historial de búsquedas
  const historial = ref([])
  
  // Sugerencias de autocompletado
  const sugerencias = ref([])

  // === GETTERS ===
  const hasResultados = computed(() => resultados.value.length > 0)
  const hasHistorial = computed(() => historial.value.length > 0)
  const hasSugerencias = computed(() => sugerencias.value.length > 0)
  
  const filtrosActivos = computed(() => {
    return Object.entries(filtros).filter(([key, value]) => {
      if (key === 'ordenarPor' || key === 'orden') return false
      return value !== '' && value !== null && value !== undefined
    }).length > 0
  })
  
  const queryString = computed(() => {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.append(key, value)
      }
    })
    return params.toString()
  })

  // === ACCIONES DE ESTADO ===
  
  // Establecer resultados
  const setResultados = (data) => {
    resultados.value = data.salones || data
    if (data.pagination) {
      pagination.value = data.pagination
    }
    error.value = null
  }
  
  // Agregar más resultados (load more)
  const addResultados = (nuevosResultados) => {
    resultados.value = [...resultados.value, ...nuevosResultados]
  }
  
  // Actualizar filtros
  const updateFiltro = (key, value) => {
    filtros[key] = value
    
    // Reset page cuando cambian filtros
    if (key !== 'ordenarPor' && key !== 'orden') {
      pagination.value.page = 1
    }
  }
  
  // Actualizar múltiples filtros
  const updateFiltros = (nuevosFiltros) => {
    Object.assign(filtros, nuevosFiltros)
    pagination.value.page = 1
  }
  
  // Limpiar filtros
  const clearFiltros = () => {
    Object.assign(filtros, {
      texto: '',
      ciudad: '',
      capacidadMinima: null,
      capacidadMaxima: null,
      precioMin: null,
      precioMax: null,
      calificacion: null,
      ordenarPor: 'relevancia',
      orden: 'desc'
    })
    pagination.value.page = 1
  }
  
  // Establecer opciones de filtros
  const setOpcionesFiltros = (opciones) => {
    opcionesFiltros.value = opciones
  }
  
  // Gestión de historial
  const addToHistorial = (termino) => {
    if (!termino || termino.length < 2) return
    
    // Remover si ya existe
    const index = historial.value.indexOf(termino)
    if (index > -1) {
      historial.value.splice(index, 1)
    }
    
    // Agregar al inicio
    historial.value.unshift(termino)
    
    // Mantener solo los últimos 10
    if (historial.value.length > 10) {
      historial.value = historial.value.slice(0, 10)
    }

    // Guardar en localStorage
    saveSearchHistory(termino)
  }
  
  const clearHistorial = () => {
    historial.value = []
  }
  
  // Sugerencias
  const setSugerencias = (data) => {
    sugerencias.value = data
  }
  
  const clearSugerencias = () => {
    sugerencias.value = []
  }
  
  // Estados
  const setLoading = (isLoading) => {
    loading.value = isLoading
  }
  
  const setError = (errorMessage) => {
    error.value = errorMessage
    loading.value = false
  }
  
  const clearError = () => {
    error.value = null
  }
  
  // Limpiar resultados
  const clearResultados = () => {
    resultados.value = []
    pagination.value = {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    }
  }
  
  // Cambiar página
  const setPage = (page) => {
    pagination.value.page = page
  }

  // === 🔥 NUEVOS MÉTODOS DE API ===

  // Buscar salones (MÉTODO PRINCIPAL)
  const buscarSalones = async (resetPage = true) => {
    setLoading(true)
    clearError()

    try {
      if (resetPage) {
        pagination.value.page = 1
      }

      // Preparar criterios
      const criterios = {
        texto: filtros.texto || undefined,
        ciudad: filtros.ciudad || undefined,
        capacidadMinima: filtros.capacidadMinima || undefined,
        capacidadMaxima: filtros.capacidadMaxima || undefined,
        precioMin: filtros.precioMin || undefined,
        precioMax: filtros.precioMax || undefined,
        calificacion: filtros.calificacion || undefined,
        ordenarPor: filtros.ordenarPor || 'relevancia',
        orden: filtros.orden || 'desc'
      }

      // Limpiar valores undefined
      const criteriosLimpios = Object.fromEntries(
        Object.entries(criterios).filter(([_, value]) => value !== undefined)
      )

      const data = await busquedaService.buscarSalones(
        criteriosLimpios,
        {
          page: pagination.value.page,
          limit: pagination.value.limit
        }
      )

      setResultados(data)

      // Agregar al historial si hay texto de búsqueda
      if (filtros.texto && filtros.texto.trim()) {
        addToHistorial(filtros.texto.trim())
      }

      return data
    } catch (err) {
      console.error('Error en búsqueda:', err)
      setError(err.message || 'Error al buscar salones')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Cargar más resultados (paginación)
  const cargarMasResultados = async () => {
    if (loading.value || pagination.value.page >= pagination.value.totalPages) {
      return
    }

    setLoading(true)
    clearError()

    try {
      const nextPage = pagination.value.page + 1
      const criterios = {
        texto: filtros.texto || undefined,
        ciudad: filtros.ciudad || undefined,
        capacidadMinima: filtros.capacidadMinima || undefined,
        capacidadMaxima: filtros.capacidadMaxima || undefined,
        precioMin: filtros.precioMin || undefined,
        precioMax: filtros.precioMax || undefined,
        calificacion: filtros.calificacion || undefined,
        ordenarPor: filtros.ordenarPor || 'relevancia',
        orden: filtros.orden || 'desc'
      }

      const criteriosLimpios = Object.fromEntries(
        Object.entries(criterios).filter(([_, value]) => value !== undefined)
      )

      const data = await busquedaService.buscarSalones(
        criteriosLimpios,
        {
          page: nextPage,
          limit: pagination.value.limit
        }
      )

      // Agregar nuevos resultados
      addResultados(data.salones || data)
      
      // Actualizar paginación
      pagination.value = data.pagination

      return data
    } catch (err) {
      console.error('Error cargando más resultados:', err)
      setError(err.message || 'Error al cargar más resultados')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Buscar sugerencias de autocompletado
  const buscarSugerencias = async (texto) => {
    if (!texto || texto.length < 2) {
      clearSugerencias()
      return []
    }

    try {
      const data = await busquedaService.getAutocompletado(texto, 5)
      setSugerencias(data)
      return data
    } catch (err) {
      console.error('Error obteniendo sugerencias:', err)
      clearSugerencias()
      return []
    }
  }

  // Obtener salones populares
  const obtenerSalonesPopulares = async (limite = 8) => {
    try {
      const data = await busquedaService.getSalonesPopulares(limite)
      return data
    } catch (err) {
      console.error('Error obteniendo salones populares:', err)
      throw err
    }
  }

  // Obtener salones destacados
  const obtenerSalonesDestacados = async (limite = 6) => {
    try {
      const data = await busquedaService.getSalonesDestacados(limite)
      return data
    } catch (err) {
      console.error('Error obteniendo salones destacados:', err)
      throw err
    }
  }

  // Obtener opciones de filtros del servidor
  const cargarOpcionesFiltros = async () => {
    try {
      const data = await busquedaService.getOpcionesFiltros()
      setOpcionesFiltros(data)
      return data
    } catch (err) {
      console.error('Error cargando opciones de filtros:', err)
      throw err
    }
  }

  return {
    // Estado
    resultados,
    loading,
    error,
    filtros,
    pagination,
    opcionesFiltros,
    historial,
    sugerencias,
    
    // Getters
    hasResultados,
    hasHistorial,
    hasSugerencias,
    filtrosActivos,
    queryString,
    
    // Acciones de estado
    setResultados,
    addResultados,
    updateFiltro,
    updateFiltros,
    clearFiltros,
    setOpcionesFiltros,
    addToHistorial,
    clearHistorial,
    setSugerencias,
    clearSugerencias,
    setLoading,
    setError,
    clearError,
    clearResultados,
    setPage,

    // 🔥 Nuevos métodos de API
    buscarSalones,
    cargarMasResultados,
    buscarSugerencias,
    obtenerSalonesPopulares,
    obtenerSalonesDestacados,
    cargarOpcionesFiltros
  }
})