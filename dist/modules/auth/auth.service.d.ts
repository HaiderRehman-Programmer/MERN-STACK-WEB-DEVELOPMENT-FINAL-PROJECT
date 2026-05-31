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
            avatarUrl: string | null;
            isBanned: boolean;
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
    static updateProfile(userId: string, data: {
        firstName?: string;
        lastName?: string;
    }): Promise<{
        success: boolean;
    }>;
    static changePassword(userId: string, data: any): Promise<{
        success: boolean;
    }>;
    static verifyEmail(token: string): Promise<{
        success: boolean;
    }>;
    static updateAvatar(userId: string, filename: string): Promise<{
        success: boolean;
        avatarUrl: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map