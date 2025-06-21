/**
 * Servidor Principal - Todo en uno
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Configuración
const { server } = require('./src/config/enviroment');
const { initializeDatabase, checkConnection } = require('./src/config/database');
const { logger } = require('./src/utilidades/logs');

// Middlewares propios
const { requestLogger } = require('./src/utilidades/logs');
const { responseMiddleware } = require('./src/utilidades/responses');
const { errorHandler, notFoundHandler } = require('./src/middlewares/manejoErrores');

// Rutas
const authRoutes = require('./src/rutas/authRoutes');
const salonRoutes = require('./src/rutas/solanesRoutes');
const consultaRoutes = require('./src/rutas/consultaRoutes');

/**
 * Crear y configurar aplicación Express
 */
const createExpressApp = () => {
  const app = express();
  
  // Middlewares de seguridad básicos
  app.use(helmet({
    crossOriginEmbedderPolicy: false
  }));
  
  app.use(compression());
  
  // CORS básico
  app.use(cors({
    origin: server.frontendUrl,
    credentials: true,
    optionsSuccessStatus: 200
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Middlewares propios
  app.use(requestLogger);
  app.use(responseMiddleware);
  
  // Servir archivos estáticos (uploads)
  app.use('/uploads', express.static('uploads'));
  
  // Rutas de la API
  app.use('/api/auth', authRoutes);
  app.use('/api/salones', salonRoutes);
  app.use('/api/consultas', consultaRoutes);
  
  // Ruta de salud básica
  app.get('/api/health', (req, res) => {
    res.success('API funcionando correctamente', {
      timestamp: new Date().toISOString(),
      env: server.env,
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        salones: '/api/salones',
        consultas: '/api/consultas'
      }
    });
  });
  
  // Ruta de salud detallada
  app.get('/api/health/detailed', async (req, res) => {
    const dbHealth = await checkConnection();
    
    res.json({
      status: 'ok',
      database: dbHealth,
      server: {
        port: server.port,
        env: server.env,
        uptime: process.uptime()
      },
      timestamp: new Date().toISOString()
    });
  });
  
  // Ruta raíz
  app.get('/', (req, res) => {
    res.json({
      message: 'CelebraBol API',
      endpoints: {
        health: '/api/health',
        auth: '/api/auth',
        salones: '/api/salones',
        consultas: '/api/consultas'
      }
    });
  });
  
  // Manejo de rutas no encontradas
  app.use(notFoundHandler);
  
  // Manejo de errores
  app.use(errorHandler);
  
  return app;
};

/**
 * Inicializar aplicación completa
 */
const startApp = async () => {
  try {
    
    // Conectar base de datos
    await initializeDatabase();
    
    // Crear y configurar Express app
    const app = createExpressApp();
    
    // Iniciar servidor
    const httpServer = app.listen(server.port, () => {
      console.log('\n=== SERVER STARTED ===');
      console.log(`URL: http://localhost:${server.port}`);
      console.log(`Environment: ${server.env}`);
      console.log(`API: http://localhost:${server.port}/api`);
      logger.info('HTTP server started', { port: server.port, env: server.env });
    });
    
    // Configurar cierre limpio
    setupGracefulShutdown(httpServer);
    
    return httpServer;
    
  } catch (error) {
    console.error('STARTUP ERROR:', error.message);
    logger.error('Critical startup error', { error: error.message });
    process.exit(1);
  }
};

/**
 * Configurar cierre limpio
 */
const setupGracefulShutdown = (httpServer) => {
  const shutdown = async (signal) => {
    logger.info(`Shutdown initiated by signal: ${signal}`);
    
    try {
      // Cerrar servidor HTTP
      await new Promise((resolve) => {
        httpServer.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });
      
      // Cerrar base de datos
      const { disconnectDatabase } = require('./src/configuracion/database');
      await disconnectDatabase();
      
      logger.info('Graceful shutdown completed');
      process.exit(0);
      
    } catch (error) {
      logger.error('Error during shutdown', { error: error.message });
      process.exit(1);
    }
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  startApp().catch((error) => {
    console.error('FATAL ERROR:', error.message);
    process.exit(1);
  });
}

module.exports = { startApp };