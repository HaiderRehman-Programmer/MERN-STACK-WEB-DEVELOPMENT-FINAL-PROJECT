"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const db_1 = require("./config/db");
const migrate_1 = require("./db/migrate");
const logger_1 = require("./config/logger");
process.on('uncaughtException', (err) => {
    logger_1.logger.fatal({ err }, 'UNCAUGHT EXCEPTION! 💥 Shutting down...');
    process.exit(1);
});
const startServer = async () => {
    // Connect to Database
    await (0, db_1.connectDB)();
    // Run Database Migrations
    await (0, migrate_1.migrateDB)();
    // Initialize Search Index
    const { CourseSearch } = await import('./modules/courses/courses.search.js');
    await CourseSearch.init();
    const server = app_1.default.listen(env_1.env.PORT, () => {
        logger_1.logger.info(`🚀 Server running on port ${env_1.env.PORT} in ${env_1.env.NODE_ENV} mode`);
    });
    process.on('unhandledRejection', (err) => {
        logger_1.logger.fatal({ err }, 'UNHANDLED REJECTION! 💥 Shutting down...');
        server.close(() => {
            process.exit(1);
        });
    });
};
startServer();
//# sourceMappingURL=server.js.map