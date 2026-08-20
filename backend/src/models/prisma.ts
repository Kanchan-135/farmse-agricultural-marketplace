import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Clean and sanitize DATABASE_URL from surrounding quotes or whitespace
let sanitizedDbUrl = process.env.DATABASE_URL?.trim();
if (sanitizedDbUrl) {
  sanitizedDbUrl = sanitizedDbUrl.replace(/^["'](.*)["']$/, '$1').trim();
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: sanitizedDbUrl
      ? {
          db: {
            url: sanitizedDbUrl,
          },
        }
      : undefined,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
