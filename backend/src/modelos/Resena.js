/**
 * Modelo de Reseñas
 * Sistema de calificaciones y comentarios para salones
 */

const mongoose = require('mongoose');

const resenaSchema = new mongoose.Schema({
  // Referencias principales
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: [true, 'El salón es obligatorio']
  },
  evento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Evento',
    required: [true, 'El evento es obligatorio']
  },
  
  // Información del revisor
  nombreRevisor: {
    type: String,
    required: [true, 'El nombre del revisor es obligatorio'],
    trim: true,
    maxlength: [100, 'Máximo 100 caracteres']
  },
  emailRevisor: {
    type: String,
    required: [true, 'El email del revisor es obligatorio'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  
  // Calificaciones (1-5 estrellas)
  calificacionGeneral: {
    type: Number,
    required: [true, 'La calificación general es obligatoria'],
    min: [1, 'Mínimo 1 estrella'],
    max: [5, 'Máximo 5 estrellas']
  },
  calificacionSalon: {
    type: Number,
    required: [true, 'La calificación del salón es obligatoria'],
    min: [1, 'Mínimo 1 estrella'],
    max: [5, 'Máximo 5 estrellas']
  },
  calificacionServicio: {
    type: Number,
    required: [true, 'La calificación del servicio es obligatoria'],
    min: [1, 'Mínimo 1 estrella'],
    max: [5, 'Máximo 5 estrellas']
  },
  calificacionValor: {
    type: Number,
    required: [true, 'La calificación del valor es obligatoria'],
    min: [1, 'Mínimo 1 estrella'],
    max: [5, 'Máximo 5 estrellas']
  },
  
  // Comentarios
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [150, 'Máximo 150 caracteres']
  },
  comentario: {
    type: String,
    required: [true, 'El comentario es obligatorio'],
    trim: true,
    maxlength: [1000, 'Máximo 1000 caracteres']
  },
  aspectosPositivos: {
    type: String,
    trim: true,
    maxlength: [500, 'Máximo 500 caracteres']
  },
  aspectosNegativos: {
    type: String,
    trim: true,
    maxlength: [500, 'Máximo 500 caracteres']
  },
  
  // Recomendación
  recomendaria: {
    type: Boolean,
    required: [true, 'La recomendación es obligatoria']
  },
  
  // Estado de la reseña
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  },
  
  // Respuesta del proveedor
  respuestaProveedor: {
    texto: {
      type: String,
      trim: true,
      maxlength: [500, 'Máximo 500 caracteres']
    },
    fechaRespuesta: {
      type: Date
    }
  },
  
  // Moderación
  motivoRechazo: {
    type: String,
    trim: true,
    maxlength: [200, 'Máximo 200 caracteres']
  },
  fechaModeracion: {
    type: Date
  },
  moderadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Métricas de utilidad
  votosUtiles: {
    type: Number,
    default: 0,
    min: 0
  },
  votosTotal: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Índices para búsquedas eficientes
resenaSchema.index({ salon: 1, estado: 1 });
resenaSchema.index({ emailRevisor: 1, salon: 1 });
resenaSchema.index({ estado: 1, createdAt: -1 });
resenaSchema.index({ calificacionGeneral: -1, createdAt: -1 });

// Validación para evitar reseñas duplicadas del mismo email para el mismo evento
resenaSchema.index({ evento: 1, emailRevisor: 1 }, { unique: true });

// Virtual para calcular calificación promedio de aspectos específicos
resenaSchema.virtual('calificacionPromedio').get(function() {
  return Math.round(((this.calificacionSalon + this.calificacionServicio + this.calificacionValor) / 3) * 10) / 10;
});

// Virtual para porcentaje de utilidad
resenaSchema.virtual('porcentajeUtilidad').get(function() {
  if (this.votosTotal === 0) return 0;
  return Math.round((this.votosUtiles / this.votosTotal) * 100);
});

