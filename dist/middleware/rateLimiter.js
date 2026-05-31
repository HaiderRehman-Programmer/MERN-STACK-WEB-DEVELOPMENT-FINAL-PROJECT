"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = require("express-rate-limit");
// General API Limiter (100 requests per 15 minutes)
exports.apiLimiter = (0, express_rate_limit_1.rateLimit)({
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
exports.authLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: {
        status: 'fail',
        message: 'Too many login/auth attempts, please try again in 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimiter.js.map