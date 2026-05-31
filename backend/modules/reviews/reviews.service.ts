import { AppError } from '../../utils/AppError';
import { Enrollment } from '../../models/Enrollment';
import { Review } from '../../models/Review';

export class ReviewService {
  static async createOrUpdate(data: any, studentId: string) {
    const { courseId, rating, comment } = data;

    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      throw new AppError('You must be enrolled in this course to leave a review', 403);
    }

    const existing = await Review.findOne({ studentId, courseId });

    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      await existing.save();
      return { updated: true, data: existing };
    }

    const review = await Review.create({ studentId, courseId, rating, comment });
    return { updated: false, id: review._id };
  }

  static async getCourseReviews(courseId: string) {
    const reviews = await Review.find({ courseId })
      .populate('studentId', 'firstName lastName');

    return reviews.map((r: any) => ({
      id: r._id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      studentFirstName: r.studentId ? r.studentId.firstName : '',
      studentLastName: r.studentId ? r.studentId.lastName : ''
    }));
  }

  static async deleteReview(reviewId: string, studentId: string) {
    const result = await Review.findOneAndDelete({ _id: reviewId, studentId });
    if (!result) throw new AppError('Review not found or unauthorized', 404);
  }
}
