<template>
  <div class="salon-details">
    <!-- Header con título y badges -->
    <div class="salon-header">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div class="flex-1">
          <h1 class="salon-title">
            {{ salon.nombre }}
          </h1>
          
          <div class="flex items-center space-x-4 mb-3">
            <!-- Ubicación -->
            <div class="salon-location">
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ salon.direccion }}, {{ salon.ciudad }}
            </div>
          </div>

          <!-- Rating y reseñas -->
          <div class="salon-rating">
            <div class="flex items-center space-x-2">
              <Rating 
                :value="salon.calificacionPromedio || 0"
                :show-value="false"
              />
              <span class="font-semibold text-gray-900">
                {{ formatRating(salon.calificacionPromedio) }}
              </span>
              <span v-if="salon.totalResenas > 0" class="text-gray-600">
                ({{ salon.totalResenas }} {{ salon.totalResenas === 1 ? 'reseña' : 'reseñas' }})
              </span>
            </div>
          </div>
        </div>

        <!-- Badges -->
        <div class="salon-badges">
          <Badge v-if="salon.destacado" variant="premium">
            ⭐ Destacado
          </Badge>
          <Badge v-if="isPopular" variant="popular">
            🔥 Popular
          </Badge>
        </div>
      </div>
    </div>

    <!-- Grid principal -->
    <div class="salon-main-grid">
      <!-- Columna principal (información) -->
      <div class="salon-content">
        
        <!-- Descripción -->
        <Card>
          <h2 class="text-xl font-semibold mb-4">Descripción</h2>
          <p class="text-gray-700 leading-relaxed">
            {{ salon.descripcion }}
          </p>
        </Card>

        <!-- Información básica -->
        <Card>
          <h2 class="text-xl font-semibold mb-4">Información del Salón</h2>
          
          <div class="salon-info-grid">
            <!-- Capacidad -->
            <div class="salon-info-item">
              <div class="salon-info-icon salon-info-icon-primary">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="salon-info-content">
                <h3>Capacidad</h3>
                <p>{{ formatCapacity(salon.capacidadMinima, salon.capacidadMaxima) }}</p>
              </div>
            </div>

            <!-- Precio -->
            <div class="salon-info-item">
              <div class="salon-info-icon salon-info-icon-secondary">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div class="salon-info-content">
                <h3>Precio Base</h3>
                <p class="text-brand-primary font-bold">
                  {{ salon.modeloPrecio === 'personalizado' ? 'Consultar' : formatPrice(salon.precioBase) }}
                  <span v-if="salon.modeloPrecio === 'por_persona'" class="text-sm text-gray-600 font-normal">
                    /persona
                  </span>
                </p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Servicios incluidos -->
        <Card v-if="serviciosIncluidos.length > 0">
          <h2 class="text-xl font-semibold mb-4">Servicios Incluidos</h2>
          
          <div class="salon-services-grid">
            <div 
              v-for="servicio in serviciosIncluidos" 
              :key="servicio.nombre"
              class="salon-service-item"
            >
              <svg class="salon-service-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="salon-service-text">{{ servicio.nombre }}</span>
            </div>
          </div>
        </Card>

        <!-- Servicios adicionales -->
        <Card v-if="serviciosAdicionales.length > 0">
          <h2 class="text-xl font-semibold mb-4">Servicios Adicionales</h2>
          
          <div class="salon-services-additional">
            <div 
              v-for="servicio in serviciosAdicionales" 
              :key="servicio.nombre"
              class="salon-service-additional-item"
            >
              <div class="salon-service-additional-info">
                <h4>{{ servicio.nombre }}</h4>
                <p v-if="servicio.descripcion">
                  {{ servicio.descripcion }}
                </p>
              </div>
              <div class="salon-service-additional-price">
                <span>
                  {{ formatPrice(servicio.costoAdicional) }}
                </span>
                <span v-if="servicio.tipoCosto !== 'fijo'" class="unit">
                  /{{ servicio.tipoCosto === 'por_persona' ? 'persona' : 'hora' }}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Sidebar (contacto y acciones) -->
      <div class="salon-sidebar">
        <div class="salon-sidebar-sticky">
          
          <!-- Card de contacto -->
          <Card>
            <h2 class="text-xl font-semibold mb-4">Contactar Salón</h2>
            
            <div class="salon-contact-card">
              <!-- Precio destacado -->
              <div class="salon-contact-price">
                <p class="salon-contact-price-label">Desde</p>
                <p class="salon-contact-price-amount">
                  {{ salon.modeloPrecio === 'personalizado' ? 'Consultar' : formatPrice(salon.precioBase) }}
                </p>
                <p v-if="salon.modeloPrecio === 'por_persona'" class="salon-contact-price-unit">
                  por persona
                </p>
              </div>

              <!-- Información de contacto -->
              <div v-if="hasContactInfo" class="salon-contact-info">
                <div v-if="salon.telefonoContacto" class="salon-contact-item">
                  <svg class="salon-contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span class="salon-contact-text">{{ formatPhone(salon.telefonoContacto) }}</span>
                </div>

                <div v-if="salon.whatsapp" class="salon-contact-item">
                  <span class="text-green-500">📱</span>
                  <span class="salon-contact-text">{{ formatPhone(salon.whatsapp) }}</span>
                </div>

                <div v-if="salon.emailContacto" class="salon-contact-item">
                  <svg class="salon-contact-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span class="salon-contact-email">{{ salon.emailContacto }}</span>
                </div>
              </div>

              <!-- Botón principal de contacto -->
              <Button 
                variant="primary" 
                full-width
                @click="$emit('contact-salon')"
              >
                Enviar Consulta
              </Button>

              <!-- Botón de WhatsApp si está disponible -->
              <Button 
                v-if="salon.whatsapp"
                variant="success" 
                full-width
                @click="contactWhatsApp"
              >
                <span class="mr-2">📱</span>
                WhatsApp
              </Button>
            </div>
          </Card>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatPrice, formatCapacity, formatPhone } from '@/utils/helpers.js'
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

// Events
defineEmits(['contact-salon'])

// Computed
const isPopular = computed(() => {
  return props.salon.calificacionPromedio >= 4.5 && props.salon.totalResenas >= 10
})

const serviciosIncluidos = computed(() => {
  return props.salon.servicios?.filter(s => s.incluido) || []
})

const serviciosAdicionales = computed(() => {
  return props.salon.servicios?.filter(s => !s.incluido) || []
})

const hasContactInfo = computed(() => {
  return props.salon.telefonoContacto || props.salon.whatsapp || props.salon.emailContacto
})

// Métodos
const formatRating = (rating) => {
  if (!rating) return '0.0'
  return rating.toFixed(1)
}

const contactWhatsApp = () => {
  const phone = props.salon.whatsapp.replace(/\D/g, '')
  const message = encodeURIComponent(`Hola! Estoy interesado en el salón "${props.salon.nombre}" para un evento. ¿Podrían darme más información?`)
  const whatsappUrl = `https://wa.me/591${phone}?text=${message}`
  window.open(whatsappUrl, '_blank')
}
</script>

<style>
@import './salones.css';
</style>