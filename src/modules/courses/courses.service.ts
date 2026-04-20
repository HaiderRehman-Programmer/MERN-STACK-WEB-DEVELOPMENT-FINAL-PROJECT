import { db } from '../../config/db';
import { coursesTable, usersTable, reviewsTable, enrollmentsTable, quizzesTable, quizAttemptsTable, lessonsTable, lessonProgressTable } from '../../db/schema';
import { eq, and, or, ilike, sql } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { AppError } from '../../utils/AppError';
import { CourseSearch } from './courses.search';

export class CourseService {
  static async createCourse(data: any, instructorId: string) {
    const { title, description, price, category } = data;
    const courseId = uuidv7();

    await db.insert(coursesTable).values({
      id: courseId,
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

    let conditions: any[] = [eq(coursesTable.isPublished, true)];
    if (category && category !== 'All' && !searchIds) {
      conditions.push(eq(coursesTable.category, category));
    }
    if (searchIds) {
      conditions.push(sql`${coursesTable.id} IN ${searchIds}`);
    }

    const countResult = await db.select({ count: sql<number>`cast(count(*) as int)` })
      .from(coursesTable)
      .where(and(...conditions));
    
    const totalRecords = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    const coursesQuery = db
      .select({
        id: coursesTable.id,
        title: coursesTable.title,
        description: coursesTable.description,
        category: coursesTable.category,
        price: coursesTable.price,
        isPublished: coursesTable.isPublished,
        instructorId: coursesTable.instructorId,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        avgRating: sql<number>`round(cast(avg(${reviewsTable.rating}) as numeric), 1)`,
        reviewCount: sql<number>`cast(count(${reviewsTable.id}) as int)`,
      })
      .from(coursesTable)
      .innerJoin(usersTable, eq(coursesTable.instructorId, usersTable.id))
      .leftJoin(reviewsTable, eq(coursesTable.id, reviewsTable.courseId))
      .where(and(...conditions))
      .groupBy(coursesTable.id, usersTable.id)
      .limit(limit)
      .offset(offset);

    // If we have search results from Meilisearch, we want to respect their order
    let courses = await coursesQuery;
    
    if (searchIds) {
      courses = courses.sort((a, b) => searchIds!.indexOf(a.id) - searchIds!.indexOf(b.id));
    }

    const data = courses.map((c) => ({
      ...c,
      instructor: { firstName: c.firstName, lastName: c.lastName },
      avgRating: Number(c.avgRating || 0),
      reviewCount: Number(c.reviewCount || 0),
    }));

    return { data, pagination: { page, limit, totalPages, totalRecords } };
  }

  static async getInstructorAnalytics(instructorId: string) {
    const courses = await db.select().from(coursesTable).where(eq(coursesTable.instructorId, instructorId));

    const courseAnalytics = await Promise.all(
      courses.map(async (course) => {
        const enrollmentResult = await db.select({ count: sql<number>`cast(count(*) as int)` })
          .from(enrollmentsTable).where(eq(enrollmentsTable.courseId, course.id));
        
        const ratingResult = await db.select({
            avgRating: sql<number>`round(cast(avg(${reviewsTable.rating}) as numeric), 1)`,
            reviewCount: sql<number>`cast(count(*) as int)`,
          })
          .from(reviewsTable).where(eq(reviewsTable.courseId, course.id));

        const enrollments = enrollmentResult[0]?.count || 0;
        return {
          courseId: course.id,
          title: course.title,
          price: course.price,
          isPublished: course.isPublished,
          enrollments,
          revenue: Number((enrollments * course.price).toFixed(2)),
          avgRating: Number(ratingResult[0]?.avgRating || 0),
          reviewCount: Number(ratingResult[0]?.reviewCount || 0),
        };
      })
    );

    const summary = courseAnalytics.reduce((acc, c) => ({
      totalRevenue: acc.totalRevenue + c.revenue,
      totalEnrollments: acc.totalEnrollments + c.enrollments,
      publishedCourses: acc.publishedCourses + (c.isPublished ? 1 : 0)
    }), { totalRevenue: 0, totalEnrollments: 0, publishedCourses: 0 });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0,0,0,0);

    const trendResult = await db.select({
        month: sql<string>`to_char(${enrollmentsTable.purchasedAt}, 'Mon YYYY')`,
        sortKey: sql<string>`to_char(${enrollmentsTable.purchasedAt}, 'YYYY-MM')`,
        enrollments: sql<number>`cast(count(*) as int)`,
        revenue: sql<number>`cast(sum(${coursesTable.price}) as float)`
      })
      .from(enrollmentsTable)
      .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
      .where(and(
        sql`${enrollmentsTable.purchasedAt} >= ${sixMonthsAgo}`,
        eq(coursesTable.instructorId, instructorId)
      ))
      .groupBy(sql`month, sortKey`).orderBy(sql`sortKey`);

    const instructorQuizzes = await db.select({ id: quizzesTable.id, title: quizzesTable.title })
      .from(quizzesTable)
      .innerJoin(lessonsTable, eq(quizzesTable.lessonId, lessonsTable.id))
      .innerJoin(coursesTable, eq(lessonsTable.courseId, coursesTable.id))
      .where(eq(coursesTable.instructorId, instructorId));

    const quizPerformance = await Promise.all(instructorQuizzes.map(async (quiz) => {
      const attempts = await db.select({
          avgScore: sql<number>`avg(${quizAttemptsTable.score})`,
          passCount: sql<number>`cast(count(*) filter (where ${quizAttemptsTable.passed} = true) as int)`,
          totalAttempts: sql<number>`cast(count(*) as int)`
        })
        .from(quizAttemptsTable).where(eq(quizAttemptsTable.quizId, quiz.id));

      const stats = attempts[0];
      return {
        quizId: quiz.id,
        title: quiz.title,
        avgScore: Math.round(stats?.avgScore || 0),
        passRate: stats?.totalAttempts ? Math.round((stats.passCount / stats.totalAttempts) * 100) : 0,
        totalAttempts: stats?.totalAttempts || 0
      };
    }));

    // --- Engagement Metrics ---
    // 1. Avg Completion %
    const totalEnrollmentsCount = summary.totalEnrollments;
    let avgCompletion = 0;
    
    if (totalEnrollmentsCount > 0) {
      const progressResult = await db.select({
          completedCount: sql<number>`cast(count(*) as int)`
        })
        .from(lessonProgressTable)
        .innerJoin(lessonsTable, eq(lessonProgressTable.lessonId, lessonsTable.id))
        .innerJoin(coursesTable, eq(lessonsTable.courseId, coursesTable.id))
        .where(and(
          eq(coursesTable.instructorId, instructorId),
          eq(lessonProgressTable.isCompleted, true)
        ));

      const totalLessonsCountResult = await db.select({
          count: sql<number>`cast(count(*) as int)`
        })
        .from(lessonsTable)
        .innerJoin(coursesTable, eq(lessonsTable.courseId, coursesTable.id))
        .where(eq(coursesTable.instructorId, instructorId));

      const totalPossibleCompletions = (totalLessonsCountResult[0]?.count || 0) * totalEnrollmentsCount;
      if (totalPossibleCompletions > 0) {
        avgCompletion = Math.round(((progressResult[0]?.completedCount || 0) / totalPossibleCompletions) * 100);
      }
    }

    // 2. Lesson-level completion (for drop-off analysis)
    const lessonCompletion = await db.select({
        lessonId: lessonsTable.id,
        title: lessonsTable.title,
        orderIndex: lessonsTable.orderIndex,
        courseTitle: coursesTable.title,
        completedCount: sql<number>`cast(count(${lessonProgressTable.id}) as int)`
      })
      .from(lessonsTable)
      .innerJoin(coursesTable, eq(lessonsTable.courseId, coursesTable.id))
      .leftJoin(lessonProgressTable, and(
        eq(lessonsTable.id, lessonProgressTable.lessonId),
        eq(lessonProgressTable.isCompleted, true)
      ))
      .where(eq(coursesTable.instructorId, instructorId))
      .groupBy(lessonsTable.id, coursesTable.title)
      .orderBy(coursesTable.title, lessonsTable.orderIndex);

    return {
      summary: { ...summary, totalCourses: courses.length, avgCompletion },
      enrollmentTrends: trendResult,
      quizPerformance,
      courses: courseAnalytics,
      engagement: {
        lessonCompletion: lessonCompletion.map(l => ({
          ...l,
          rate: totalEnrollmentsCount > 0 ? Math.round((l.completedCount / totalEnrollmentsCount) * 100) : 0
        }))
      }
    };
  }
  
  static async findInstructorCourses(instructorId: string) {
    return await db.select().from(coursesTable).where(eq(coursesTable.instructorId, instructorId));
  }

  static async togglePublish(id: string, instructorId: string) {
    const courseArr = await db.select().from(coursesTable).where(and(eq(coursesTable.id, id), eq(coursesTable.instructorId, instructorId))).limit(1);
    const course = courseArr[0];
    if (!course) throw new AppError('Course not found or unauthorized', 404);

    const updated = await db.update(coursesTable).set({ isPublished: !course.isPublished }).where(eq(coursesTable.id, id)).returning();
    
    if (updated[0]) {
      await CourseSearch.indexCourse(updated[0]);
    }

    return updated[0];
  }

  static async updateCourse(id: string, data: any, instructorId: string) {
    const result = await db.update(coursesTable)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(coursesTable.id, id), eq(coursesTable.instructorId, instructorId)))
      .returning();

    if (result.length === 0) throw new AppError('Course not found or unauthorized', 404);
    
    await CourseSearch.indexCourse(result[0]);

    return result[0];
  }

  static async deleteCourse(id: string, instructorId: string) {
    const result = await db.delete(coursesTable)
      .where(and(eq(coursesTable.id, id), eq(coursesTable.instructorId, instructorId)))
      .returning();

    if (result.length === 0) throw new AppError('Course not found or unauthorized', 404);

    await CourseSearch.removeCourse(id);
  }
}
