"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateDB = void 0;
const migrator_1 = require("drizzle-orm/node-postgres/migrator");
const db_1 = require("../config/db");
const logger_1 = require("../config/logger");
const path_1 = __importDefault(require("path"));
const migrateDB = async () => {
    logger_1.logger.info('🚀 Starting database migrations...');
    try {
        await (0, migrator_1.migrate)(db_1.db, {
            migrationsFolder: path_1.default.resolve(process.cwd(), 'src/db/migrations'),
        });
        logger_1.logger.info('✅ Database migrations completed successfully');
    }
    catch (error) {
        logger_1.logger.error({ error }, '❌ Database migration failed');
        process.exit(1);
    }
};
exports.migrateDB = migrateDB;
// Allow running as a standalone script
if (require.main === module) {
    (0, exports.migrateDB)()
        .then(async () => {
        await db_1.pool.end();
        process.exit(0);
    })
        .catch(async (err) => {
        console.error(err);
        await db_1.pool.end();
        process.exit(1);
    });
}
//# sourceMappingURL=migrate.js.map