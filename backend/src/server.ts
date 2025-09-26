import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Import routes
import treeRoutes from './routes/trees';
import authRoutes from './routes/auth';

// Create Express app
const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);  // <-- Parse to number

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API version endpoint
app.get('/api/v1', (_req: Request, res: Response) => {
  res.json({
    name: 'ArborIQ API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/v1/auth',
      trees: '/api/v1/trees',
      properties: '/api/v1/properties',
      inspections: '/api/v1/inspections',
      workOrders: '/api/v1/work-orders',
      users: '/api/v1/users'
    }
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trees', treeRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {  // <-- ADD '0.0.0.0' here
  console.log(`🌳 ArborIQ API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://0.0.0.0:${PORT}/api/v1/auth`);
  console.log(`📱 Mobile access: http://192.168.1.13:${PORT}/api/v1`);
});