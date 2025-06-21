/**
 * Modelo de Tipos de Eventos
 * Datos maestros: quinceañeros, bodas, cumpleaños, etc.
 */

const mongoose = require('mongoose');

const eventTypeSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'Máximo 100 caracteres']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'Máximo 500 caracteres']
  },
  icono: {
    type: String,
    trim: true,
    default: 'calendar'
  },
  duracionTipicaHoras: {
    type: Number,
    min: [1, 'Mínimo 1 hora'],
    max: [24, 'Máximo 24 horas'],
    default: 6
  },
  activo: {
    type: Boolean,
    default: true
  },
  ordenVisualizacion: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Índices
eventTypeSchema.index({ activo: 1, ordenVisualizacion: 1 });
eventTypeSchema.index({ nombre: 'text' });

// Middleware para generar slug automáticamente
eventTypeSchema.pre('save', function(next) {
  if (this.isModified('nombre') && !this.slug) {
    this.slug = this.nombre
      .toLowerCase()
      .replace(/[^a-zA-Z0-9áéíóúñ\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Método estático para obtener tipos activos
eventTypeSchema.statics.obtenerTiposActivos = function() {
  return this.find({ activo: true }).sort({ ordenVisualizacion: 1, nombre: 1 });
};

// Método para obtener datos básicos
eventTypeSchema.methods.getDatosBasicos = function() {
  return {
    id: this._id,
    nombre: this.nombre,
    slug: this.slug,
    descripcion: this.descripcion,
    icono: this.icono,
    duracionTipicaHoras: this.duracionTipicaHoras
  };
};

module.exports = mongoose.model('EventType', eventTypeSchema);