"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(2, "First name must be at least 2 characters"),
        lastName: zod_1.z.string().min(2, "Last name must be at least 2 characters"),
        email: zod_1.z.string().email("Invalid email structure").toLowerCase(),
        password: zod_1.z.string().min(8, "Password must be at least 8 characters").refine((val) => /[A-Z]/.test(val) && /[0-9]/.test(val), {
            message: "Password must contain at least one uppercase letter and one number",
        }),
    }).strict()
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email structure").toLowerCase(),
        password: zod_1.z.string().min(1, "Password is required"),
    }).strict()
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email structure").toLowerCase(),
    }).strict()
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string().min(8, "Password must be at least 8 characters").refine((val) => /[A-Z]/.test(val) && /[0-9]/.test(val), {
            message: "Password must contain at least one uppercase letter and one number",
        }),
    }).strict()
});
//# sourceMappingURL=auth.schema.js.map