import { rateLimit } from 'express-rate-limit';

// General API Limiter (100 requests per 15 minutes)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again in 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth Limiter (20 requests per 15 minutes)
// Must account for frontend auth hydration calls (/auth/me, /auth/refresh) on every page load
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    status: 'fail',
    message: 'Too many login/auth attempts, please try again in 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
