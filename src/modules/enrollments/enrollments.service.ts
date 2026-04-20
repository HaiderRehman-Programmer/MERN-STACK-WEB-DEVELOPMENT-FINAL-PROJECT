import { db } from '../../config/db';
import { coursesTable, enrollmentsTable, lessonProgressTable, lessonsTable, usersTable } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { AppError } from '../../utils/AppError';

export class EnrollmentService {
  static async enroll(courseId: string, studentId: string) {
    const enrollmentId = uuidv7();

    try {
      await db.insert(enrollmentsTable).values({
        id: enrollmentId,
        courseId,
        studentId,
        status: 'ACTIVE',
      });
      return { enrollmentId };
    } catch (error: any) {
      if (error.code === '23505') {
        throw new AppError("You are already enrolled in this course.", 400);
      }
      throw error;
    }
  }

  static async getCertificateData(enrollmentId: string, userId: string) {
    const result = await db
      .select({
        enrollment: enrollmentsTable,
        courseTitle: coursesTable.title,
        studentName: sql<string>`${usersTable.firstName} || ' ' || ${usersTable.lastName}`,
      })
      .from(enrollmentsTable)
      .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
      .innerJoin(usersTable, eq(enrollmentsTable.studentId, usersTable.id))
      .where(and(eq(enrollmentsTable.id, enrollmentId), eq(enrollmentsTable.studentId, userId)))
      .limit(1);

    if (!result || result.length === 0) {
      throw new AppError('Enrollment not found or unauthorized', 404);
    }

    const data = result[0];
    if (!data) throw new AppError('Enrollment data not found', 404);
    const { enrollment } = data;

    const lessonCountResult = await db
      .select({ value: sql<number>`cast(count(*) as int)` })
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, enrollment.courseId));

    const completedCountResult = await db
      .select({ value: sql<number>`cast(count(*) as int)` })
      .from(lessonProgressTable)
      .innerJoin(lessonsTable, eq(lessonProgressTable.lessonId, lessonsTable.id))
      .where(
        and(
          eq(lessonProgressTable.studentId, userId),
          eq(lessonsTable.courseId, enrollment.courseId),
          eq(lessonProgressTable.isCompleted, true)
        )
      );

    const totalLessons = lessonCountResult[0]?.value || 0;
    const completedLessons = completedCountResult[0]?.value || 0;

    if (totalLessons === 0 || completedLessons < totalLessons) {
      throw new AppError('Course must be 100% complete to generate a certificate', 400);
    }

    return data;
  }
}
