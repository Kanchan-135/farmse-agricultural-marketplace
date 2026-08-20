import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const parseOrigins = (): (string | RegExp)[] => {
  const defaultOrigins: (string | RegExp)[] = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'capacitor://localhost',
    'http://localhost',
    'https://localhost',
  ];

  // Collect potential origin env vars
  const rawOrigins = [
    process.env.CORS_ORIGIN,
    process.env.FRONTEND_URL,
    process.env.CLIENT_URL,
  ]
    .filter(Boolean)
    .join(',');

  if (!rawOrigins) return defaultOrigins;

  if (rawOrigins.includes('*')) {
    return ['*'];
  }

  const customOrigins = rawOrigins
    .split(',')
    .map((o) => o.trim().replace(/\/$/, '')) // trim trailing slash
    .filter(Boolean);

  return Array.from(new Set([...defaultOrigins, ...customOrigins]));
};

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'farmse_super_secret_jwt_key_agriculture_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173',
  corsOrigins: parseOrigins(),
  uploadDir: path.resolve(__dirname, '../../uploads'),
};
