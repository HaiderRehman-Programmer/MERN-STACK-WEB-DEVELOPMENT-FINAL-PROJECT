import { AppError } from '../../utils/AppError';
import { Course } from '../../models/Course';
import { Wishlist } from '../../models/Wishlist';

export class WishlistService {
  static async toggleWishlist(userId: string, courseId: string) {
    const existing = await Wishlist.findOne({ userId, courseId });

    if (existing) {
      await Wishlist.findByIdAndDelete(existing._id);
      return { favorited: false };
    }

    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);

    await Wishlist.create({ userId, courseId });
    return { favorited: true };
  }

  static async getWishlist(userId: string) {
    const list = await Wishlist.find({ userId })
      .populate({
        path: 'courseId',
        populate: { path: 'instructorId' }
      })
      .sort({ createdAt: -1 });

    return list.map((item: any) => {
      const course = item.courseId;
      if (!course) return null;
      
      const courseObj = course.toObject ? course.toObject() : course;
      
      return {
        ...courseObj,
        instructor: course.instructorId
      };
    }).filter(Boolean);
  }
}
