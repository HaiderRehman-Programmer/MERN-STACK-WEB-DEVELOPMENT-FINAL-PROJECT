import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from '../config/db';
import { logger } from '../config/logger';
import path from 'path';

export const migrateDB = async () => {
  logger.info('🚀 Starting database migrations...');
  
  try {
    await migrate(db, {
      migrationsFolder: path.resolve(process.cwd(), 'src/db/migrations'),
    });
    logger.info('✅ Database migrations completed successfully');
  } catch (error) {
    logger.error({ error }, '❌ Database migration failed');
    process.exit(1);
  }
};

// Allow running as a standalone script
if (require.main === module) {
  migrateDB()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await pool.end();
      process.exit(1);
    });
}
