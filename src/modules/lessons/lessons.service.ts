import { db } from '../../config/db';
import { coursesTable, lessonsTable, enrollmentsTable, lessonProgressTable } from '../../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { AppError } from '../../utils/AppError';

export class LessonService {
  static async createLesson(data: any, instructorId: string) {
    const { courseId, title, content, videoUrl, isFreePreview, orderIndex } = data;

    const courseArr = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
    const course = courseArr[0];
    if (!course || course.instructorId !== instructorId) {
      throw new AppError("You lack authorization to modify this course directly", 403);
    }

    const lessonId = uuidv7();
    await db.insert(lessonsTable).values({
      id: lessonId,
      courseId,
      title,
      content,
      videoUrl,
      isFreePreview,
      orderIndex,
    });

    return { id: lessonId };
  }

  static async getCourseLessons(courseId: string, userId?: string) {
    const lessons = await db
      .select()
      .from(lessonsTable)
      .where(eq(lessonsTable.courseId, courseId))
      .orderBy(asc(lessonsTable.orderIndex));

    let isEnrolled = false;
    if (userId) {
      const enrArr = await db.select().from(enrollmentsTable)
        .where(and(eq(enrollmentsTable.studentId, userId), eq(enrollmentsTable.courseId, courseId), eq(enrollmentsTable.status, 'ACTIVE')))
        .limit(1);
      if (enrArr.length > 0) isEnrolled = true;
    }

    let progressMap: Map<string, { isCompleted: boolean, lastWatchedSeconds: number }> = new Map();
    if (isEnrolled && userId) {
      const progress = await db.select({ 
        lessonId: lessonProgressTable.lessonId,
        isCompleted: lessonProgressTable.isCompleted,
        lastWatchedSeconds: lessonProgressTable.lastWatchedSeconds
      })
      .from(lessonProgressTable).where(eq(lessonProgressTable.studentId, userId));
      
      progress.forEach(p => progressMap.set(p.lessonId, { 
        isCompleted: p.isCompleted, 
        lastWatchedSeconds: p.lastWatchedSeconds 
      }));
    }

    return lessons.map((lesson) => {
      const p = progressMap.get(lesson.id);
      const lessonData = {
        ...lesson,
        isCompleted: p?.isCompleted || false,
        lastWatchedSeconds: p?.lastWatchedSeconds || 0
      };
      
      if (!lesson.isFreePreview && !isEnrolled) {
        return { ...lessonData, videoUrl: null, content: 'PROTECTED CONTENT. ENROLLMENT REQUIRED.' };
      }
      return lessonData;
    });
  }

  static async updateLesson(id: string, data: any, instructorId: string) {
    const lessonArr = await db.select({ courseId: lessonsTable.courseId }).from(lessonsTable).where(eq(lessonsTable.id, id)).limit(1);
    const lesson = lessonArr[0];
    if (!lesson) throw new AppError('Lesson not found', 404);

    const courseArr = await db.select().from(coursesTable).where(and(eq(coursesTable.id, lesson.courseId), eq(coursesTable.instructorId, instructorId))).limit(1);
    if (courseArr.length === 0) throw new AppError('Unauthorized', 403);

    const updated = await db.update(lessonsTable)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(lessonsTable.id, id)).returning();
    
    return updated[0];
  }

  static async deleteLesson(id: string, instructorId: string) {
    const lessonArr = await db.select({ courseId: lessonsTable.courseId }).from(lessonsTable).where(eq(lessonsTable.id, id)).limit(1);
    const lesson = lessonArr[0];
    if (!lesson) throw new AppError('Lesson not found', 404);

    const courseArr = await db.select().from(coursesTable).where(and(eq(coursesTable.id, lesson.courseId), eq(coursesTable.instructorId, instructorId))).limit(1);
    if (!courseArr[0]) throw new AppError('Unauthorized', 403);

    await db.delete(lessonsTable).where(eq(lessonsTable.id, id));
  }

  static async toggleCompletion(lessonId: string, studentId: string) {
    const existing = await db.select().from(lessonProgressTable)
      .where(and(eq(lessonProgressTable.lessonId, lessonId), eq(lessonProgressTable.studentId, studentId))).limit(1);

    if (existing.length > 0) {
      await db.delete(lessonProgressTable)
        .where(and(eq(lessonProgressTable.lessonId, lessonId), eq(lessonProgressTable.studentId, studentId)));
      return false;
    }

    await db.insert(lessonProgressTable).values({
      id: uuidv7(),
      studentId,
      lessonId,
      isCompleted: true
    });
    return true;
  }

  static async updateProgress(lessonId: string, studentId: string, seconds: number) {
    const existing = await db.select().from(lessonProgressTable)
      .where(and(eq(lessonProgressTable.lessonId, lessonId), eq(lessonProgressTable.studentId, studentId))).limit(1);

    if (existing.length > 0) {
      await db.update(lessonProgressTable).set({ lastWatchedSeconds: seconds })
        .where(and(eq(lessonProgressTable.lessonId, lessonId), eq(lessonProgressTable.studentId, studentId)));
    } else {
      await db.insert(lessonProgressTable).values({
        id: uuidv7(),
        studentId,
        lessonId,
        lastWatchedSeconds: seconds,
        isCompleted: false
      });
    }
  }
}
