import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { globalErrorHandler, notFoundHandler } from './middleware/errorHandler';
import { config } from './config';

const app = express();

// Security headers with cross-origin asset sharing enabled
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Dynamic CORS configuration for Web & Mobile/Capacitor Clients
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!requestOrigin) return callback(null, true);

      if (config.corsOrigins.includes('*')) {
        return callback(null, true);
      }

      const isAllowed = config.corsOrigins.some((allowed) => {
        if (typeof allowed === 'string') {
          return allowed === requestOrigin || allowed === '*';
        }
        if (allowed instanceof RegExp) {
          return allowed.test(requestOrigin);
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        // Log warning in development
        if (!config.isProduction) {
          console.warn(`[CORS] Origin ${requestOrigin} not explicitly whitelisted, allowing in dev`);
          return callback(null, true);
        }
        callback(new Error(`CORS error: Origin ${requestOrigin} is not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static directory for uploaded product and profile images
app.use('/uploads', express.static(config.uploadDir));

// Mount main API routes
app.use('/api', routes);

// 404 handler
app.use(notFoundHandler);

// Global centralized error handler
app.use(globalErrorHandler);

export default app;
