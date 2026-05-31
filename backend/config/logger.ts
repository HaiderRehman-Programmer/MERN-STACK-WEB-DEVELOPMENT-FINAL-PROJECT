import pino, { LoggerOptions } from 'pino';
import { env } from './env';

const opts: LoggerOptions = {
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
};

if (env.NODE_ENV === 'development' || env.NODE_ENV === 'test') {
  opts.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

export const logger = pino(opts);

// Audit logging helper for business events
export const auditLog = (eventType: string, metadata: any) => {
  logger.info({ 
    audit: true, 
    eventType, 
    ...metadata,
    timestamp: new Date().toISOString() 
  }, `[AUDIT] ${eventType}`);
};
