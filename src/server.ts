import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { migrateDB } from './db/migrate';
import { logger } from './config/logger';

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Run Database Migrations
  await migrateDB();

  // Initialize Search Index
  const { CourseSearch } = await import('./modules/courses/courses.search.js');
  await CourseSearch.init();

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  process.on('unhandledRejection', (err) => {
    logger.fatal({ err }, 'UNHANDLED REJECTION! 💥 Shutting down...');
    server.close(() => {
      process.exit(1);
    });
  });
};

startServer();
