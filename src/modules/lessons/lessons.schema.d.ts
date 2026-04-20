import { z } from 'zod';
export declare const createLessonSchema: z.ZodObject<{
    body: z.ZodObject<{
        courseId: z.ZodString;
        title: z.ZodString;
        content: z.ZodOptional<z.ZodString>;
        videoUrl: z.ZodOptional<z.ZodString>;
        isFreePreview: z.ZodDefault<z.ZodBoolean>;
        orderIndex: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strict>;
}, z.core.$strip>;
//# sourceMappingURL=lessons.schema.d.ts.map