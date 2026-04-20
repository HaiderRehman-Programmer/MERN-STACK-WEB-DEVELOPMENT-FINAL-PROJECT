export declare class LessonService {
    static createLesson(data: any, instructorId: string): Promise<{
        id: string;
    }>;
    static getCourseLessons(courseId: string, userId?: string): Promise<{
        isCompleted: boolean;
        lastWatchedSeconds: number;
        id: string;
        title: string;
        content: string | null;
        videoUrl: string | null;
        isFreePreview: boolean;
        orderIndex: number;
        courseId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    static updateLesson(id: string, data: any, instructorId: string): Promise<{
        id: string;
        title: string;
        content: string | null;
        videoUrl: string | null;
        isFreePreview: boolean;
        orderIndex: number;
        courseId: string;
        createdAt: Date;
        updatedAt: Date;
    } | undefined>;
    static deleteLesson(id: string, instructorId: string): Promise<void>;
    static toggleCompletion(lessonId: string, studentId: string): Promise<boolean>;
    static updateProgress(lessonId: string, studentId: string, seconds: number): Promise<void>;
}
//# sourceMappingURL=lessons.service.d.ts.map