"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuidv7_1 = require("uuidv7");
const AppError_1 = require("../../utils/AppError");
class EnrollmentService {
    static async enroll(courseId, studentId) {
        const enrollmentId = (0, uuidv7_1.uuidv7)();
        try {
            await db_1.db.insert(schema_1.enrollmentsTable).values({
                id: enrollmentId,
                courseId,
                studentId,
                status: 'ACTIVE',
            });
            return { enrollmentId };
        }
        catch (error) {
            if (error.code === '23505') {
                throw new AppError_1.AppError("You are already enrolled in this course.", 400);
            }
            throw error;
        }
    }
    static async getCertificateData(enrollmentId, userId) {
        const result = await db_1.db
            .select({
            enrollment: schema_1.enrollmentsTable,
            courseTitle: schema_1.coursesTable.title,
            studentName: (0, drizzle_orm_1.sql) `${schema_1.usersTable.firstName} || ' ' || ${schema_1.usersTable.lastName}`,
        })
            .from(schema_1.enrollmentsTable)
            .innerJoin(schema_1.coursesTable, (0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.courseId, schema_1.coursesTable.id))
            .innerJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.studentId, schema_1.usersTable.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.id, enrollmentId), (0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.studentId, userId)))
            .limit(1);
        if (!result || result.length === 0) {
            throw new AppError_1.AppError('Enrollment not found or unauthorized', 404);
        }
        const data = result[0];
        if (!data)
            throw new AppError_1.AppError('Enrollment data not found', 404);
        const { enrollment } = data;
        const lessonCountResult = await db_1.db
            .select({ value: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(schema_1.lessonsTable)
            .where((0, drizzle_orm_1.eq)(schema_1.lessonsTable.courseId, enrollment.courseId));
        const completedCountResult = await db_1.db
            .select({ value: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(schema_1.lessonProgressTable)
            .innerJoin(schema_1.lessonsTable, (0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.lessonId, schema_1.lessonsTable.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.studentId, userId), (0, drizzle_orm_1.eq)(schema_1.lessonsTable.courseId, enrollment.courseId), (0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.isCompleted, true)));
        const totalLessons = lessonCountResult[0]?.value || 0;
        const completedLessons = completedCountResult[0]?.value || 0;
        if (totalLessons === 0 || completedLessons < totalLessons) {
            throw new AppError_1.AppError('Course must be 100% complete to generate a certificate', 400);
        }
        return data;
    }
}
exports.EnrollmentService = EnrollmentService;
//# sourceMappingURL=enrollments.service.js.map