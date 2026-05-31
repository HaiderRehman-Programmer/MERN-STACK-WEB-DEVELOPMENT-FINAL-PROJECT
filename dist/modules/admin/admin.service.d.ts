export declare class AdminService {
    static getAllUsers(): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        role: string;
        email: string;
        isBanned: boolean;
        createdAt: Date;
    }[]>;
    static toggleUserBan(userId: string, isBanned: boolean): Promise<{
        id: string;
        isBanned: boolean;
    }>;
    static getContentForModeration(): Promise<{
        discussions: {
            id: string;
            createdAt: Date;
            userId: string;
            content: string;
            lessonId: string;
            user: {
                firstName: string;
                lastName: string;
                id: string;
                role: string;
                avatarUrl: string | null;
                isBanned: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            lesson: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                title: string;
                courseId: string;
                content: string | null;
                videoUrl: string | null;
                isFreePreview: boolean;
                orderIndex: number;
                course: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    title: string;
                    description: string;
                    category: string;
                    price: number;
                    isPublished: boolean;
                    instructorId: string;
                };
            };
        }[];
        replies: {
            id: string;
            createdAt: Date;
            userId: string;
            content: string;
            discussionId: string;
            user: {
                firstName: string;
                lastName: string;
                id: string;
                role: string;
                avatarUrl: string | null;
                isBanned: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        }[];
    }>;
    static deleteDiscussion(id: string): Promise<void>;
    static deleteReply(id: string): Promise<void>;
    static updateUserRole(userId: string, role: string): Promise<{
        id: string;
        role: string;
    }>;
    static getGlobalStats(): Promise<{
        users: number;
        courses: number;
        enrollments: number;
    }>;
    static moderationStrike(courseId: string, reason: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static getSystemHealth(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        services: {
            database: {
                status: string;
                latency: string;
            };
            search: {
                status: string;
            };
        };
        error?: never;
    } | {
        status: string;
        timestamp: string;
        error: string;
        uptime?: never;
        services?: never;
    }>;
}
//# sourceMappingURL=admin.service.d.ts.map