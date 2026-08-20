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
const corsOptions: cors.CorsOptions = {
  origin: (requestOrigin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman, server-to-server)
    if (!requestOrigin) return callback(null, true);

    if (config.corsOrigins.includes('*')) {
      return callback(null, true);
    }

    const cleanOrigin = requestOrigin.replace(/\/$/, '');

    // Allow all Vercel deployments (including preview URLs) and farmse domain
    if (
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.includes('farmse-agricultural-marketplace') ||
      cleanOrigin.includes('localhost') ||
      cleanOrigin.includes('127.0.0.1') ||
      cleanOrigin.startsWith('capacitor://')
    ) {
      return callback(null, true);
    }

    const isAllowed = config.corsOrigins.some((allowed) => {
      if (typeof allowed === 'string') {
        return allowed.toLowerCase() === cleanOrigin.toLowerCase() || allowed === '*';
      }
      if (allowed instanceof RegExp) {
        return allowed.test(cleanOrigin);
      }
      return false;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin: ${requestOrigin}`);
      callback(new Error(`CORS error: Origin ${requestOrigin} is not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static directory for uploaded product and profile images
app.use('/uploads', express.static(config.uploadDir));

// Mount main API routes at both /api and root / for client compatibility
app.use('/api', routes);
app.use('/', routes);

// 404 handler
app.use(notFoundHandler);

// Global centralized error handler
app.use(globalErrorHandler);

export default app;
