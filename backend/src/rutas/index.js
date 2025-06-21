/**
 * Centralizador de Rutas
 * Organiza todas las rutas de la API
 */

const express = require('express');

// Importar todas las rutas
const authRoutes = require('./authRoutes');
const salonRoutes = require('./solanesRoutes');
const consultaRoutes = require('./consultaRoutes');
const eventoRoutes = require('./eventoRoutes');
const resenaRoutes = require('./resenaRoutes');
const busquedaRoutes = require('./busquedaRoutes');

const router = express.Router();

/**
 * Configurar todas las rutas de la API
 */

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de salones
router.use('/salones', salonRoutes);

// Rutas de consultas (lead management)
router.use('/consultas', consultaRoutes);

// Rutas de eventos (conversión)
router.use('/eventos', eventoRoutes);

// Rutas de reseñas (calidad)
router.use('/resenas', resenaRoutes);

// Rutas de búsqueda (nueva funcionalidad)
router.use('/busqueda', busquedaRoutes);

/**
 * Ruta de salud básica de la API
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CelebraBol API funcionando correctamente',
    data: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        salones: '/api/salones',
        consultas: '/api/consultas',
        eventos: '/api/eventos',
        resenas: '/api/resenas',
        busqueda: '/api/busqueda'
      }
    }
  });
});

/**
 * Ruta de salud detallada
 */
router.get('/health/detailed', async (req, res) => {
  const { checkConnection } = require('../config/database');
  const { server } = require('../config/enviroment');
  
  try {
    const dbHealth = await checkConnection();
    
    res.json({
      success: true,
      data: {
        status: 'ok',
        database: dbHealth,
        server: {
          port: server.port,
          env: server.env,
          uptime: process.uptime()
        },
        endpoints: {
          auth: '/api/auth',
          salones: '/api/salones',
          consultas: '/api/consultas',
          eventos: '/api/eventos',
          resenas: '/api/resenas',
          busqueda: '/api/busqueda'
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en health check detallado',
      error: error.message
    });
  }
});

/**
 * Información general de la API (ruta raíz)
 */
router.get('/', (req, res) => {
  res.json({
    message: 'CelebraBol API - Marketplace de Salones de Eventos en Bolivia',
    version: '1.0.0',
    description: 'API completa para gestión de salones, consultas, eventos y reseñas',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      salones: '/api/salones',
      consultas: '/api/consultas',
      eventos: '/api/eventos',
      resenas: '/api/resenas',
      busqueda: '/api/busqueda'
    },
    documentation: {
      healthCheck: 'GET /api/health',
      authentication: 'POST /api/auth/login',
      search: 'GET /api/busqueda/salones'
    }
  });
});

/**
 * Estadísticas generales de la plataforma (público)
 */
router.get('/stats', async (req, res) => {
  try {
    const { Venue, Consulta, Evento, Resena } = require('../modelos');
    
    const [totalSalones, totalConsultas, totalEventos, totalResenas] = await Promise.all([
      Venue.countDocuments({ estado: 'aprobado' }),
      Consulta.countDocuments(),
      Evento.countDocuments({ estado: 'completado' }),
      Resena.countDocuments({ estado: 'aprobado' })
    ]);
    
    res.json({
      success: true,
      message: 'Estadísticas de la plataforma',
      data: {
        totalSalones,
        totalConsultas,
        totalEventos,
        totalResenas,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
});

module.exports = router;