export declare class DiscussionService {
    static createQuestion(lessonId: string, userId: string, content: string): Promise<{
        id: string;
    }>;
    static createReply(discussionId: string, userId: string, content: string): Promise<{
        id: string;
    }>;
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