"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuidv7_1 = require("uuidv7");
const AppError_1 = require("../../utils/AppError");
const courses_search_1 = require("./courses.search");
class CourseService {
    static async createCourse(data, instructorId) {
        const { title, description, price, category } = data;
        const courseId = (0, uuidv7_1.uuidv7)();
        await db_1.db.insert(schema_1.coursesTable).values({
            id: courseId,
            title,
            description,
            price,
            category: category || 'Uncategorized',
            instructorId,
            isPublished: false,
        });
        const newCourse = { id: courseId, title, description, price, category, isPublished: false };
        await courses_search_1.CourseSearch.indexCourse(newCourse);
        return newCourse;
    }
    static async findCourses(queryParams) {
        const { search, category, page = 1, limit = 9 } = queryParams;
        const offset = (page - 1) * limit;
        let searchIds = null;
        if (search) {
            searchIds = await courses_search_1.CourseSearch.searchCourses(search, category);
            if (!searchIds || searchIds.length === 0) {
                return { data: [], pagination: { page, limit, totalPages: 0, totalRecords: 0 } };
            }
        }
        let conditions = [(0, drizzle_orm_1.eq)(schema_1.coursesTable.isPublished, true)];
        if (category && category !== 'All' && !searchIds) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.coursesTable.category, category));
        }
        if (searchIds) {
            conditions.push((0, drizzle_orm_1.sql) `${schema_1.coursesTable.id} IN ${searchIds}`);
        }
        const countResult = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(schema_1.coursesTable)
            .where((0, drizzle_orm_1.and)(...conditions));
        const totalRecords = countResult[0]?.count || 0;
        const totalPages = Math.ceil(totalRecords / limit) || 1;
        const coursesQuery = db_1.db
            .select({
            id: schema_1.coursesTable.id,
            title: schema_1.coursesTable.title,
            description: schema_1.coursesTable.description,
            category: schema_1.coursesTable.category,
            price: schema_1.coursesTable.price,
            isPublished: schema_1.coursesTable.isPublished,
            instructorId: schema_1.coursesTable.instructorId,
            firstName: schema_1.usersTable.firstName,
            lastName: schema_1.usersTable.lastName,
            avgRating: (0, drizzle_orm_1.sql) `round(cast(avg(${schema_1.reviewsTable.rating}) as numeric), 1)`,
            reviewCount: (0, drizzle_orm_1.sql) `cast(count(${schema_1.reviewsTable.id}) as int)`,
        })
            .from(schema_1.coursesTable)
            .innerJoin(schema_1.usersTable, (0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, schema_1.usersTable.id))
            .leftJoin(schema_1.reviewsTable, (0, drizzle_orm_1.eq)(schema_1.coursesTable.id, schema_1.reviewsTable.courseId))
            .where((0, drizzle_orm_1.and)(...conditions))
            .groupBy(schema_1.coursesTable.id, schema_1.usersTable.id)
            .limit(limit)
            .offset(offset);
        // If we have search results from Meilisearch, we want to respect their order
        let courses = await coursesQuery;
        if (searchIds) {
            courses = courses.sort((a, b) => searchIds.indexOf(a.id) - searchIds.indexOf(b.id));
        }
        const data = courses.map((c) => ({
            ...c,
            instructor: { firstName: c.firstName, lastName: c.lastName },
            avgRating: Number(c.avgRating || 0),
            reviewCount: Number(c.reviewCount || 0),
        }));
        return { data, pagination: { page, limit, totalPages, totalRecords } };
    }
    static async getInstructorAnalytics(instructorId) {
        const courses = await db_1.db.select().from(schema_1.coursesTable).where((0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, instructorId));
        const courseAnalytics = await Promise.all(courses.map(async (course) => {
            const enrollmentResult = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
                .from(schema_1.enrollmentsTable).where((0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.courseId, course.id));
            const ratingResult = await db_1.db.select({
                avgRating: (0, drizzle_orm_1.sql) `round(cast(avg(${schema_1.reviewsTable.rating}) as numeric), 1)`,
                reviewCount: (0, drizzle_orm_1.sql) `cast(count(*) as int)`,
            })
                .from(schema_1.reviewsTable).where((0, drizzle_orm_1.eq)(schema_1.reviewsTable.courseId, course.id));
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
        const trendResult = await db_1.db.select({
            month: (0, drizzle_orm_1.sql) `to_char(${schema_1.enrollmentsTable.purchasedAt}, 'Mon YYYY')`,
            sortKey: (0, drizzle_orm_1.sql) `to_char(${schema_1.enrollmentsTable.purchasedAt}, 'YYYY-MM')`,
            enrollments: (0, drizzle_orm_1.sql) `cast(count(*) as int)`,
            revenue: (0, drizzle_orm_1.sql) `cast(sum(${schema_1.coursesTable.price}) as float)`
        })
            .from(schema_1.enrollmentsTable)
            .innerJoin(schema_1.coursesTable, (0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.courseId, schema_1.coursesTable.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.enrollmentsTable.purchasedAt} >= ${sixMonthsAgo}`, (0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, instructorId)))
            .groupBy((0, drizzle_orm_1.sql) `month, sortKey`).orderBy((0, drizzle_orm_1.sql) `sortKey`);
        const instructorQuizzes = await db_1.db.select({ id: schema_1.quizzesTable.id, title: schema_1.quizzesTable.title })
            .from(schema_1.quizzesTable)
            .innerJoin(schema_1.lessonsTable, (0, drizzle_orm_1.eq)(schema_1.quizzesTable.lessonId, schema_1.lessonsTable.id))
            .innerJoin(schema_1.coursesTable, (0, drizzle_orm_1.eq)(schema_1.lessonsTable.courseId, schema_1.coursesTable.id))
            .where((0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, instructorId));
        const quizPerformance = await Promise.all(instructorQuizzes.map(async (quiz) => {
            const attempts = await db_1.db.select({
                avgScore: (0, drizzle_orm_1.sql) `avg(${schema_1.quizAttemptsTable.score})`,
                passCount: (0, drizzle_orm_1.sql) `cast(count(*) filter (where ${schema_1.quizAttemptsTable.passed} = true) as int)`,
                totalAttempts: (0, drizzle_orm_1.sql) `cast(count(*) as int)`
            })
                .from(schema_1.quizAttemptsTable).where((0, drizzle_orm_1.eq)(schema_1.quizAttemptsTable.quizId, quiz.id));
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
            const progressResult = await db_1.db.select({
                completedCount: (0, drizzle_orm_1.sql) `cast(count(*) as int)`
            })
                .from(schema_1.lessonProgressTable)
                .innerJoin(schema_1.lessonsTable, (0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.lessonId, schema_1.lessonsTable.id))
                .innerJoin(schema_1.coursesTable, (0, drizzle_orm_1.eq)(schema_1.lessonsTable.courseId, schema_1.coursesTable.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, instructorId), (0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.isCompleted, true)));
            const totalLessonsCountResult = await db_1.db.select({
                count: (0, drizzle_orm_1.sql) `cast(count(*) as int)`
            })
                .from(schema_1.lessonsTable)
                .innerJoin(schema_1.coursesTable, (0, drizzle_orm_1.eq)(schema_1.lessonsTable.courseId, schema_1.coursesTable.id))
                .where((0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, instructorId));
            const totalPossibleCompletions = (totalLessonsCountResult[0]?.count || 0) * totalEnrollmentsCount;
            if (totalPossibleCompletions > 0) {
                avgCompletion = Math.round(((progressResult[0]?.completedCount || 0) / totalPossibleCompletions) * 100);
            }
        }
        // 2. Lesson-level completion (for drop-off analysis)
        const lessonCompletion = await db_1.db.select({
            lessonId: schema_1.lessonsTable.id,
            title: schema_1.lessonsTable.title,
            orderIndex: schema_1.lessonsTable.orderIndex,
            courseTitle: schema_1.coursesTable.title,
            completedCount: (0, drizzle_orm_1.sql) `cast(count(${schema_1.lessonProgressTable.id}) as int)`
        })
            .from(schema_1.lessonsTable)
            .innerJoin(schema_1.coursesTable, (0, drizzle_orm_1.eq)(schema_1.lessonsTable.courseId, schema_1.coursesTable.id))
            .leftJoin(schema_1.lessonProgressTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.lessonsTable.id, schema_1.lessonProgressTable.lessonId), (0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.isCompleted, true)))
            .where((0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, instructorId))
            .groupBy(schema_1.lessonsTable.id, schema_1.coursesTable.title)
            .orderBy(schema_1.coursesTable.title, schema_1.lessonsTable.orderIndex);
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
    static async findInstructorCourses(instructorId) {
        return await db_1.db.select().from(schema_1.coursesTable).where((0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, instructorId));
    }
    static async togglePublish(id, instructorId) {
        const courseArr = await db_1.db.select().from(schema_1.coursesTable).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coursesTable.id, id), (0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, instructorId))).limit(1);
        const course = courseArr[0];
        if (!course)
            throw new AppError_1.AppError('Course not found or unauthorized', 404);
        const updated = await db_1.db.update(schema_1.coursesTable).set({ isPublished: !course.isPublished }).where((0, drizzle_orm_1.eq)(schema_1.coursesTable.id, id)).returning();
        if (updated[0]) {
            await courses_search_1.CourseSearch.indexCourse(updated[0]);
        }
        return updated[0];
    }
    static async updateCourse(id, data, instructorId) {
        const result = await db_1.db.update(schema_1.coursesTable)
            .set({ ...data, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coursesTable.id, id), (0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, instructorId)))
            .returning();
        if (result.length === 0)
            throw new AppError_1.AppError('Course not found or unauthorized', 404);
        await courses_search_1.CourseSearch.indexCourse(result[0]);
        return result[0];
    }
    static async deleteCourse(id, instructorId) {
        const result = await db_1.db.delete(schema_1.coursesTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.coursesTable.id, id), (0, drizzle_orm_1.eq)(schema_1.coursesTable.instructorId, instructorId)))
            .returning();
        if (result.length === 0)
            throw new AppError_1.AppError('Course not found or unauthorized', 404);
        await courses_search_1.CourseSearch.removeCourse(id);
    }
}
exports.CourseService = CourseService;
//# sourceMappingURL=courses.service.js.map