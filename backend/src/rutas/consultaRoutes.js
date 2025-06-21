/**
 * Controlador de Consultas
 * Maneja requests y responses para lead management
 */

const consultaService = require('../servicios/consultaServicio');
const { asyncHandler } = require('../middlewares/manejoErrores');

/**
 * POST /consultas
 * Crear nueva consulta (público)
 */
const createConsulta = asyncHandler(async (req, res) => {
  const consulta = await consultaService.createConsulta(req.body);
  
  res.created('Consulta enviada exitosamente', consulta);
});

/**
 * GET /consultas/salon/:salonId
 * Obtener consultas de un salón específico (proveedor)
 */
const getConsultasBySalon = asyncHandler(async (req, res) => {
  const { salonId } = req.params;
  
  const filtros = {
    estado: req.query.estado,
    fechaDesde: req.query.fechaDesde,
    fechaHasta: req.query.fechaHasta
  };
  
  const paginacion = {
    page: req.query.page,
    limit: req.query.limit
  };
  
  const result = await consultaService.getConsultasBySalon(
    salonId, 
    req.user.id, 
    filtros, 
    paginacion
  );
  
  res.paginated('Consultas del salón obtenidas', result.consultas, result.pagination);
});

/**
 * GET /consultas/mis-consultas
 * Obtener todas las consultas del proveedor (todos sus salones)
 */
const getMisConsultas = asyncHandler(async (req, res) => {
  const filtros = {
    estado: req.query.estado,
    fechaDesde: req.query.fechaDesde,
    fechaHasta: req.query.fechaHasta
  };
  
  const paginacion = {
    page: req.query.page,
    limit: req.query.limit
  };
  
  const result = await consultaService.getConsultasProveedor(
    req.user.id, 
    filtros, 
    paginacion
  );
  
  res.paginated('Mis consultas obtenidas', result.consultas, result.pagination);
});

/**
 * GET /consultas/:consultaId
 * Obtener consulta específica
 */
const getConsultaById = asyncHandler(async (req, res) => {
  const consulta = await consultaService.getConsultaById(
    req.params.consultaId,
    req.user?.id,
    req.user?.rol || 'guest'
  );
  
  res.success('Consulta obtenida', consulta);
});

/**
 * PUT /consultas/:consultaId/estado
 * Actualizar estado de consulta (proveedor)
 */
const updateConsultaStatus = asyncHandler(async (req, res) => {
  const { consultaId } = req.params;
  const { estado, ...datosAdicionales } = req.body;
  
  const consulta = await consultaService.updateConsultaStatus(
    consultaId,
    estado,
    req.user.id,
    datosAdicionales
  );
  
  res.success('Estado de consulta actualizado', consulta);
});

/**
 * POST /consultas/:consultaId/mensajes
 * Agregar mensaje a la consulta
 */
const addMessage = asyncHandler(async (req, res) => {
  const { consultaId } = req.params;
  const { mensaje, tipoMensaje } = req.body;
  
  const consulta = await consultaService.addMessageToConsulta(
    consultaId,
    mensaje,
    req.user.id,
    req.user.rol,
    tipoMensaje
  );
  
  res.success('Mensaje agregado', consulta);
});

/**
 * GET /consultas/stats
 * Obtener estadísticas de consultas del proveedor
 */
const getConsultaStats = asyncHandler(async (req, res) => {
  const stats = await consultaService.getConsultaStats(req.user.id);
  
  res.success('Estadísticas de consultas', stats);
});

/**
 * PUT /consultas/:consultaId/mensajes/leer
 * Marcar mensajes como leídos
 */
