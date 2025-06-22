<template>
  <div v-if="totalPages > 1" class="pagination">
    <!-- Información de resultados -->
    <div class="pagination-info">
      {{ paginationInfo }}
    </div>

    <!-- Controles de paginación -->
    <div class="pagination-controls">
      <!-- Botón primera página -->
      <button
        v-if="showFirstLast && currentPage > 2"
        @click="goToFirst"
        :disabled="!hasPrevious"
        class="pagination-btn"
        title="Primera página"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      <!-- Botón anterior -->
      <button
        @click="goToPrevious"
        :disabled="!hasPrevious"
        class="pagination-btn"
        title="Página anterior"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Números de página -->
      <div class="pagination-numbers">
        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            @click="goToPage(page)"
            :class="[
              'pagination-number',
              page === currentPage ? 'pagination-current' : 'pagination-regular'
            ]"
          >
            {{ page }}
          </button>
          <span
            v-else
            class="pagination-ellipsis"
          >
            ...
          </span>
        </template>
      </div>

      <!-- Botón siguiente -->
      <button
        @click="goToNext"
        :disabled="!hasNext"
        class="pagination-btn"
        title="Página siguiente"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Botón última página -->
      <button
        v-if="showFirstLast && currentPage < totalPages - 1"
        @click="goToLast"
        :disabled="!hasNext"
        class="pagination-btn"
        title="Última página"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePagination } from '@/composables/usePagination.js'

// Props
const props = defineProps({
  pagination: {
    type: Object,
    required: true,
    validator: (value) => {
      return value.page && value.totalPages && value.total !== undefined
    }
  },
  showFirstLast: {
    type: Boolean,
    default: true
  }
})

// Events
const emit = defineEmits(['page-change'])

// Use pagination composable
const {
  currentPage,
  totalPages,
  total,
  hasPrevious,
  hasNext,
  visiblePages,
  paginationInfo,
  goToPage,
  goToNext,
  goToPrevious,
  goToFirst,
  goToLast
} = usePagination(
  computed(() => props.pagination),
  (page) => emit('page-change', page)
)
</script>

<style>
@import './ui.css';
</style>