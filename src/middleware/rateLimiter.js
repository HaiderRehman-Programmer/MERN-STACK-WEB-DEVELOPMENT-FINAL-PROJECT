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
// Stricter Auth Limiter (5 requests per 15 minutes)
exports.authLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        status: 'fail',
        message: 'Too many login/auth attempts, please try again in 15 minutes',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimiter.js.map