const markMessagesAsRead = asyncHandler(async (req, res) => {
  const { consultaId } = req.params;
  const { mensajeIds, marcarTodos } = req.body;
  
  const { Consulta } = require('../modelos');
  
  // Obtener consulta y verificar permisos
  const consulta = await Consulta.findById(consultaId).populate('salon');
  
  if (!consulta) {
    return res.notFound('Consulta no encontrada');
  }
  
  // Verificar permisos del proveedor
  if (req.user.rol === 'proveedor' && consulta.salon.propietario.toString() !== req.user.id) {
    return res.forbidden('No tienes permisos para esta consulta');
  }
  
  // Marcar mensajes como leídos
  if (marcarTodos) {
    // Marcar todos los mensajes como leídos
    consulta.mensajes.forEach(mensaje => {
      if (mensaje.tipoRemitente !== req.user.rol) {
        mensaje.leido = true;
      }
    });
  } else if (mensajeIds && mensajeIds.length > 0) {
    // Marcar mensajes específicos
    consulta.mensajes.forEach(mensaje => {
      if (mensajeIds.includes(mensaje._id.toString()) && mensaje.tipoRemitente !== req.user.rol) {
        mensaje.leido = true;
      }
    });
  }
  
  await consulta.save();
  
  res.success('Mensajes marcados como leídos', {
    consultaId,
    mensajesActualizados: mensajeIds?.length || consulta.mensajes.length
  });
});

/**
 * GET /consultas/dashboard
 * Dashboard con resumen de consultas para proveedor
 */
const getDashboard = asyncHandler(async (req, res) => {
  const { Consulta, Venue } = require('../modelos');
  
  // Obtener salones del proveedor
  const salones = await Venue.find({ propietario: req.user.id }).select('_id nombre');
  const salonIds = salones.map(salon => salon._id);
  
  if (salonIds.length === 0) {
    return res.success('Dashboard de consultas', {
      resumenEstados: {},
      consultasRecientes: [],
      consultasUrgentes: [],
      totalSalones: 0
    });
  }
  
  // Consultas por estado (últimos 30 días)
  const fecha30Dias = new Date();
  fecha30Dias.setDate(fecha30Dias.getDate() - 30);
  
  const [resumenEstados, consultasRecientes, consultasUrgentes] = await Promise.all([
    // Resumen por estados
    Consulta.aggregate([
      { 
        $match: { 
          salon: { $in: salonIds },
          createdAt: { $gte: fecha30Dias }
        } 
      },
      { $group: { _id: '$estado', count: { $sum: 1 } } }
    ]),
    
    // Consultas recientes (últimas 5)
    Consulta.find({ salon: { $in: salonIds } })
      .populate('salon', 'nombre')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    
    // Consultas urgentes (eventos en próximos 7 días)
    Consulta.find({
      salon: { $in: salonIds },
      estado: { $in: ['nueva', 'contactado', 'cotizado'] },
      fechaPreferida: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
      .populate('salon', 'nombre')
      .sort({ fechaPreferida: 1 })
      .limit(10)
      .lean()
  ]);
  
  // Formatear resumen de estados
  const resumen = {};
  resumenEstados.forEach(item => {
    resumen[item._id] = item.count;
  });
  
  res.success('Dashboard de consultas', {
    resumenEstados: resumen,
    consultasRecientes: consultasRecientes.map(c => ({
      id: c._id,
      salon: c.salon.nombre,
      cliente: c.nombreCliente,
      tipoEvento: c.tipoEvento,
      fechaEvento: c.fechaPreferida,
      estado: c.estado,
      fechaCreacion: c.createdAt
    })),
    consultasUrgentes: consultasUrgentes.map(c => ({
      id: c._id,
      salon: c.salon.nombre,
      cliente: c.nombreCliente,
      tipoEvento: c.tipoEvento,
      fechaEvento: c.fechaPreferida,
      estado: c.estado,
      diasRestantes: Math.ceil((c.fechaPreferida - new Date()) / (1000 * 60 * 60 * 24))
    })),
    totalSalones: salones.length
  });
});

module.exports = {
  createConsulta,
  getConsultasBySalon,
  getMisConsultas,
  getConsultaById,
  updateConsultaStatus,
  addMessage,
  getConsultaStats,
  markMessagesAsRead,
  getDashboard
};