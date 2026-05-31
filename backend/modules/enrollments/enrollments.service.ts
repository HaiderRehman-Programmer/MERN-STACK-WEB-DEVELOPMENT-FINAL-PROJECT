import { AppError } from '../../utils/AppError';
import { auditLog } from '../../config/logger';
import { Course } from '../../models/Course';
import { Enrollment } from '../../models/Enrollment';
import { Lesson } from '../../models/Lesson';
import { LessonProgress } from '../../models/LessonProgress';

export class EnrollmentService {
  static async enroll(courseId: string, studentId: string) {
    const course = await Course.findById(courseId);
    if (!course || !course.isPublished) {
      throw new AppError('Course is not available for enrollment', 400);
    }

    try {
      const enrollment = await Enrollment.create({
        courseId,
        studentId,
        status: 'ACTIVE',
      });

      auditLog('ENROLLMENT_CREATED', { studentId, courseId });
      return { enrollmentId: enrollment._id };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError("You are already enrolled in this course.", 400);
      }
      throw error;
    }
  }

  static async getCertificateData(enrollmentId: string, userId: string) {
    const enrollment = await Enrollment.findOne({ _id: enrollmentId, studentId: userId })
      .populate('courseId', 'title')
      .populate('studentId', 'firstName lastName');

    if (!enrollment) {
      throw new AppError('Enrollment not found or unauthorized', 404);
    }

    const courseObj = enrollment.courseId as any;
    const studentObj = enrollment.studentId as any;

    const courseIdString = courseObj._id || courseObj;

    const totalLessons = await Lesson.countDocuments({ courseId: courseIdString });
    
    // Find all lessons for this course to check progress
    const lessons = await Lesson.find({ courseId: courseIdString }).select('_id');
    const lessonIds = lessons.map(l => l._id);

    const completedLessons = await LessonProgress.countDocuments({
      studentId: userId,
      lessonId: { $in: lessonIds },
      isCompleted: true
    });

    if (totalLessons === 0 || completedLessons < totalLessons) {
      throw new AppError('Course must be 100% complete to generate a certificate', 400);
    }

    return {
      enrollment,
      courseTitle: courseObj.title,
      studentName: `${studentObj.firstName} ${studentObj.lastName}`
    };
  }
}