// Método estático para obtener reseñas aprobadas de un salón
resenaSchema.statics.getResenasSalon = function(salonId, filtros = {}) {
  const query = { 
    salon: salonId, 
    estado: 'aprobado' 
  };
  
  if (filtros.calificacionMinima) {
    query.calificacionGeneral = { $gte: filtros.calificacionMinima };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('evento', 'nombreEvento fechaEvento');
};

// Método estático para calcular estadísticas de un salón
resenaSchema.statics.getEstadisticasSalon = async function(salonId) {
  const stats = await this.aggregate([
    { $match: { salon: new mongoose.Types.ObjectId(salonId), estado: 'aprobado' } },
    {
      $group: {
        _id: null,
        totalResenas: { $sum: 1 },
        calificacionPromedio: { $avg: '$calificacionGeneral' },
        calificacionSalon: { $avg: '$calificacionSalon' },
        calificacionServicio: { $avg: '$calificacionServicio' },
        calificacionValor: { $avg: '$calificacionValor' },
        recomendaciones: { $sum: { $cond: ['$recomendaria', 1, 0] } }
      }
    }
  ]);
  
  if (stats.length === 0) {
    return {
      totalResenas: 0,
      calificacionPromedio: 0,
      calificacionSalon: 0,
      calificacionServicio: 0,
      calificacionValor: 0,
      porcentajeRecomendacion: 0
    };
  }
  
  const result = stats[0];
  return {
    totalResenas: result.totalResenas,
    calificacionPromedio: Math.round(result.calificacionPromedio * 10) / 10,
    calificacionSalon: Math.round(result.calificacionSalon * 10) / 10,
    calificacionServicio: Math.round(result.calificacionServicio * 10) / 10,
    calificacionValor: Math.round(result.calificacionValor * 10) / 10,
    porcentajeRecomendacion: Math.round((result.recomendaciones / result.totalResenas) * 100)
  };
};

// Método para obtener datos públicos de la reseña
resenaSchema.methods.getDatosPublicos = function() {
  return {
    id: this._id,
    nombreRevisor: this.nombreRevisor,
    titulo: this.titulo,
    comentario: this.comentario,
    aspectosPositivos: this.aspectosPositivos,
    aspectosNegativos: this.aspectosNegativos,
    calificacionGeneral: this.calificacionGeneral,
    calificacionSalon: this.calificacionSalon,
    calificacionServicio: this.calificacionServicio,
    calificacionValor: this.calificacionValor,
    calificacionPromedio: this.calificacionPromedio,
    recomendaria: this.recomendaria,
    respuestaProveedor: this.respuestaProveedor,
    votosUtiles: this.votosUtiles,
    votosTotal: this.votosTotal,
    porcentajeUtilidad: this.porcentajeUtilidad,
    fechaCreacion: this.createdAt
  };
};

// Método para obtener datos del proveedor (incluye info del evento)
resenaSchema.methods.getDatosProveedor = function() {
  return {
    ...this.getDatosPublicos(),
    emailRevisor: this.emailRevisor,
    evento: this.evento,
    estado: this.estado
  };
};

// Método para obtener datos admin (incluye moderación)
resenaSchema.methods.getDatosAdmin = function() {
  return {
    ...this.getDatosProveedor(),
    motivoRechazo: this.motivoRechazo,
    fechaModeracion: this.fechaModeracion,
    moderadoPor: this.moderadoPor
  };
};

// Middleware para actualizar calificación del salón al aprobar reseña
resenaSchema.post('save', async function(doc) {
  if (doc.estado === 'aprobado') {
    const { Venue } = require('./index');
    
    try {
      const estadisticas = await doc.constructor.getEstadisticasSalon(doc.salon);
      
      await Venue.findByIdAndUpdate(doc.salon, {
        calificacionPromedio: estadisticas.calificacionPromedio,
        totalResenas: estadisticas.totalResenas
      });
    } catch (error) {
      console.error('Error actualizando calificación del salón:', error);
    }
  }
});

module.exports = mongoose.model('Resena', resenaSchema);