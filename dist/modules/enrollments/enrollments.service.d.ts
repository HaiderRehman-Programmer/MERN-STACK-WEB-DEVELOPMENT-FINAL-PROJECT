export declare class EnrollmentService {
    static enroll(courseId: string, studentId: string): Promise<{
        enrollmentId: string;
    }>;
    static getCertificateData(enrollmentId: string, userId: string): Promise<{
        enrollment: {
            id: string;
            studentId: string;
            courseId: string;
            status: string;
            purchasedAt: Date;
        };
        courseTitle: string;
        studentName: string;
    }>;
}
//# sourceMappingURL=enrollments.service.d.ts.map