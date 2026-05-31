import { uuidv7 } from 'uuidv7';
import { AppError } from '../../utils/AppError';
import { CourseSearch } from './courses.search';
import { Course } from '../../models/Course';
import { Enrollment } from '../../models/Enrollment';
import { Review } from '../../models/Review';
import { Quiz } from '../../models/Quiz';
import { QuizAttempt } from '../../models/QuizAttempt';
import { Lesson } from '../../models/Lesson';
import { LessonProgress } from '../../models/LessonProgress';

export class CourseService {
  static async createCourse(data: any, instructorId: string) {
    const { title, description, price, category } = data;
    const courseId = uuidv7();

    try {
      const course = await Course.create({
        _id: courseId,
        title,
        description,
        price,
        category: category || 'Uncategorized',
        instructorId,
        isPublished: false,
      });

      const newCourse = { id: courseId, title, description, price, category, isPublished: false };
      await CourseSearch.indexCourse(newCourse);

      return newCourse;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('A course with this exact title already exists. Please choose a unique name.', 400);
      }
      throw error;
    }
  }

  static async findCourses(queryParams: any) {
    const { search, category, page = 1, limit = 9 } = queryParams;
    const offset = (page - 1) * limit;

    let searchIds: string[] | null = null;
    if (search) {
      searchIds = await CourseSearch.searchCourses(search, category);
      if (!searchIds || searchIds.length === 0) {
        return { data: [], pagination: { page, limit, totalPages: 0, totalRecords: 0 } };
      }
    }

    let matchConditions: any = { isPublished: true };
    if (category && category !== 'All' && !searchIds) {
      matchConditions.category = category;
    }
    if (searchIds) {
      matchConditions._id = { $in: searchIds };
    }

    const totalRecords = await Course.countDocuments(matchConditions);
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    const pipeline: any[] = [
      { $match: matchConditions },
      { $lookup: { from: 'users', localField: 'instructorId', foreignField: '_id', as: 'instructor' } },
      { $unwind: { path: '$instructor', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'reviews', localField: '_id', foreignField: 'courseId', as: 'reviews' } },
      {
        $addFields: {
          avgRating: { $round: [{ $avg: '$reviews.rating' }, 1] },
          reviewCount: { $size: '$reviews' }
        }
      },
      {
        $project: {
          reviews: 0,
          'instructor.hashedPassword': 0,
          'instructor.refreshToken': 0,
          'instructor.verificationToken': 0,
          'instructor.resetToken': 0,
        }
      },
      { $skip: offset },
      { $limit: Number(limit) }
    ];

    let courses = await Course.aggregate(pipeline);

    if (searchIds) {
      courses = courses.sort((a, b) => searchIds!.indexOf(a._id) - searchIds!.indexOf(b._id));
    }

    const data = courses.map((c: any) => ({
      id: c._id,
      title: c.title,
      description: c.description,
      category: c.category,
      price: c.price,
      isPublished: c.isPublished,
      instructorId: c.instructorId,
      instructor: c.instructor ? { firstName: c.instructor.firstName, lastName: c.instructor.lastName } : null,
      avgRating: Number(c.avgRating || 0),
      reviewCount: Number(c.reviewCount || 0),
    }));

    return { data, pagination: { page, limit, totalPages, totalRecords } };
  }

  static async getInstructorAnalytics(instructorId: string) {
    const courses = await Course.find({ instructorId });

    // 1. Fetch individual course stats
    const courseAnalytics = await Promise.all(courses.map(async (c) => {
      const enrollmentsCount = await Enrollment.countDocuments({ courseId: c._id });
      const reviewsAggregation = await Review.aggregate([
        { $match: { courseId: c._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);
      const reviewStats = reviewsAggregation[0] || { avgRating: 0, count: 0 };

      return {
        courseId: c._id,
        title: c.title,
        price: c.price,
        isPublished: c.isPublished,
        enrollments: enrollmentsCount,
        revenue: Number((enrollmentsCount * c.price).toFixed(2)),
        avgRating: Number((reviewStats.avgRating || 0).toFixed(1)),
        reviewCount: reviewStats.count,
      };
    }));

    const summary = courseAnalytics.reduce((acc, c) => ({
      totalRevenue: acc.totalRevenue + c.revenue,
      totalEnrollments: acc.totalEnrollments + c.enrollments,
      publishedCourses: acc.publishedCourses + (c.isPublished ? 1 : 0)
    }), { totalRevenue: 0, totalEnrollments: 0, publishedCourses: 0 });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const courseIds = courses.map(c => c._id);

    // Trend Analysis
    const trendResult = await Enrollment.aggregate([
      { $match: { courseId: { $in: courseIds }, purchasedAt: { $gte: sixMonthsAgo } } },
      { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$purchasedAt" } },
          enrollments: { $sum: 1 },
          revenue: { $sum: '$course.price' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const formattedTrendResult = trendResult.map(t => ({
      sortKey: t._id,
      enrollments: t.enrollments,
      revenue: t.revenue
    }));

    // Quizzes
    const lessons = await Lesson.find({ courseId: { $in: courseIds } });
    const lessonIds = lessons.map(l => l._id);
    const instructorQuizzes = await Quiz.find({ lessonId: { $in: lessonIds } });

    const quizPerformance = await Promise.all(instructorQuizzes.map(async (quiz) => {
      const attemptsAggregation = await QuizAttempt.aggregate([
        { $match: { quizId: quiz._id } },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$score' },
            passCount: { $sum: { $cond: ['$passed', 1, 0] } },
            totalAttempts: { $sum: 1 }
          }
        }
      ]);
      const stats = attemptsAggregation[0] || { avgScore: 0, passCount: 0, totalAttempts: 0 };
      
      return {
        quizId: quiz._id,
        title: quiz.title,
        avgScore: Math.round(stats.avgScore || 0),
        passRate: stats.totalAttempts ? Math.round((stats.passCount / stats.totalAttempts) * 100) : 0,
        totalAttempts: stats.totalAttempts || 0
      };
    }));

    // --- Engagement Metrics ---
    const totalEnrollmentsCount = summary.totalEnrollments;
    let avgCompletion = 0;

    if (totalEnrollmentsCount > 0) {
      const completedProgressCount = await LessonProgress.countDocuments({
        lessonId: { $in: lessonIds },
        isCompleted: true
      });

      const totalPossibleCompletions = lessonIds.length * totalEnrollmentsCount;
      if (totalPossibleCompletions > 0) {
        avgCompletion = Math.round((completedProgressCount / totalPossibleCompletions) * 100);
      }
    }

    const lessonCompletion = await Promise.all(lessons.map(async (l) => {
      const course = courses.find(c => c._id === l.courseId);
      const completedCount = await LessonProgress.countDocuments({
        lessonId: l._id,
        isCompleted: true
      });
      return {
        lessonId: l._id,
        title: l.title,
        orderIndex: l.orderIndex,
        courseTitle: course?.title,
        completedCount,
        rate: totalEnrollmentsCount > 0 ? Math.round((completedCount / totalEnrollmentsCount) * 100) : 0
      };
    }));

    // Sort lesson completion
    lessonCompletion.sort((a, b) => {
      if (a.courseTitle !== b.courseTitle) return (a.courseTitle || '').localeCompare(b.courseTitle || '');
      return a.orderIndex - b.orderIndex;
    });

    return {
      summary: { ...summary, totalCourses: courses.length, avgCompletion },
      enrollmentTrends: formattedTrendResult,
      quizPerformance,
      courses: courseAnalytics,
      engagement: {
        lessonCompletion
      }
    };
  }

  static async findCourseById(id: string) {
    const pipeline: any[] = [
      { $match: { _id: id } },
      { $lookup: { from: 'users', localField: 'instructorId', foreignField: '_id', as: 'instructor' } },
      { $unwind: { path: '$instructor', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'reviews', localField: '_id', foreignField: 'courseId', as: 'reviews' } },
      {
        $addFields: {
          avgRating: { $round: [{ $avg: '$reviews.rating' }, 1] },
          reviewCount: { $size: '$reviews' }
        }
      },
      {
        $project: {
          reviews: 0,
          'instructor.hashedPassword': 0,
          'instructor.refreshToken': 0,
          'instructor.verificationToken': 0,
          'instructor.resetToken': 0,
        }
      }
    ];

    const results = await Course.aggregate(pipeline);
    if (!results || results.length === 0) {
      throw new AppError('Course not found', 404);
    }

    const c = results[0];
    return {
      id: c._id,
      title: c.title,
      description: c.description,
      category: c.category,
      price: c.price,
      isPublished: c.isPublished,
      instructorId: c.instructorId,
      instructor: c.instructor ? { firstName: c.instructor.firstName, lastName: c.instructor.lastName } : null,
      avgRating: Number(c.avgRating || 0),
      reviewCount: Number(c.reviewCount || 0),
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  static async findInstructorCourses(instructorId: string) {
    return await Course.find({ instructorId });
  }

  static async togglePublish(id: string, instructorId: string, userRole?: string) {
    const query: any = { _id: id };
    if (userRole !== 'ADMIN') query.instructorId = instructorId;

    const course = await Course.findOne(query);
    if (!course) throw new AppError('Course not found or unauthorized', 404);

    course.isPublished = !course.isPublished;
    await course.save();

    await CourseSearch.indexCourse(course);

    return course;
  }

  static async updateCourse(id: string, data: any, instructorId: string, userRole?: string) {
    const query: any = { _id: id };
    if (userRole !== 'ADMIN') query.instructorId = instructorId;

    const course = await Course.findOneAndUpdate(
      query,
      { $set: data },
      { new: true }
    );

    if (!course) throw new AppError('Course not found or unauthorized', 404);

    await CourseSearch.indexCourse(course);

    return course;
  }

  static async deleteCourse(id: string, instructorId: string, userRole?: string) {
    const query: any = { _id: id };
    if (userRole !== 'ADMIN') query.instructorId = instructorId;

    const course = await Course.findOneAndDelete(query);

    if (!course) throw new AppError('Course not found or unauthorized', 404);

    await CourseSearch.removeCourse(id);
  }
}
