import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { startDailySummaryJob, stopDailySummaryJob } from './jobs/dailySummary.job.js';

async function bootstrap() {
  // Connect database
  await connectDB();

  // Start in-process background job scheduler
  startDailySummaryJob();

  // Listen on configured port
  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Intelligent Email Assistant Backend running on http://localhost:${env.PORT}`);
    console.log(`📡 Health check: http://localhost:${env.PORT}/api/health`);
    console.log(`🔑 Gemini Configured: ${env.GEMINI_API_KEY ? 'Yes' : 'No (fallback mode)'}`);
    console.log(`🔒 Google OAuth Configured: ${env.GOOGLE_CLIENT_ID ? 'Yes' : 'No (Demo mode available)'}`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    stopDailySummaryJob();
    server.close(async () => {
      await disconnectDB();
      console.log('✅ Server closed cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  console.error('Fatal bootstrap error:', err);
  process.exit(1);
});
