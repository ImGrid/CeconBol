import { computed } from 'vue'

export const usePagination = (pagination, onPageChange) => {
  // === COMPUTED ===
  
  const currentPage = computed(() => pagination.value.page || 1)
  const totalPages = computed(() => pagination.value.totalPages || 1)
  const total = computed(() => pagination.value.total || 0)
  const limit = computed(() => pagination.value.limit || 12)
  
  const hasPrevious = computed(() => currentPage.value > 1)
  const hasNext = computed(() => currentPage.value < totalPages.value)
  
  const startItem = computed(() => {
    return ((currentPage.value - 1) * limit.value) + 1
  })
  
  const endItem = computed(() => {
    return Math.min(currentPage.value * limit.value, total.value)
  })
  
  // Páginas para mostrar en la paginación (ej: 1, 2, 3, ..., 10)
  const visiblePages = computed(() => {
    const pages = []
    const totalPagesCount = totalPages.value
    const current = currentPage.value
    
    if (totalPagesCount <= 7) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPagesCount; i++) {
        pages.push(i)
      }
    } else {
      // Lógica para muchas páginas
      if (current <= 4) {
        // Al inicio
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPagesCount)
      } else if (current >= totalPagesCount - 3) {
        // Al final
        pages.push(1)
        pages.push('...')
        for (let i = totalPagesCount - 4; i <= totalPagesCount; i++) {
          pages.push(i)
        }
      } else {
        // En el medio
        pages.push(1)
        pages.push('...')
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPagesCount)
      }
    }
    
    return pages
  })

  // === MÉTODOS ===
  
  const goToPage = (page) => {
    if (page < 1 || page > totalPages.value || page === currentPage.value) {
      return
    }
    
    if (onPageChange) {
      onPageChange(page)
    }
  }
  
  const goToNext = () => {
    if (hasNext.value) {
      goToPage(currentPage.value + 1)
    }
  }
  
  const goToPrevious = () => {
    if (hasPrevious.value) {
      goToPage(currentPage.value - 1)
    }
  }
  
  const goToFirst = () => {
    goToPage(1)
  }
  
  const goToLast = () => {
    goToPage(totalPages.value)
  }
  
  // Información de paginación en texto
  const paginationInfo = computed(() => {
    if (total.value === 0) {
      return 'No hay resultados'
    }
    
    if (total.value === 1) {
      return '1 resultado'
    }
    
    return `${startItem.value}-${endItem.value} de ${total.value} resultados`
  })

  return {
    // Computed
    currentPage,
    totalPages,
    total,
    limit,
    hasPrevious,
    hasNext,
    startItem,
    endItem,
    visiblePages,
    paginationInfo,
    
    // Métodos
    goToPage,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast
  }
}