/**
 * Índice de Modelos
 * Exporta todos los modelos para facilitar las importaciones
 */

const User = require('./Usuario');
const EventType = require('./TipoEvento');
const ServiceCategory = require('./CategoriaServicio');
const Venue = require('./Salon');
const Consulta = require('./Consulta');

module.exports = {
  User,
  EventType,
  ServiceCategory,
  Venue,
  Consulta
};