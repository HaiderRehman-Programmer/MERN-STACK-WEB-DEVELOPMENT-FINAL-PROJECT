"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const env_1 = require("./env");
const opts = {
    level: env_1.env.NODE_ENV === 'development' ? 'debug' : 'info',
};
if (env_1.env.NODE_ENV === 'development' || env_1.env.NODE_ENV === 'test') {
    opts.transport = {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
        },
    };
}
exports.logger = (0, pino_1.default)(opts);
// Audit logging helper for business events
const auditLog = (eventType, metadata) => {
    exports.logger.info({
        audit: true,
        eventType,
        ...metadata,
        timestamp: new Date().toISOString()
    }, `[AUDIT] ${eventType}`);
};
exports.auditLog = auditLog;
//# sourceMappingURL=logger.js.map