"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const meilisearch_1 = require("../../config/meilisearch");
const courses_search_1 = require("../courses/courses.search");
const AppError_1 = require("../../utils/AppError");
const logger_1 = require("../../config/logger");
class AdminService {
    static async getAllUsers() {
        return await db_1.db
            .select({
            id: schema_1.usersTable.id,
            firstName: schema_1.usersTable.firstName,
            lastName: schema_1.usersTable.lastName,
            role: schema_1.usersTable.role,
            email: schema_1.userAuthTable.email,
            isBanned: schema_1.usersTable.isBanned,
            createdAt: schema_1.usersTable.createdAt,
        })
            .from(schema_1.usersTable)
            .innerJoin(schema_1.userAuthTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.id, schema_1.userAuthTable.userId));
    }
    static async toggleUserBan(userId, isBanned) {
        const userArr = await db_1.db.select().from(schema_1.usersTable).where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, userId)).limit(1);
        const user = userArr[0];
        if (!user)
            throw new AppError_1.AppError('User not found', 404);
        await db_1.db.update(schema_1.usersTable).set({ isBanned }).where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, userId));
        // If instructor is banned, unpublish all their courses
        if (isBanned && user.role === 'INSTRUCTOR') {
            const instructorCourses = await db_1.db.select().from(schema_1.coursesTable).where((0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, userId));
            if (instructorCourses.length > 0) {
                await db_1.db.update(schema_1.coursesTable)
                    .set({ isPublished: false })
                    .where((0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, userId));
                // Sync with Search index
                instructorCourses.forEach(course => {
                    courses_search_1.CourseSearch.removeCourse(course.id).catch(err => console.error(`Failed to remove course ${course.id} from index on ban`, err));
                });
            }
        }
        return { id: userId, isBanned };
    }
    static async getContentForModeration() {
        // 1. Fetch Discussions
        const discussions = await db_1.db.query.discussionsTable.findMany({
            with: {
                user: true,
                lesson: { with: { course: true } }
            },
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.discussionsTable.createdAt)],
            limit: 50
        });
        // 2. Fetch Replies
        const replies = await db_1.db.query.discussionRepliesTable.findMany({
            with: {
                user: true,
            },
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.discussionRepliesTable.createdAt)],
            limit: 50
        });
        return { discussions, replies };
    }
    static async deleteDiscussion(id) {
        await db_1.db.delete(schema_1.discussionsTable).where((0, drizzle_orm_1.eq)(schema_1.discussionsTable.id, id));
    }
    static async deleteReply(id) {
        await db_1.db.delete(schema_1.discussionRepliesTable).where((0, drizzle_orm_1.eq)(schema_1.discussionRepliesTable.id, id));
    }
    static async updateUserRole(userId, role) {
        // ...
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
    static async moderationStrike(courseId, reason) {
        const courseArr = await db_1.db.select().from(schema_1.coursesTable).where((0, drizzle_orm_1.eq)(schema_1.coursesTable.id, courseId)).limit(1);
        const course = courseArr[0];
        if (!course) {
            throw new AppError_1.AppError('Course not found', 404);
        }
        // 1. Unpublish course
        await db_1.db.update(schema_1.coursesTable)
            .set({ isPublished: false, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.coursesTable.id, courseId));
        // 2. Remove from search
        await courses_search_1.CourseSearch.removeCourse(courseId);
        // 3. Audit log
        (0, logger_1.auditLog)('COURSE_MODERATED', { courseId, title: course.title, instructorId: course.instructorId, reason });
        return { success: true, message: `Course "${course.title}" has been unpublished.` };
    }
    static async getSystemHealth() {
        const start = Date.now();
        try {
            // 1. Check DB latency
            await db_1.db.get((0, drizzle_orm_1.sql) `SELECT 1`);
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