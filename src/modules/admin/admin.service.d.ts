export declare class AdminService {
    static getAllUsers(): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        role: string;
        email: string;
        createdAt: Date;
    }[]>;
    static updateUserRole(userId: string, role: string): Promise<{
        id: string;
        role: string;
    }>;
    static getGlobalStats(): Promise<{
        users: number;
        courses: number;
        enrollments: number;
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