"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuidv7_1 = require("uuidv7");
const AppError_1 = require("../../utils/AppError");
class ReviewService {
    static async createOrUpdate(data, studentId) {
        const { courseId, rating, comment } = data;
        if (!rating || rating < 1 || rating > 5) {
            throw new AppError_1.AppError('Rating must be between 1 and 5', 400);
        }
        const enrollment = await db_1.db.select().from(schema_1.enrollmentsTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.studentId, studentId), (0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.courseId, courseId)))
            .limit(1);
        if (enrollment.length === 0) {
            throw new AppError_1.AppError('You must be enrolled in this course to leave a review', 403);
        }
        const existing = await db_1.db.select().from(schema_1.reviewsTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.reviewsTable.studentId, studentId), (0, drizzle_orm_1.eq)(schema_1.reviewsTable.courseId, courseId)))
            .limit(1);
        if (existing.length > 0) {
            const updated = await db_1.db.update(schema_1.reviewsTable)
                .set({ rating, comment })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.reviewsTable.studentId, studentId), (0, drizzle_orm_1.eq)(schema_1.reviewsTable.courseId, courseId)))
                .returning();
            return { updated: true, data: updated[0] };
        }
        const reviewId = (0, uuidv7_1.uuidv7)();
        await db_1.db.insert(schema_1.reviewsTable).values({ id: reviewId, studentId, courseId, rating, comment: comment || null });
        return { updated: false, id: reviewId };
    }
    static async getCourseReviews(courseId) {
        return await db_1.db
            .select({
            id: schema_1.reviewsTable.id,
            rating: schema_1.reviewsTable.rating,
            comment: schema_1.reviewsTable.comment,
            createdAt: schema_1.reviewsTable.createdAt,
            studentFirstName: schema_1.usersTable.firstName,
            studentLastName: schema_1.usersTable.lastName,
        })
            .from(schema_1.reviewsTable)
            .innerJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.reviewsTable.studentId, schema_1.usersTable.id))
            .where((0, drizzle_orm_1.eq)(schema_1.reviewsTable.courseId, courseId));
    }
    static async deleteReview(reviewId, studentId) {
        const result = await db_1.db.delete(schema_1.reviewsTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.reviewsTable.id, reviewId), (0, drizzle_orm_1.eq)(schema_1.reviewsTable.studentId, studentId)))
            .returning();
        if (result.length === 0)
            throw new AppError_1.AppError('Review not found or unauthorized', 404);
    }
}
exports.ReviewService = ReviewService;
//# sourceMappingURL=reviews.service.js.map