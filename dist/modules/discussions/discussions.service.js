"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscussionService = void 0;
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuidv7_1 = require("uuidv7");
const AppError_1 = require("../../utils/AppError");
class DiscussionService {
    static async checkEnrollmentForLesson(lessonId, userId) {
        const lesson = await db_1.db.query.lessonsTable.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.lessonsTable.id, lessonId),
            with: { course: true }
        });
        if (!lesson)
            throw new AppError_1.AppError('Lesson not found', 404);
        // If teacher of the course, allow
        if (lesson.course.instructorId === userId)
            return;
        // Check enrollment
        const enrollment = await db_1.db.select().from(schema_1.enrollmentsTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.courseId, lesson.course.id), (0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.studentId, userId)))
            .limit(1);
        if (!enrollment.length) {
            throw new AppError_1.AppError('You must be enrolled in this course to participate in discussions', 403);
        }
    }
    static async createQuestion(lessonId, userId, content) {
        await this.checkEnrollmentForLesson(lessonId, userId);
        const id = (0, uuidv7_1.uuidv7)();
        await db_1.db.insert(schema_1.discussionsTable).values({ id, lessonId, userId, content });
        return { id };
    }
    static async createReply(discussionId, userId, content) {
        const disc = await db_1.db.query.discussionsTable.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.discussionsTable.id, discussionId)
        });
        if (!disc)
            throw new AppError_1.AppError('Discussion thread not found', 404);
        await this.checkEnrollmentForLesson(disc.lessonId, userId);
        const id = (0, uuidv7_1.uuidv7)();
        await db_1.db.insert(schema_1.discussionRepliesTable).values({ id, discussionId, userId, content });
        return { id };
    }
    static async deleteOwnQuestion(id, userId) {
        const result = await db_1.db.delete(schema_1.discussionsTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.discussionsTable.id, id), (0, drizzle_orm_1.eq)(schema_1.discussionsTable.userId, userId)))
            .returning();
        if (!result.length)
            throw new AppError_1.AppError('Not authorized or message not found', 403);
    }
    static async deleteOwnReply(id, userId) {
        const result = await db_1.db.delete(schema_1.discussionRepliesTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.discussionRepliesTable.id, id), (0, drizzle_orm_1.eq)(schema_1.discussionRepliesTable.userId, userId)))
            .returning();
        if (!result.length)
            throw new AppError_1.AppError('Not authorized or reply not found', 403);
    }
    static async getByLesson(lessonId) {
        // ...
        return await db_1.db.query.discussionsTable.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.discussionsTable.lessonId, lessonId),
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.discussionsTable.createdAt)],
            with: {
                user: { columns: { firstName: true, lastName: true, role: true } },
                replies: {
                    orderBy: (replies, { asc }) => [asc(replies.createdAt)],
                    with: {
                        user: { columns: { firstName: true, lastName: true, role: true } }
                    }
                }
            }
        });
    }
}
exports.DiscussionService = DiscussionService;
//# sourceMappingURL=discussions.service.js.map