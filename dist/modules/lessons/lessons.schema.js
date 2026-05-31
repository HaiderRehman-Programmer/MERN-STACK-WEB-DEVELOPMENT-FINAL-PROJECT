"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLessonSchema = void 0;
const zod_1 = require("zod");
exports.createLessonSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseId: zod_1.z.string().uuid(),
        title: zod_1.z.string().min(3),
        content: zod_1.z.string().optional(),
        videoUrl: zod_1.z.string().optional(),
        isFreePreview: zod_1.z.boolean().default(false),
        orderIndex: zod_1.z.number().int().nonnegative().default(0),
    }).strict()
});
//# sourceMappingURL=lessons.schema.js.map