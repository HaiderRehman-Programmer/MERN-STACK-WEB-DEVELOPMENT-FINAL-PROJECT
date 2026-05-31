"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../config/logger");
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        if (process.env.NODE_ENV === 'test')
            logger_1.logger.error('💥 TEST ERROR', err);
        res.status(err.statusCode).json({
            success: false,
            status: err.status,
            error: err.message,
            stack: err.stack,
        });
    }
    else {
        // Production
        if (err.isOperational) {
            res.status(err.statusCode).json({
                success: false,
                status: err.status,
                error: err.message,
            });
        }
        else {
            // Programming or unknown error: don't leak details
            logger_1.logger.error({ err }, '💥 NON-OPERATIONAL ERROR!');
            res.status(500).json({
                success: false,
                status: 'error',
                error: 'Something went very wrong',
            });
        }
    }
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map