import mongoose from 'mongoose';
import { meili } from '../../config/meilisearch';
import { CourseSearch } from '../courses/courses.search';
import { AppError } from '../../utils/AppError';
import { auditLog } from '../../config/logger';
import { User } from '../../models/User';
import { Course } from '../../models/Course';
import { Enrollment } from '../../models/Enrollment';
import { Discussion, DiscussionReply } from '../../models/Discussion';

export class AdminService {
  static async getAllUsers() {
    return await User.find()
      .select('firstName lastName email role isBanned createdAt')
      .sort({ createdAt: -1 });
  }

  static async toggleUserBan(userId: string, isBanned: boolean) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    user.isBanned = isBanned;
    await user.save();

    // If instructor is banned, unpublish all their courses
    if (isBanned && user.role === 'INSTRUCTOR') {
      const instructorCourses = await Course.find({ instructorId: userId });
      
      if (instructorCourses.length > 0) {
        await Course.updateMany({ instructorId: userId }, { $set: { isPublished: false } });

        // Sync with Search index
        instructorCourses.forEach(course => {
          CourseSearch.removeCourse(course.id).catch(err => console.error(`Failed to remove course ${course.id} from index on ban`, err));
        });
      }
    }

    return { id: userId, isBanned };
  }

  static async deleteUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (user.role === 'ADMIN') {
      throw new AppError('Cannot delete another administrator', 403);
    }

    // Cascade deletions
    if (user.role === 'INSTRUCTOR') {
      const courses = await Course.find({ instructorId: userId });
      const courseIds = courses.map(c => c._id);
      
      // Delete courses from search index
      await Promise.all(courseIds.map(id => CourseSearch.removeCourse(id.toString())));
      
      // Delete all courses by this instructor
      await Course.deleteMany({ instructorId: userId });
    }

    await Enrollment.deleteMany({ studentId: userId });
    await Discussion.deleteMany({ userId });
    await DiscussionReply.deleteMany({ userId });

    await User.findByIdAndDelete(userId);
    auditLog('USER_DELETED', { deletedUserId: userId, role: user.role });
    return { success: true, message: 'User successfully deleted' };
  }

  static async getContentForModeration() {
    // 1. Fetch Discussions
    const discussions = await Discussion.find()
      .populate('userId', 'firstName lastName')
      .populate({
        path: 'lessonId',
        populate: { path: 'courseId', select: 'title' }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedDiscussions = discussions.map((d: any) => ({
      id: d.id,
      content: d.content,
      createdAt: d.createdAt,
      user: d.userId,
      lesson: d.lessonId ? {
        id: d.lessonId.id,
        course: d.lessonId.courseId
      } : null
    }));

    // 2. Fetch Replies
    const replies = await DiscussionReply.find()
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50);

    const formattedReplies = replies.map((r: any) => ({
      id: r.id,
      content: r.content,
      createdAt: r.createdAt,
      user: r.userId
    }));

    return { discussions: formattedDiscussions, replies: formattedReplies };
  }

  static async deleteDiscussion(id: string) {
    await Discussion.findByIdAndDelete(id);
  }

  static async deleteReply(id: string) {
    await DiscussionReply.findByIdAndDelete(id);
  }

  static async updateUserRole(userId: string, role: string) {
    const validRoles = ['STUDENT', 'INSTRUCTOR', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.role = role as any;
    await user.save();
    return { id: userId, role };
  }

  static async getGlobalStats() {
    const users = await User.countDocuments();
    const courses = await Course.countDocuments();
    const enrollments = await Enrollment.countDocuments();

    return { users, courses, enrollments };
  }

  static async moderationStrike(courseId: string, reason: string) {
    const course = await Course.findById(courseId);

    if (!course) {
      throw new AppError('Course not found', 404);
    }

    // 1. Unpublish course
    course.isPublished = false;
    await course.save();

    // 2. Remove from search
    await CourseSearch.removeCourse(courseId);

    // 3. Audit log
    auditLog('COURSE_MODERATED', { courseId, title: course.title, instructorId: course.instructorId, reason });

    return { success: true, message: `Course "${course.title}" has been unpublished.` };
  }

  static async getSystemHealth() {
    const start = Date.now();
    try {
      // 1. Check DB latency
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
      }
      const dbLatency = Date.now() - start;

      // 2. Check Meilisearch
      let meiliStatus = 'offline';
      try {
        const health = await meili.isHealthy();
        if (health) meiliStatus = 'online';
      } catch (e) {
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
    } catch (error) {
      return {
        status: 'degraded',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
