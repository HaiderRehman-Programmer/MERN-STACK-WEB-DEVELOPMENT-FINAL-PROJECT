import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../config/logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    if (process.env.NODE_ENV === 'test') logger.error('💥 TEST ERROR', err);
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err.message,
      stack: err.stack,
    });
  } else {
    // Production
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        status: err.status,
        error: err.message,
      });
    } else {
      // Programming or unknown error: don't leak details
      logger.error({ err }, '💥 NON-OPERATIONAL ERROR!');
      res.status(500).json({
        success: false,
        status: 'error',
        error: 'Something went very wrong',
      });
    }
  }
};
