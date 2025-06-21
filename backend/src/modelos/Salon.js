/**
 * Modelo de Salones de Eventos
 * Producto principal del marketplace
 */

const mongoose = require('mongoose');

// Subdocumento para fotos
const fotoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  textoAlternativo: {
    type: String,
    default: ''
  },
  esPrincipal: {
    type: Boolean,
    default: false
  },
  ordenVisualizacion: {
    type: Number,
    default: 0
  }
}, { _id: true });

// Subdocumento para servicios
const servicioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  incluido: {
    type: Boolean,
    default: true
  },
  costoAdicional: {
    type: Number,
    default: 0,
    min: 0
  },
  tipoCosto: {
    type: String,
    enum: ['fijo', 'por_persona', 'por_hora'],
    default: 'fijo'
  },
  categoriaServicio: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory'
  }
}, { _id: true });

// Subdocumento para especialización en tipos de eventos
const especializacionEventoSchema = new mongoose.Schema({
  tipoEvento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventType',
    required: true
  },
  nivelEspecializacion: {
    type: String,
    enum: ['basico', 'preferido', 'especializado'],
    default: 'basico'
  }
}, { _id: false });

const venueSchema = new mongoose.Schema({
  propietario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El propietario es obligatorio']
  },
  
  // Información básica
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [100, 'Máximo 100 caracteres']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    maxlength: [1000, 'Máximo 1000 caracteres']
  },
  
  // Ubicación
  direccion: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
    trim: true
  },
  ciudad: {
    type: String,
    enum: ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Potosí', 'Oruro'],
    required: [true, 'La ciudad es obligatoria']
  },
  distrito: {
    type: String,
    trim: true
  },
  coordenadas: {
    latitud: {
      type: Number,
      min: [-90, 'Latitud inválida'],
      max: [90, 'Latitud inválida']
    },
    longitud: {
      type: Number,
      min: [-180, 'Longitud inválida'],
      max: [180, 'Longitud inválida']
    }
  },
  
  // Capacidad
  capacidadMinima: {
    type: Number,
    required: [true, 'Capacidad mínima es obligatoria'],
    min: [1, 'Mínimo 1 persona']
  },
  capacidadMaxima: {
    type: Number,
    required: [true, 'Capacidad máxima es obligatoria'],
    min: [1, 'Mínimo 1 persona']
  },
  
  // Precios
  precioBase: {
    type: Number,
    required: [true, 'Precio base es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  moneda: {
    type: String,
    default: 'BOB'
  },
  modeloPrecio: {
    type: String,
    enum: ['fijo', 'por_persona', 'personalizado'],
    default: 'fijo'
  },
  
  // Contacto
  telefonoContacto: {
    type: String,
    match: [/^\d{7,8}$/, 'Teléfono inválido']
  },
  whatsapp: {
    type: String,
    match: [/^\d{7,8}$/, 'WhatsApp inválido']
  },
  emailContacto: {
    type: String,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  
  // Multimedia y servicios (subdocumentos)
  fotos: [fotoSchema],
  servicios: [servicioSchema],
  especializacionesEvento: [especializacionEventoSchema],
  
  // Estado y configuración
  estado: {
    type: String,
    enum: ['borrador', 'pendiente', 'aprobado', 'rechazado', 'suspendido'],
    default: 'borrador'
  },
  destacado: {
    type: Boolean,
    default: false
  },
  
  // Estadísticas
  calificacionPromedio: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalResenas: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEventos: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Índices para búsquedas eficientes
venueSchema.index({ ciudad: 1, capacidadMaxima: 1, estado: 1 });
venueSchema.index({ 'coordenadas.latitud': 1, 'coordenadas.longitud': 1 });
venueSchema.index({ nombre: 'text', descripcion: 'text' });
venueSchema.index({ calificacionPromedio: -1, destacado: -1 });
venueSchema.index({ propietario: 1, estado: 1 });

// Middleware para generar slug
venueSchema.pre('save', function(next) {
  if (this.isModified('nombre') && !this.slug) {
    const baseSlug = this.nombre
      .toLowerCase()
      .replace(/[^a-zA-Z0-9áéíóúñ\s]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    this.slug = `${baseSlug}-${Date.now()}`;
  }
  next();
});

// Validación personalizada para capacidad
venueSchema.pre('save', function(next) {
  if (this.capacidadMinima > this.capacidadMaxima) {
    next(new Error('La capacidad mínima no puede ser mayor que la máxima'));
  }
  next();
});

// Método estático para buscar salones por filtros básicos
venueSchema.statics.buscarPorFiltros = function(filtros = {}) {
  const query = { estado: 'aprobado' };
  
  if (filtros.ciudad) query.ciudad = filtros.ciudad;
  if (filtros.capacidadMinima) query.capacidadMaxima = { $gte: filtros.capacidadMinima };
  if (filtros.precioMaximo) query.precioBase = { $lte: filtros.precioMaximo };
  
  return this.find(query)
    .populate('propietario', 'nombre apellido')
    .sort({ calificacionPromedio: -1, destacado: -1 });
};

// Método para obtener datos públicos del salón
venueSchema.methods.getDatosPublicos = function() {
  return {
    id: this._id,
    nombre: this.nombre,
    slug: this.slug,
    descripcion: this.descripcion,
    ciudad: this.ciudad,
    direccion: this.direccion,
    capacidadMinima: this.capacidadMinima,
    capacidadMaxima: this.capacidadMaxima,
    precioBase: this.precioBase,
    modeloPrecio: this.modeloPrecio,
    fotos: this.fotos,
    servicios: this.servicios.filter(s => s.incluido),
    calificacionPromedio: this.calificacionPromedio,
    totalResenas: this.totalResenas,
    destacado: this.destacado,
    fechaCreacion: this.createdAt
  };
};

// Virtual para URL del salón
venueSchema.virtual('urlSalon').get(function() {
  return `/salones/${this.slug}`;
});

module.exports = mongoose.model('Venue', venueSchema);