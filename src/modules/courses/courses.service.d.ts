export declare class CourseService {
    static createCourse(data: any, instructorId: string): Promise<{
        id: string;
        title: any;
        description: any;
        price: any;
        category: any;
        isPublished: boolean;
    }>;
    static findCourses(queryParams: any): Promise<{
        data: {
            instructor: {
                firstName: string;
                lastName: string;
            };
            avgRating: number;
            reviewCount: number;
            id: string;
            title: string;
            description: string;
            category: string;
            price: number;
            isPublished: boolean;
            instructorId: string;
            firstName: string;
            lastName: string;
        }[];
        pagination: {
            page: any;
            limit: any;
            totalPages: number;
            totalRecords: number;
        };
    }>;
    static getInstructorAnalytics(instructorId: string): Promise<{
        summary: {
            totalCourses: number;
            avgCompletion: number;
            totalRevenue: number;
            totalEnrollments: number;
            publishedCourses: number;
        };
        enrollmentTrends: {
            month: string;
            sortKey: string;
            enrollments: number;
            revenue: number;
        }[];
        quizPerformance: {
            quizId: string;
            title: string;
            avgScore: number;
            passRate: number;
            totalAttempts: number;
        }[];
        courses: {
            courseId: string;
            title: string;
            price: number;
            isPublished: boolean;
            enrollments: number;
            revenue: number;
            avgRating: number;
            reviewCount: number;
        }[];
        engagement: {
            lessonCompletion: {
                rate: number;
                lessonId: string;
                title: string;
                orderIndex: number;
                courseTitle: string;
                completedCount: number;
            }[];
        };
    }>;
    static findInstructorCourses(instructorId: string): Promise<{
        id: string;
        title: string;
        description: string;
        category: string;
        price: number;
        isPublished: boolean;
        instructorId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    static togglePublish(id: string, instructorId: string): Promise<{
        id: string;
        title: string;
        description: string;
        category: string;
        price: number;
        isPublished: boolean;
        instructorId: string;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    static updateCourse(id: string, data: any, instructorId: string): Promise<{
        id: string;
        title: string;
        description: string;
        category: string;
        price: number;
        isPublished: boolean;
        instructorId: string;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    static deleteCourse(id: string, instructorId: string): Promise<void>;
}
//# sourceMappingURL=courses.service.d.ts.map