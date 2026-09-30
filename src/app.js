import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fileRoutes from './routes/fileRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { auditLogger } from './middleware/auditLogger.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Observability: Audit Logger for AI endpoints
app.use(auditLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'tworld-ai-posting', timestamp: new Date().toISOString() });
});

// Mount API Routes (supporting both /files and /api/files, /ai and /api/ai)
app.use('/files', fileRoutes);
app.use('/api/files', fileRoutes);
app.use('/ai', aiRoutes);
app.use('/api/ai', aiRoutes);

// Serve Client UI if built
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    // If request does not match api endpoints, serve SPA index
    if (!req.path.startsWith('/api') && !req.path.startsWith('/files') && !req.path.startsWith('/ai')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
}

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'ROUTE_NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found.` }
  });
});

// Central Error Handler
app.use(errorHandler);

export default app;
