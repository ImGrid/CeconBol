/**
 * Modelo de Usuario
 * Base para clientes, proveedores y administradores
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email no válido']
  },
  contrasena: {
    type: String,
    required: [true, 'La contraseña es obligatoria'],
    minlength: [6, 'Mínimo 6 caracteres'],
    select: false
  },
  rol: {
    type: String,
    enum: {
      values: ['cliente', 'proveedor', 'admin'],
      message: 'Rol no válido'
    },
    default: 'cliente'
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    maxlength: [50, 'Máximo 50 caracteres']
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true,
    maxlength: [50, 'Máximo 50 caracteres']
  },
  telefono: {
    type: String,
    trim: true,
    match: [/^\d{7,8}$/, 'Teléfono debe tener 7 u 8 dígitos']
  },
  ciudad: {
    type: String,
    enum: ['La Paz', 'Santa Cruz', 'Cochabamba', 'Sucre', 'Potosí', 'Oruro'],
    required: [true, 'La ciudad es obligatoria']
  },
  emailVerificado: {
    type: Boolean,
    default: false
  },
  activo: {
    type: Boolean,
    default: true
  },
  ultimoAcceso: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.contrasena;
      delete ret.__v;
      return ret;
    }
  }
});

// Índices para búsquedas eficientes
userSchema.index({ ciudad: 1, rol: 1 });

// Middleware para hashear contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('contrasena')) return next();
  
  this.contrasena = await bcrypt.hash(this.contrasena, 12);
  next();
});

// Método para verificar contraseña
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.contrasena);
};

// Virtual para nombre completo
userSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} ${this.apellido}`;
});

// Método para obtener datos públicos del usuario
userSchema.methods.getDatosPublicos = function() {
  return {
    id: this._id,
    email: this.email,
    rol: this.rol,
    nombre: this.nombre,
    apellido: this.apellido,
    nombreCompleto: this.nombreCompleto,
    ciudad: this.ciudad,
    emailVerificado: this.emailVerificado,
    fechaCreacion: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);