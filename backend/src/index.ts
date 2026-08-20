import app from './app';
import { config } from './config';
import prisma from './models/prisma';

const startServer = async () => {
  try {
    // Verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection verified successfully');

    try {
      const userCount = await prisma.user.count();
      console.log(`📦 Database schema ready. Current user count: ${userCount}`);
    } catch (schemaErr: any) {
      console.error(
        '⚠️ DATABASE TABLES MISSING: The PostgreSQL database is connected, but tables have not been created yet.',
        'Please ensure "npx prisma db push" or "npx prisma migrate deploy" has executed.',
        'Error:',
        schemaErr.message
      );
    }
  } catch (error: any) {
    console.error('❌ Database connection failure on boot:', error.message);
  }

  const server = app.listen(config.port, () => {
    console.log(`🌾 FarmSe API Server is running on port ${config.port}`);
    console.log(`📡 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Local API: http://localhost:${config.port}/api`);
    console.log(`🛡️ CORS Allowed: ${JSON.stringify(config.corsOrigins)}`);
  });

  // Graceful shutdown handling for cloud containers & PM2
  const gracefulShutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    server.close(async () => {
      try {
        await prisma.$disconnect();
        console.log('📦 Database connections closed successfully.');
      } catch (err) {
        console.error('Error closing database connection:', err);
      }
      process.exit(0);
    });

    // Force exit if shutdown hangs beyond 10s
    setTimeout(() => {
      console.error('⚠️ Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('❌ Fatal error during server startup:', err);
  process.exit(1);
});
