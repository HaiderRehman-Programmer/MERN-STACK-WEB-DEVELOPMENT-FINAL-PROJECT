import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from './env';
import { logger } from './logger';
import * as schema from '../db/schema';

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    logger.info('🐘 Database connected securely (PostgreSQL)');
    client.release();
  } catch (error) {
    logger.error(error, '❌ Failed to connect to database');
    process.exit(1);
  }
};
