import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSalonesStore = defineStore('salones', () => {
  // === ESTADO ===
  const salones = ref([])
  const salonActual = ref(null)
  const salonesPopulares = ref([])
  const salonesDestacados = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Paginación
  const pagination = ref({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

  // === GETTERS ===
  const hasSalones = computed(() => salones.value.length > 0)
  const hasPopulares = computed(() => salonesPopulares.value.length > 0)
  const hasDestacados = computed(() => salonesDestacados.value.length > 0)

  // === ACCIONES ===
  
  // Establecer salones
  const setSalones = (data) => {
    salones.value = data.salones || data
    if (data.pagination) {
      pagination.value = data.pagination
    }
    error.value = null
  }

  // Establecer salón actual
  const setSalonActual = (salon) => {
    salonActual.value = salon
    error.value = null
  }

  // Establecer salones populares
  const setSalonesPopulares = (data) => {
    salonesPopulares.value = data
    error.value = null
  }

  // Establecer salones destacados
  const setSalonesDestacados = (data) => {
    salonesDestacados.value = data
    error.value = null
  }

  // Agregar salones (para cargar más)
  const addSalones = (nuevosSalones) => {
    salones.value = [...salones.value, ...nuevosSalones]
  }

  // Actualizar salón existente
  const updateSalon = (salonActualizado) => {
    const index = salones.value.findIndex(s => s.id === salonActualizado.id)
    if (index !== -1) {
      salones.value[index] = salonActualizado
    }
    
    // Actualizar salón actual si es el mismo
    if (salonActual.value && salonActual.value.id === salonActualizado.id) {
      salonActual.value = salonActualizado
    }
  }

  // Limpiar datos
  const clearSalones = () => {
    salones.value = []
    pagination.value = {
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    }
  }

  const clearSalonActual = () => {
    salonActual.value = null
  }

  // Estados de carga y error
  const setLoading = (isLoading) => {
    loading.value = isLoading
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
    loading.value = false
  }

  // Buscar salón por ID en el estado actual
  const findSalonById = (id) => {
    return salones.value.find(salon => salon.id === id) || null
  }

  // Obtener salones por ciudad
  const getSalonesByCiudad = (ciudad) => {
    return salones.value.filter(salon => salon.ciudad === ciudad)
  }

  return {
    // Estado
    salones,
    salonActual,
    salonesPopulares,
    salonesDestacados,
    loading,
    error,
    pagination,
    
    // Getters
    hasSalones,
    hasPopulares,
    hasDestacados,
    
    // Acciones
    setSalones,
    setSalonActual,
    setSalonesPopulares,
    setSalonesDestacados,
    addSalones,
    updateSalon,
    clearSalones,
    clearSalonActual,
    setLoading,
    setError,
    findSalonById,
    getSalonesByCiudad
  }
})