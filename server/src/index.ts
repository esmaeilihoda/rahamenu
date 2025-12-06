import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Load environment variables from server/.env (absolute), and also attempt CWD fallback
const envPathPrimary = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPathPrimary });
// In some dev runners, __dirname resolution may differ; load from CWD as a fallback
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { env } from './config/env';
// Set server timezone to Tehran (UTC+3:30)
process.env.TZ = 'Asia/Tehran';
import db from './config/database';
import { getSocketService } from './services/websocket.service';
import { errorHandler, notFound } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import menuRoutes from './routes/menu.routes';
import orderRoutes from './routes/order.routes';
import tableRoutes from './routes/table.routes';
import analyticsRoutes from './routes/analytics.routes';
import paymentRoutes from './routes/payment.routes';
import vibeRoutes from './routes/vibe.routes';
import debugRoutes from './routes/debug.routes';
import { tenantMiddleware } from './middleware/tenant.middleware';

// Create Express app
const app: Application = express();

// Create HTTP server with Socket.IO
const httpServer = createServer(app);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.set('trust proxy', 1);
app.use(helmet()); // Security headers
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined')); // Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api/', limiter); // Apply rate limiting to API routes

// Debug routes - BEFORE tenant middleware
app.use('/api/v1/debug', debugRoutes);

// Skip tenant middleware for all auth/* and debug/* endpoints
app.use('/api/v1', (req, res, next) => {
  if (req.path.startsWith('/auth/') || req.path.startsWith('/debug/')) return next();
  return tenantMiddleware(req, res, next);
});

// Health check endpoint
app.get('/health', (_req, res) => {
  const socketService = getSocketService();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    database: db ? 'connected' : 'disconnected',
    websocket: {
      enabled: true,
      connections: socketService.getConnectionCount(),
    },
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/vibes', vibeRoutes);
app.use('/api/v1/payment', paymentRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'Menu Bloom API',
    version: '1.0.0',
    description: 'Restaurant management system API',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      menu: '/api/v1/menu',
      orders: '/api/v1/orders',
      tables: '/api/v1/tables',
      payment: '/api/v1/payment',
    },
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Initialize WebSocket service
const socketService = getSocketService();
socketService.initialize(httpServer);

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received, starting graceful shutdown...`);

  try {
    // Close HTTP server
    await new Promise<void>((resolve, reject) => {
      httpServer.close((err) => {
        if (err) {
          console.error('❌ Error closing HTTP server:', err);
          reject(err);
        } else {
          console.log('✅ HTTP server closed');
          resolve();
        }
      });
    });

    // Close WebSocket connections
    await socketService.shutdown();

    // Close database connection
    await db.disconnect();

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await db.connect();

    // Start listening
    const PORT = Number(env.PORT) || 5000;
    httpServer.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════╗');
      console.log('║     🚀 Menu Bloom Server Started      ║');
      console.log('╚════════════════════════════════════════╝');
      console.log('');
      console.log(`🌐 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 Server URL: http://localhost:${PORT}`);
      console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log(`🔌 WebSocket: Enabled`);
      console.log(`📊 Client URL: ${env.CLIENT_URL}`);
      console.log('');
      console.log('Press Ctrl+C to stop the server');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export { app, httpServer };
