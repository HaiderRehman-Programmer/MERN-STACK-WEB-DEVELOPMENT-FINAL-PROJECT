import { z } from 'zod';

export const createLessonSchema = z.object({
  body: z.object({
    courseId: z.string().uuid(),
    title: z.string().min(3),
    content: z.string().optional(),
    videoUrl: z.string().optional(),
    isFreePreview: z.boolean().default(false),
    orderIndex: z.number().int().nonnegative().default(0),
  }).strict()
});
