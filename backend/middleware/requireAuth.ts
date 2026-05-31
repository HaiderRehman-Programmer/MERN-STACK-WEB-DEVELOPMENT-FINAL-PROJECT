import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';

interface JwtPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

export const requireAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Extract from HTTP Authorization Header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please provide a token.', 401));
  }

  try {
    // Synchronously/Algorithmically verify token structure offline
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Attach contextual variables to Express global pipeline
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token has expired.', 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token payload.', 401));
    }
    next(error);
  }
});
