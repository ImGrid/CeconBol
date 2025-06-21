/**
 * Modelo de Eventos
 * Conversión de consultas a eventos confirmados
 */

const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
  // Referencias principales
  salon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: [true, 'El salón es obligatorio']
  },
  consulta: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consulta',
    required: [true, 'La consulta origen es obligatoria']
  },
  tipoEvento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EventType',
    required: [true, 'El tipo de evento es obligatorio']
  },
  
  // Información del evento
  nombreEvento: {
    type: String,
    required: [true, 'El nombre del evento es obligatorio'],
    trim: true,
    maxlength: [150, 'Máximo 150 caracteres']
  },
  fechaEvento: {
    type: Date,
    required: [true, 'La fecha del evento es obligatoria']
  },
  horaInicio: {
    type: String,
    required: [true, 'La hora de inicio es obligatoria'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida (HH:MM)']
  },
  horaFin: {
    type: String,
    required: [true, 'La hora de fin es obligatoria'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida (HH:MM)']
  },
  numeroInvitados: {
    type: Number,
    required: [true, 'El número de invitados es obligatorio'],
    min: [1, 'Mínimo 1 invitado']
  },
  
  // Información del cliente
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
  
  // Información comercial
  montoTotal: {
    type: Number,
    required: [true, 'El monto total es obligatorio'],
    min: [0, 'El monto no puede ser negativo']
  },
  moneda: {
    type: String,
    default: 'BOB'
  },
  tasaComision: {
    type: Number,
    required: [true, 'La tasa de comisión es obligatoria'],
    min: [0, 'La tasa de comisión no puede ser negativa'],
    max: [100, 'La tasa de comisión no puede ser mayor a 100%'],
    default: 10
  },
  montoComision: {
    type: Number,
    min: [0, 'La comisión no puede ser negativa']
  },
  montoProveedor: {
    type: Number,
    min: [0, 'El monto del proveedor no puede ser negativo']
  },
  
  // Estados del evento
  estado: {
    type: String,
    enum: ['confirmado', 'en_progreso', 'completado', 'cancelado'],
    default: 'confirmado'
  },
  estadoPago: {
    type: String,
    enum: ['pendiente', 'parcial', 'completado', 'reembolsado'],
    default: 'pendiente'
  },
  
  // Detalles adicionales
  requisitosEspeciales: {
    type: String,
    trim: true,
    maxlength: [1000, 'Máximo 1000 caracteres']
  },
  notasInternas: {
    type: String,
    trim: true,
    maxlength: [500, 'Máximo 500 caracteres']
  },
  
  // Fechas importantes
  fechaConfirmacion: {
    type: Date,
    default: Date.now
  },
  fechaCancelacion: {
    type: Date
  },
  motivoCancelacion: {
    type: String,
    trim: true,
    maxlength: [500, 'Máximo 500 caracteres']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Índices para búsquedas eficientes
eventoSchema.index({ salon: 1, fechaEvento: 1 });
eventoSchema.index({ estado: 1, fechaEvento: 1 });
eventoSchema.index({ emailCliente: 1, fechaEvento: 1 });
eventoSchema.index({ estadoPago: 1 });

// Middleware para calcular comisiones antes de guardar
eventoSchema.pre('save', function(next) {
  if (this.isModified('montoTotal') || this.isModified('tasaComision')) {
    this.montoComision = (this.montoTotal * this.tasaComision) / 100;
    this.montoProveedor = this.montoTotal - this.montoComision;
  }
  next();
});

// Virtual para duración del evento en horas
eventoSchema.virtual('duracionHoras').get(function() {
  if (this.horaInicio && this.horaFin) {
    const [inicioHora, inicioMin] = this.horaInicio.split(':').map(Number);
    const [finHora, finMin] = this.horaFin.split(':').map(Number);
    
    const inicioMinutos = inicioHora * 60 + inicioMin;
    const finMinutos = finHora * 60 + finMin;
    
    return Math.round((finMinutos - inicioMinutos) / 60 * 10) / 10;
  }
  return 0;
});

// Virtual para días hasta el evento
eventoSchema.virtual('diasHastaEvento').get(function() {
  if (this.fechaEvento) {
    const diferencia = this.fechaEvento.getTime() - new Date().getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }
  return null;
});

// Método estático para buscar eventos por proveedor
eventoSchema.statics.buscarPorProveedor = function(proveedorId, filtros = {}) {
  const { Venue } = require('./index');
  
  return Venue.find({ propietario: proveedorId })
    .then(salones => {
      const salonIds = salones.map(salon => salon._id);
      
      const query = { salon: { $in: salonIds } };
      
      if (filtros.estado) query.estado = filtros.estado;
      if (filtros.estadoPago) query.estadoPago = filtros.estadoPago;
      if (filtros.fechaDesde) query.fechaEvento = { $gte: new Date(filtros.fechaDesde) };
      if (filtros.fechaHasta) {
        query.fechaEvento = query.fechaEvento 
          ? { ...query.fechaEvento, $lte: new Date(filtros.fechaHasta) }
          : { $lte: new Date(filtros.fechaHasta) };
      }
      
      return this.find(query)
        .populate('salon', 'nombre ciudad')
        .populate('tipoEvento', 'nombre icono')
        .sort({ fechaEvento: 1 });
    });
};

// Método para obtener datos públicos del evento
eventoSchema.methods.getDatosPublicos = function() {
  return {
    id: this._id,
    salon: this.salon,
    tipoEvento: this.tipoEvento,
    nombreEvento: this.nombreEvento,
    fechaEvento: this.fechaEvento,
    horaInicio: this.horaInicio,
    horaFin: this.horaFin,
    duracionHoras: this.duracionHoras,
    numeroInvitados: this.numeroInvitados,
    nombreCliente: this.nombreCliente,
    estado: this.estado,
    diasHastaEvento: this.diasHastaEvento,
    fechaConfirmacion: this.fechaConfirmacion,
    fechaCreacion: this.createdAt
  };
};

// Método para obtener datos del proveedor (incluye info comercial)
eventoSchema.methods.getDatosProveedor = function() {
  return {
    ...this.getDatosPublicos(),
    emailCliente: this.emailCliente,
    telefonoCliente: this.telefonoCliente,
    montoTotal: this.montoTotal,
    tasaComision: this.tasaComision,
    montoComision: this.montoComision,
    montoProveedor: this.montoProveedor,
    estadoPago: this.estadoPago,
    requisitosEspeciales: this.requisitosEspeciales,
    notasInternas: this.notasInternas
  };
};

// Método para obtener datos admin (todo)
eventoSchema.methods.getDatosAdmin = function() {
  return {
    ...this.getDatosProveedor(),
    consulta: this.consulta,
    fechaCancelacion: this.fechaCancelacion,
    motivoCancelacion: this.motivoCancelacion
  };
};

module.exports = mongoose.model('Evento', eventoSchema);