<template>
  <Card 
    variant="venue" 
    hover 
    clickable
    @click="goToDetail"
    class="salon-card"
  >
    <!-- Imagen del salón -->
    <div class="relative">
      <img 
        :src="salon.fotoPrincipal || '/images/placeholder-salon.jpg'"
        :alt="salon.nombre"
        class="card-venue-image"
        @error="handleImageError"
      />
      
      <!-- Badges en la imagen -->
      <div class="absolute flex flex-col space-y-2 top-3 left-3">
        <Badge v-if="salon.destacado" variant="premium" size="small">
          ⭐ Destacado
        </Badge>
        <Badge v-if="isPopular" variant="popular" size="small">
          🔥 Popular
        </Badge>
      </div>

      <!-- Precio destacado -->
      <div class="absolute bottom-3 right-3">
        <div class="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-sm">
          <span class="text-sm font-bold price-text">
            {{ formatPrice(salon.precioBase) }}
          </span>
          <span v-if="salon.modeloPrecio === 'por_persona'" class="text-xs text-gray-600">
            /persona
          </span>
        </div>
      </div>
    </div>

    <!-- Contenido de la tarjeta -->
    <div>
      <!-- Título y ubicación -->
      <div class="mb-3">
        <h3 class="card-venue-title line-clamp-2">
          {{ salon.nombre }}
        </h3>
        <p class="flex items-center text-sm text-gray-600">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ salon.ciudad }}
        </p>
      </div>

      <!-- Capacidad -->
      <div class="mb-3">
        <p class="flex items-center text-sm text-gray-700">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {{ formatCapacity(salon.capacidadMinima, salon.capacidadMaxima) }}
        </p>
      </div>

      <!-- Rating y reseñas -->
      <div class="mb-3">
        <div class="flex items-center space-x-2">
          <Rating 
            :value="salon.calificacionPromedio || 0" 
            :show-value="false"
            size="small"
          />
          <span class="text-sm text-gray-600">
            {{ formatRating(salon.calificacionPromedio) }}
          </span>
          <span v-if="salon.totalResenas > 0" class="text-sm text-gray-500">
            ({{ salon.totalResenas }} {{ salon.totalResenas === 1 ? 'reseña' : 'reseñas' }})
          </span>
        </div>
      </div>

      <!-- Descripción -->
      <p class="mb-4 card-description line-clamp-2">
        {{ salon.descripcion }}
      </p>

      <!-- Footer con botón -->
      <div class="card-footer">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <!-- Modelo de precio -->
            <Badge 
              v-if="salon.modeloPrecio === 'personalizado'" 
              variant="warning" 
              size="small"
            >
              Consultar
            </Badge>
          </div>
          
          <Button 
            variant="outline-primary" 
            size="small"
            @click.stop="goToDetail"
          >
            Ver Detalles
          </Button>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatPrice, formatCapacity } from '@/utils/helpers.js'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Rating from '@/components/ui/Rating.vue'

// Props
const props = defineProps({
  salon: {
    type: Object,
    required: true
  }
})

// Router
const router = useRouter()

// Computed
const isPopular = computed(() => {
  return props.salon.calificacionPromedio >= 4.5 && props.salon.totalResenas >= 10
})

// Métodos
const goToDetail = () => {
  if (props.salon.slug) {
    router.push(`/salones/${props.salon.slug}`)
  } else {
    router.push(`/salones/detail/${props.salon.id}`)
  }
}

const handleImageError = (event) => {
  event.target.src = '/images/placeholder-salon.jpg'
}

const formatRating = (rating) => {
  if (!rating) return '0.0'
  return rating.toFixed(1)
}
</script>

<style>
@import './salones.css';
</style>