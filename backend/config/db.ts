import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';
import { logger } from './logger';

export const connectDB = async () => {
  try {
    // Force Node.js to use public DNS servers (Google & Cloudflare)
    // to bypass ISP/router issues resolving MongoDB SRV records
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    
    const conn = await mongoose.connect(env.DATABASE_URL);
    logger.info(`🗄️ Database connected (MongoDB): ${conn.connection.host}`);
  } catch (error) {
    logger.error(error, '❌ Failed to connect to database');
    process.exit(1);
  }
};

