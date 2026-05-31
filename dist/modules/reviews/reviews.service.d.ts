export declare class ReviewService {
    static createOrUpdate(data: any, studentId: string): Promise<{
        updated: boolean;
        data: {
            id: string;
            createdAt: Date;
            studentId: string;
            courseId: string;
            rating: number;
            comment: string | null;
        } | undefined;
        id?: never;
    } | {
        updated: boolean;
        id: string;
        data?: never;
    }>;
    static getCourseReviews(courseId: string): Promise<{
        id: string;
        rating: number;
        comment: string | null;
        createdAt: Date;
        studentFirstName: string;
        studentLastName: string;
    }[]>;
    static deleteReview(reviewId: string, studentId: string): Promise<void>;
}
//# sourceMappingURL=reviews.service.d.ts.map