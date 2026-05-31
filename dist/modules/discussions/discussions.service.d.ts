export declare class DiscussionService {
    private static checkEnrollmentForLesson;
    static createQuestion(lessonId: string, userId: string, content: string): Promise<{
        id: string;
    }>;
    static createReply(discussionId: string, userId: string, content: string): Promise<{
        id: string;
    }>;
    static deleteOwnQuestion(id: string, userId: string): Promise<void>;
    static deleteOwnReply(id: string, userId: string): Promise<void>;
    static getByLesson(lessonId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        content: string;
        lessonId: string;
        replies: {
            id: string;
            createdAt: Date;
            userId: string;
            content: string;
            discussionId: string;
            user: {
                firstName: string;
                lastName: string;
                role: string;
            };
        }[];
        user: {
            firstName: string;
            lastName: string;
            role: string;
        };
    }[]>;
}
//# sourceMappingURL=discussions.service.d.ts.map