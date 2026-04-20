import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  body: z.object({
    courseId: z.string().uuid("Invalid Course UUID format"),
  }).strict()
});
