/**
 * Modelo de Consultas
 * Lead management - consultas de clientes a salones
 */

const mongoose = require('mongoose');

// Subdocumento para mensajes de la consulta
const mensajeSchema = new mongoose.Schema({
  remitente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipoRemitente: {
    type: String,
    enum: ['cliente', 'proveedor', 'admin'],
    required: true
  },
  mensaje: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  tipoMensaje: {
    type: String,
    enum: ['mensaje', 'cotizacion', 'contrato'],
    default: 'mensaje'
  },
  leido: {
    type: Boolean,
    default: false
  },
  fechaEnvio: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const consultaSchema = new mongoose.Schema({
  // Referencia al salón
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: [true, 'El salón es obligatorio']
  },
  
  // Datos del cliente
  nombreCliente: {
    type: String,
    required: [true, 'El nombre del cliente es obligatorio'],
    trim: true,
    maxlength: [100, 'Máximo 100 caracteres']
  },
  emailCliente: {
    type: String,
    required: [true, 'El email del cliente es obligatorio'],
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  telefonoCliente: {
    type: String,
    required: [true, 'El teléfono del cliente es obligatorio'],
    match: [/^\d{7,8}$/, 'Teléfono debe tener 7 u 8 dígitos']
  },
  
  // Detalles del evento
  tipoEvento: {
    type: String,
    required: [true, 'El tipo de evento es obligatorio'],
    trim: true
  },
  tipoEventoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventType'
  },
  fechaPreferida: {
    type: Date,
    required: [true, 'La fecha preferida es obligatoria']
  },
  fechasAlternativas: {
    type: [Date],
    default: []
  },
  numeroInvitados: {
    type: Number,
    required: [true, 'El número de invitados es obligatorio'],
    min: [1, 'Mínimo 1 invitado']
  },
  presupuestoEstimado: {
    type: Number,
    min: [0, 'El presupuesto no puede ser negativo']
  },
  
  // Mensaje y requisitos
  mensaje: {
    type: String,
    required: [true, 'El mensaje es obligatorio'],
    trim: true,
    maxlength: [1000, 'Máximo 1000 caracteres']
  },
  requisitosEspeciales: {
    type: String,
    trim: true,
    maxlength: [500, 'Máximo 500 caracteres']
  },
  
  // Estado y seguimiento
  estado: {
    type: String,
    enum: ['nueva', 'contactado', 'cotizado', 'negociando', 'ganada', 'perdida'],
    default: 'nueva'
  },
  fuente: {
    type: String,
    enum: ['sitio_web', 'referencia', 'redes_sociales', 'otro'],
    default: 'sitio_web'
  },
  
  // Información comercial
  montoCotizado: {
    type: Number,
    min: [0, 'El monto cotizado no puede ser negativo']
  },
  montoFinal: {
    type: Number,
    min: [0, 'El monto final no puede ser negativo']
  },
  tasaComision: {
    type: Number,
    min: [0, 'La tasa de comisión no puede ser negativa'],
    max: [100, 'La tasa de comisión no puede ser mayor a 100%'],
    default: 10 // 10% por defecto
  },
  
  // Seguimiento
  proximaFechaSeguimiento: {
    type: Date
  },
  
  // Mensajes de la conversación
  mensajes: [mensajeSchema]
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Índices para búsquedas eficientes
consultaSchema.index({ salon: 1, estado: 1 });
consultaSchema.index({ emailCliente: 1, fechaPreferida: 1 });
consultaSchema.index({ estado: 1, createdAt: -1 });
consultaSchema.index({ proximaFechaSeguimiento: 1 });

// Virtual para calcular comisión
consultaSchema.virtual('comisionCalculada').get(function() {
  if (this.montoFinal && this.tasaComision) {
    return (this.montoFinal * this.tasaComision) / 100;
  }
  return 0;
});

// Virtual para días hasta el evento
consultaSchema.virtual('diasHastaEvento').get(function() {
  if (this.fechaPreferida) {
    const diferencia = this.fechaPreferida.getTime() - new Date().getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }
  return null;
});

// Método estático para buscar consultas por salón
consultaSchema.statics.buscarPorSalon = function(salonId, filtros = {}) {
  const query = { salon: salonId };
  
  if (filtros.estado) query.estado = filtros.estado;
  if (filtros.fechaDesde) query.fechaPreferida = { $gte: new Date(filtros.fechaDesde) };
  if (filtros.fechaHasta) {
    query.fechaPreferida = query.fechaPreferida 
      ? { ...query.fechaPreferida, $lte: new Date(filtros.fechaHasta) }
      : { $lte: new Date(filtros.fechaHasta) };
  }
  
  return this.find(query)
    .populate('salon', 'nombre slug')
    .sort({ createdAt: -1 });
};

// Método para agregar mensaje a la conversación
consultaSchema.methods.agregarMensaje = function(mensaje, remitente, tipoRemitente, tipoMensaje = 'mensaje') {
  this.mensajes.push({
    mensaje,
    remitente,
    tipoRemitente,
    tipoMensaje,
    fechaEnvio: new Date()
  });
  
  return this.save();
};

// Método para obtener datos públicos de la consulta
consultaSchema.methods.getDatosPublicos = function() {
  return {
    id: this._id,
    salon: this.salon,
    nombreCliente: this.nombreCliente,
    emailCliente: this.emailCliente,
    telefonoCliente: this.telefonoCliente,
    tipoEvento: this.tipoEvento,
    fechaPreferida: this.fechaPreferida,
    fechasAlternativas: this.fechasAlternativas,
    numeroInvitados: this.numeroInvitados,
    presupuestoEstimado: this.presupuestoEstimado,
    mensaje: this.mensaje,
    requisitosEspeciales: this.requisitosEspeciales,
    estado: this.estado,
    fuente: this.fuente,
    montoCotizado: this.montoCotizado,
    montoFinal: this.montoFinal,
    diasHastaEvento: this.diasHastaEvento,
    totalMensajes: this.mensajes.length,
    fechaCreacion: this.createdAt,
    ultimaActualizacion: this.updatedAt
  };
};

// Método para obtener datos del proveedor (incluye info comercial)
consultaSchema.methods.getDatosProveedor = function() {
  return {
    ...this.getDatosPublicos(),
    tasaComision: this.tasaComision,
    comisionCalculada: this.comisionCalculada,
    proximaFechaSeguimiento: this.proximaFechaSeguimiento,
    mensajes: this.mensajes
  };
};

module.exports = mongoose.model('Consulta', consultaSchema);