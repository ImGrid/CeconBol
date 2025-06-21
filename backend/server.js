/**
 * Servidor Principal - CelebraBol API
 * FASE 9: Integración y Rutas Principales
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Configuración
const { server } = require('./src/config/enviroment');
const { initializeDatabase } = require('./src/config/database');
const { logger } = require('./src/utilidades/logs');

// Middlewares propios
const { requestLogger } = require('./src/utilidades/logs');
const { responseMiddleware } = require('./src/utilidades/responses');
const { errorHandler, notFoundHandler } = require('./src/middlewares/manejoErrores');

// Centralizador de rutas
const apiRoutes = require('./src/rutas/index');

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
  
  // Servir archivos estáticos
  app.use('/uploads', express.static('uploads'));
  
  // Rutas de la API centralizadas
  app.use('/api', apiRoutes);
  
  // Ruta raíz
  app.get('/', (req, res) => {
    res.json({
      message: 'CelebraBol API - Marketplace de Salones de Eventos',
      version: '1.0.0',
      status: 'active',
      endpoints: {
        api: '/api',
        health: '/api/health',
        auth: '/api/auth',
        salones: '/api/salones',
        consultas: '/api/consultas',
        eventos: '/api/eventos',
        resenas: '/api/resenas',
        busqueda: '/api/busqueda'
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
    console.log('Base de datos conectada exitosamente');
    
    // Crear y configurar Express app
    const app = createExpressApp();
    
    // Iniciar servidor
    const httpServer = app.listen(server.port, () => {
      console.log('\n=== SERVER STARTED ===');
      console.log(`URL: http://localhost:${server.port}`);
      console.log(`Environment: ${server.env}`);
      console.log(`API Endpoint: http://localhost:${server.port}/api`);
      console.log('========================\n');
      
      logger.info('HTTP server started successfully', { 
        port: server.port, 
        env: server.env,
        version: '1.0.0'
      });
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
    console.log(`\nShutdown initiated by signal: ${signal}`);
    logger.info(`Shutdown initiated by signal: ${signal}`);
    
    try {
      // Cerrar servidor HTTP
      await new Promise((resolve) => {
        httpServer.close(() => {
          console.log('HTTP server closed');
          logger.info('HTTP server closed');
          resolve();
        });
      });
      
      // Cerrar base de datos
      const { disconnectDatabase } = require('./src/config/database');
      await disconnectDatabase();
      console.log('Database disconnected');
      
      console.log('Graceful shutdown completed');
      logger.info('Graceful shutdown completed');
      process.exit(0);
      
    } catch (error) {
      console.error('Error during shutdown:', error.message);
      logger.error('Error during shutdown', { error: error.message });
      process.exit(1);
    }
  };
  
  // Escuchar señales de sistema
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Manejar errores no capturados
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error.message);
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    logger.error('Unhandled Rejection', { reason, promise });
    process.exit(1);
  });
};

// Ejecutar si es llamado directamente
if (require.main === module) {
  startApp().catch((error) => {
    console.error('FATAL ERROR:', error.message);
    logger.error('Fatal startup error', { error: error.message, stack: error.stack });
    process.exit(1);
  });
}

module.exports = { startApp };