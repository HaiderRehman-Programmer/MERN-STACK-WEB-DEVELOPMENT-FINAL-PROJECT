import { AppError } from '../../utils/AppError';
import { Course } from '../../models/Course';
import { Lesson } from '../../models/Lesson';
import { Enrollment } from '../../models/Enrollment';
import { LessonProgress } from '../../models/LessonProgress';

export class LessonService {
  static async createLesson(data: any, instructorId: string, userRole?: string) {
    const { courseId, title, content, videoUrl, isFreePreview, orderIndex } = data;

    const query: any = { _id: courseId };
    if (userRole !== 'ADMIN') query.instructorId = instructorId;

    const course = await Course.findOne(query);
    if (!course) {
      throw new AppError("You lack authorization to modify this course directly", 403);
    }

    const lesson = await Lesson.create({
      courseId,
      title,
      content,
      videoUrl,
      isFreePreview,
      orderIndex,
    });

    return { id: lesson._id };
  }

  static async getCourseLessons(courseId: string, userId?: string) {
    const lessons = await Lesson.find({ courseId }).sort({ orderIndex: 1 });

    let isEnrolled = false;
    if (userId) {
      const enrollment = await Enrollment.findOne({ studentId: userId, courseId, status: 'ACTIVE' });
      if (enrollment) isEnrolled = true;
    }

    let progressMap = new Map();
    if (isEnrolled && userId) {
      const progresses = await LessonProgress.find({ studentId: userId });
      progresses.forEach(p => progressMap.set(p.lessonId.toString(), {
        isCompleted: p.isCompleted,
        lastWatchedSeconds: p.lastWatchedSeconds
      }));
    }

    return lessons.map((lesson: any) => {
      const p = progressMap.get(lesson._id.toString());
      const lessonData = {
        ...lesson.toObject(),
        id: lesson._id,
        isCompleted: p?.isCompleted || false,
        lastWatchedSeconds: p?.lastWatchedSeconds || 0
      };

      if (!lesson.isFreePreview && !isEnrolled) {
        return { ...lessonData, videoUrl: null, content: 'PROTECTED CONTENT. ENROLLMENT REQUIRED.' };
      }
      return lessonData;
    });
  }

  static async updateLesson(id: string, data: any, instructorId: string, userRole?: string) {
    const lesson = await Lesson.findById(id);
    if (!lesson) throw new AppError('Lesson not found', 404);

    if (userRole !== 'ADMIN') {
      const course = await Course.findOne({ _id: lesson.courseId, instructorId });
      if (!course) throw new AppError('Unauthorized', 403);
    }

    const updated = await Lesson.findByIdAndUpdate(id, { $set: data }, { new: true });
    return updated;
  }

  static async deleteLesson(id: string, instructorId: string, userRole?: string) {
    const lesson = await Lesson.findById(id);
    if (!lesson) throw new AppError('Lesson not found', 404);

    if (userRole !== 'ADMIN') {
      const course = await Course.findOne({ _id: lesson.courseId, instructorId });
      if (!course) throw new AppError('Unauthorized', 403);
    }

    await Lesson.findByIdAndDelete(id);
  }

  static async toggleCompletion(lessonId: string, studentId: string) {
    const existing = await LessonProgress.findOne({ lessonId, studentId });

    // Get the lesson to find its courseId
    const lesson = await Lesson.findById(lessonId);

    if (existing) {
      await LessonProgress.findByIdAndDelete(existing._id);
      // Sync enrollment progress
      if (lesson) await this.syncEnrollmentProgress(lesson.courseId, studentId);
      return false;
    }

    await LessonProgress.create({
      studentId,
      lessonId,
      isCompleted: true
    });

    // Sync enrollment progress
    if (lesson) await this.syncEnrollmentProgress(lesson.courseId, studentId);
    return true;
  }

  private static async syncEnrollmentProgress(courseId: string, studentId: string) {
    const totalLessons = await Lesson.countDocuments({ courseId });
    if (totalLessons === 0) return;

    const lessons = await Lesson.find({ courseId }).select('_id');
    const lessonIds = lessons.map(l => l._id);

    const completedLessons = await LessonProgress.countDocuments({
      studentId,
      lessonId: { $in: lessonIds },
      isCompleted: true
    });

    const progress = Math.round((completedLessons / totalLessons) * 100);

    await Enrollment.findOneAndUpdate(
      { studentId, courseId },
      { $set: { progress, status: progress === 100 ? 'COMPLETED' : 'ACTIVE' } }
    );
  }

  static async updateProgress(lessonId: string, studentId: string, seconds: number) {
    const existing = await LessonProgress.findOne({ lessonId, studentId });

    if (existing) {
      existing.lastWatchedSeconds = seconds;
      await existing.save();
    } else {
      await LessonProgress.create({
        studentId,
        lessonId,
        lastWatchedSeconds: seconds,
        isCompleted: false
      });
    }
  }
}
