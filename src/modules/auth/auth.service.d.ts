export declare class AuthService {
    static register(data: any): Promise<{
        id: string;
    }>;
    static login(data: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            firstName: string;
            lastName: string;
            role: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    static refresh(refreshToken: string): Promise<{
        accessToken: string;
    }>;
    static forgotPassword(email: string): Promise<void>;
    static resetPassword(token: string, password: any): Promise<void>;
    static clearRefreshToken(refreshToken: string): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map