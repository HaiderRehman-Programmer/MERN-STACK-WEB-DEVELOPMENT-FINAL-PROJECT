export declare class QuizService {
    static createOrUpdate(data: any, instructorId: string): Promise<{
        quizId: string;
    }>;
    static getByLesson(lessonId: string): Promise<{
        questions: {
            options: {
                id: string;
                text: string;
            }[];
            text: string;
            id: string;
            quizId: string;
            order: number;
        }[];
        id: string;
        createdAt: Date;
        title: string;
        lessonId: string;
        passingScore: number;
    } | null>;
    static submitAttempt(quizId: string, answers: any, studentId: string): Promise<{
        score: number;
        passed: boolean;
        correctCount: number;
        totalQuestions: number;
    }>;
}
//# sourceMappingURL=quizzes.service.d.ts.map