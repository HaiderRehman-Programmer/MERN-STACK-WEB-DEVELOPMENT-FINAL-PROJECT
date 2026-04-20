"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonService = void 0;
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuidv7_1 = require("uuidv7");
const AppError_1 = require("../../utils/AppError");
class LessonService {
    static async createLesson(data, instructorId) {
        const { courseId, title, content, videoUrl, isFreePreview, orderIndex } = data;
        const courseArr = await db_1.db.select().from(schema_1.coursesTable).where((0, drizzle_orm_1.eq)(schema_1.coursesTable.id, courseId)).limit(1);
        const course = courseArr[0];
        if (!course || course.instructorId !== instructorId) {
            throw new AppError_1.AppError("You lack authorization to modify this course directly", 403);
        }
        const lessonId = (0, uuidv7_1.uuidv7)();
        await db_1.db.insert(schema_1.lessonsTable).values({
            id: lessonId,
            courseId,
            title,
            content,
            videoUrl,
            isFreePreview,
            orderIndex,
        });
        return { id: lessonId };
    }
    static async getCourseLessons(courseId, userId) {
        const lessons = await db_1.db
            .select()
            .from(schema_1.lessonsTable)
            .where((0, drizzle_orm_1.eq)(schema_1.lessonsTable.courseId, courseId))
            .orderBy((0, drizzle_orm_1.asc)(schema_1.lessonsTable.orderIndex));
        let isEnrolled = false;
        if (userId) {
            const enrArr = await db_1.db.select().from(schema_1.enrollmentsTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.studentId, userId), (0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.courseId, courseId), (0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.status, 'ACTIVE')))
                .limit(1);
            if (enrArr.length > 0)
                isEnrolled = true;
        }
        let progressMap = new Map();
        if (isEnrolled && userId) {
            const progress = await db_1.db.select({
                lessonId: schema_1.lessonProgressTable.lessonId,
                isCompleted: schema_1.lessonProgressTable.isCompleted,
                lastWatchedSeconds: schema_1.lessonProgressTable.lastWatchedSeconds
            })
                .from(schema_1.lessonProgressTable).where((0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.studentId, userId));
            progress.forEach(p => progressMap.set(p.lessonId, {
                isCompleted: p.isCompleted,
                lastWatchedSeconds: p.lastWatchedSeconds
            }));
        }
        return lessons.map((lesson) => {
            const p = progressMap.get(lesson.id);
            const lessonData = {
                ...lesson,
                isCompleted: p?.isCompleted || false,
                lastWatchedSeconds: p?.lastWatchedSeconds || 0
            };
            if (!lesson.isFreePreview && !isEnrolled) {
                return { ...lessonData, videoUrl: null, content: 'PROTECTED CONTENT. ENROLLMENT REQUIRED.' };
            }
            return lessonData;
        });
    }
    static async updateLesson(id, data, instructorId) {
        const lessonArr = await db_1.db.select({ courseId: schema_1.lessonsTable.courseId }).from(schema_1.lessonsTable).where((0, drizzle_orm_1.eq)(schema_1.lessonsTable.id, id)).limit(1);
        const lesson = lessonArr[0];
        if (!lesson)
            throw new AppError_1.AppError('Lesson not found', 404);
        const courseArr = await db_1.db.select().from(schema_1.coursesTable).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coursesTable.id, lesson.courseId), (0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, instructorId))).limit(1);
        if (courseArr.length === 0)
            throw new AppError_1.AppError('Unauthorized', 403);
        const updated = await db_1.db.update(schema_1.lessonsTable)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.lessonsTable.id, id)).returning();
        return updated[0];
    }
    static async deleteLesson(id, instructorId) {
        const lessonArr = await db_1.db.select({ courseId: schema_1.lessonsTable.courseId }).from(schema_1.lessonsTable).where((0, drizzle_orm_1.eq)(schema_1.lessonsTable.id, id)).limit(1);
        const lesson = lessonArr[0];
        if (!lesson)
            throw new AppError_1.AppError('Lesson not found', 404);
        const courseArr = await db_1.db.select().from(schema_1.coursesTable).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coursesTable.id, lesson.courseId), (0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, instructorId))).limit(1);
        if (!courseArr[0])
            throw new AppError_1.AppError('Unauthorized', 403);
        await db_1.db.delete(schema_1.lessonsTable).where((0, drizzle_orm_1.eq)(schema_1.lessonsTable.id, id));
    }
    static async toggleCompletion(lessonId, studentId) {
        const existing = await db_1.db.select().from(schema_1.lessonProgressTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.lessonId, lessonId), (0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.studentId, studentId))).limit(1);
        if (existing.length > 0) {
            await db_1.db.delete(schema_1.lessonProgressTable)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.lessonId, lessonId), (0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.studentId, studentId)));
            return false;
        }
        await db_1.db.insert(schema_1.lessonProgressTable).values({
            id: (0, uuidv7_1.uuidv7)(),
            studentId,
            lessonId,
            isCompleted: true
        });
        return true;
    }
    static async updateProgress(lessonId, studentId, seconds) {
        const existing = await db_1.db.select().from(schema_1.lessonProgressTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.lessonId, lessonId), (0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.studentId, studentId))).limit(1);
        if (existing.length > 0) {
            await db_1.db.update(schema_1.lessonProgressTable).set({ lastWatchedSeconds: seconds })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.lessonId, lessonId), (0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.studentId, studentId)));
        }
        else {
            await db_1.db.insert(schema_1.lessonProgressTable).values({
                id: (0, uuidv7_1.uuidv7)(),
                studentId,
                lessonId,
                lastWatchedSeconds: seconds,
                isCompleted: false
            });
        }
    }
}
exports.LessonService = LessonService;
//# sourceMappingURL=lessons.service.js.map