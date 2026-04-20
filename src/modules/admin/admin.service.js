"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const meilisearch_1 = require("../../config/meilisearch");
const AppError_1 = require("../../utils/AppError");
class AdminService {
    static async getAllUsers() {
        return await db_1.db
            .select({
            id: schema_1.usersTable.id,
            firstName: schema_1.usersTable.firstName,
            lastName: schema_1.usersTable.lastName,
            role: schema_1.usersTable.role,
            email: schema_1.userAuthTable.email,
            createdAt: schema_1.usersTable.createdAt,
        })
            .from(schema_1.usersTable)
            .innerJoin(schema_1.userAuthTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.id, schema_1.userAuthTable.userId));
    }
    static async updateUserRole(userId, role) {
        const validRoles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
        if (!validRoles.includes(role)) {
            throw new AppError_1.AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
        }
        const userArr = await db_1.db.select().from(schema_1.usersTable).where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, userId)).limit(1);
        if (!userArr.length) {
            throw new AppError_1.AppError('User not found', 404);
        }
        await db_1.db.update(schema_1.usersTable).set({ role }).where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, userId));
        return { id: userId, role };
    }
    static async getGlobalStats() {
        const userCount = await db_1.db.select({ value: (0, drizzle_orm_1.count)() }).from(schema_1.usersTable);
        const courseCount = await db_1.db.select({ value: (0, drizzle_orm_1.count)() }).from(schema_1.coursesTable);
        const enrollmentCount = await db_1.db.select({ value: (0, drizzle_orm_1.count)() }).from(schema_1.enrollmentsTable);
        return {
            users: Number(userCount[0]?.value ?? 0),
            courses: Number(courseCount[0]?.value ?? 0),
            enrollments: Number(enrollmentCount[0]?.value ?? 0),
        };
    }
    static async getSystemHealth() {
        const start = Date.now();
        try {
            // 1. Check DB latency
            await db_1.db.execute((0, drizzle_orm_1.sql) `SELECT 1`);
            const dbLatency = Date.now() - start;
            // 2. Check Meilisearch
            let meiliStatus = 'offline';
            try {
                const health = await meilisearch_1.meili.isHealthy();
                if (health)
                    meiliStatus = 'online';
            }
            catch (e) {
                meiliStatus = 'error';
            }
            return {
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                services: {
                    database: { status: 'connected', latency: `${dbLatency}ms` },
                    search: { status: meiliStatus },
                }
            };
        }
        catch (error) {
            return {
                status: 'degraded',
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map