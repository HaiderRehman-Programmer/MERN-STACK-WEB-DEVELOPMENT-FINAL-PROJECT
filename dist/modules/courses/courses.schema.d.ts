import { z } from 'zod';
export declare const createCourseSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodString;
        category: z.ZodOptional<z.ZodString>;
        price: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strip>;
//# sourceMappingURL=courses.schema.d.ts.map