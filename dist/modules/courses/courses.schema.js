"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCourseSchema = void 0;
const zod_1 = require("zod");
exports.createCourseSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5, "Title must be at least 5 characters"),
        description: zod_1.z.string().min(20, "Description must be at least 20 characters"),
        category: zod_1.z.string().optional(),
        price: zod_1.z.number().nonnegative("Price must be completely positive"),
    }).strict()
});
//# sourceMappingURL=courses.schema.js.map