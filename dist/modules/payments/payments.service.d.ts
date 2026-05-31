export declare class PaymentService {
    static createCheckout(courseId: string, studentId: string): Promise<{
        free: boolean;
        url?: never;
    } | {
        url: string | null;
        free?: never;
    }>;
    static handleWebhook(reqBody: any, signature: string): Promise<{
        received: boolean;
    }>;
    static verifySession(sessionId: string): Promise<{
        status: string;
        courseId: string | undefined;
    }>;
}
//# sourceMappingURL=payments.service.d.ts.map