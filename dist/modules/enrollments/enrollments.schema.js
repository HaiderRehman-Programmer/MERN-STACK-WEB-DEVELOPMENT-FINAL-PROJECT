"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEnrollmentSchema = void 0;
const zod_1 = require("zod");
exports.createEnrollmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        courseId: zod_1.z.string().uuid("Invalid Course UUID format"),
    }).strict()
});
//# sourceMappingURL=enrollments.schema.js.map