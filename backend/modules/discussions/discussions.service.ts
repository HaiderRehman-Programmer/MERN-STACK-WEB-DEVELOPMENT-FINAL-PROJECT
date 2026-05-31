import { AppError } from '../../utils/AppError';
import { Course } from '../../models/Course';
import { Lesson } from '../../models/Lesson';
import { Discussion, DiscussionReply } from '../../models/Discussion';
import { Enrollment } from '../../models/Enrollment';

export class DiscussionService {
  private static async checkEnrollmentForLesson(lessonId: string, userId: string) {
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) throw new AppError('Lesson not found', 404);

    const course = await Course.findById(lesson.courseId);
    if (!course) throw new AppError('Course not found', 404);

    if (course.instructorId === userId) return;

    const enrollment = await Enrollment.findOne({ courseId: course._id, studentId: userId });

    if (!enrollment) {
      throw new AppError('You must be enrolled in this course to participate in discussions', 403);
    }
  }

  static async createQuestion(lessonId: string, userId: string, content: string) {
    await this.checkEnrollmentForLesson(lessonId, userId);
    
    const discussion = await Discussion.create({ lessonId, userId, content });
    return { id: discussion._id };
  }

  static async createReply(discussionId: string, userId: string, content: string) {
    const disc = await Discussion.findById(discussionId);
    if (!disc) throw new AppError('Discussion thread not found', 404);

    await this.checkEnrollmentForLesson(disc.lessonId, userId);

    const reply = await DiscussionReply.create({ discussionId, userId, content });
    return { id: reply._id };
  }

  static async deleteOwnQuestion(id: string, userId: string) {
    const result = await Discussion.findOneAndDelete({ _id: id, userId });
    if (!result) throw new AppError('Not authorized or message not found', 403);
  }

  static async deleteOwnReply(id: string, userId: string) {
    const result = await DiscussionReply.findOneAndDelete({ _id: id, userId });
    if (!result) throw new AppError('Not authorized or reply not found', 403);
  }

  static async getByLesson(lessonId: string) {
    const discussions = await Discussion.find({ lessonId })
      .sort({ createdAt: -1 })
      .populate('userId', 'firstName lastName role')
      .populate({
        path: 'replies',
        options: { sort: { createdAt: 1 } },
        populate: { path: 'userId', select: 'firstName lastName role' }
      });

    return discussions.map((d: any) => ({
      id: d._id,
      lessonId: d.lessonId,
      userId: d.userId ? d.userId._id : null,
      content: d.content,
      createdAt: d.createdAt,
      user: d.userId ? { firstName: d.userId.firstName, lastName: d.userId.lastName, role: d.userId.role } : null,
      replies: d.replies ? d.replies.map((r: any) => ({
        id: r._id,
        discussionId: r.discussionId,
        userId: r.userId ? r.userId._id : null,
        content: r.content,
        createdAt: r.createdAt,
        user: r.userId ? { firstName: r.userId.firstName, lastName: r.userId.lastName, role: r.userId.role } : null
      })) : []
    }));
  }
}
