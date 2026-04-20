import { db } from '../../config/db';
import { reviewsTable, enrollmentsTable, usersTable } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { AppError } from '../../utils/AppError';

export class ReviewService {
  static async createOrUpdate(data: any, studentId: string) {
    const { courseId, rating, comment } = data;

    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const enrollment = await db.select().from(enrollmentsTable)
      .where(and(eq(enrollmentsTable.studentId, studentId), eq(enrollmentsTable.courseId, courseId)))
      .limit(1);

    if (enrollment.length === 0) {
      throw new AppError('You must be enrolled in this course to leave a review', 403);
    }

    const existing = await db.select().from(reviewsTable)
      .where(and(eq(reviewsTable.studentId, studentId), eq(reviewsTable.courseId, courseId)))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db.update(reviewsTable)
        .set({ rating, comment })
        .where(and(eq(reviewsTable.studentId, studentId), eq(reviewsTable.courseId, courseId)))
        .returning();
      return { updated: true, data: updated[0] };
    }

    const reviewId = uuidv7();
    await db.insert(reviewsTable).values({ id: reviewId, studentId, courseId, rating, comment: comment || null });
    return { updated: false, id: reviewId };
  }

  static async getCourseReviews(courseId: string) {
    return await db
      .select({
        id: reviewsTable.id,
        rating: reviewsTable.rating,
        comment: reviewsTable.comment,
        createdAt: reviewsTable.createdAt,
        studentFirstName: usersTable.firstName,
        studentLastName: usersTable.lastName,
      })
      .from(reviewsTable)
      .innerJoin(usersTable, eq(reviewsTable.studentId, usersTable.id))
      .where(eq(reviewsTable.courseId, courseId));
  }

  static async deleteReview(reviewId: string, studentId: string) {
    const result = await db.delete(reviewsTable)
      .where(and(eq(reviewsTable.id, reviewId), eq(reviewsTable.studentId, studentId)))
      .returning();

    if (result.length === 0) throw new AppError('Review not found or unauthorized', 404);
  }
}
