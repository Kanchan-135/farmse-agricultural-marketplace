import path from 'path';
import { execSync } from 'child_process';
import app from './app';
import { config } from './config';
import prisma from './models/prisma';
import { seedMarketplaceData } from './services/seedService';

const startServer = async () => {
  try {
    // 1. Verify database connectivity
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection verified successfully');

    // 2. Verify tables exist, or auto-migrate if needed
    try {
      const userCount = await prisma.user.count();
      console.log(`📦 Database schema ready. Current user count: ${userCount}`);
    } catch (schemaErr: any) {
      console.warn('⚠️ User table not detected in database. Executing automatic schema migration...');
      try {
        execSync('npx prisma migrate deploy || npx prisma db push --accept-data-loss', {
          stdio: 'inherit',
          cwd: path.resolve(__dirname, '..'),
        });
        const countAfter = await prisma.user.count();
        console.log(`✅ Database tables created successfully on boot! Total users: ${countAfter}`);
      } catch (migrateErr: any) {
        console.error('❌ Automatic schema migration execution failed:', migrateErr.message);
      }
    }

    // 3. Auto-seed marketplace categories and products if empty
    try {
      await seedMarketplaceData(prisma);
    } catch (seedErr: any) {
      console.error('⚠️ Auto-seeding notice:', seedErr.message);
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
