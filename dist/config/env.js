"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().default('5000'),
    DATABASE_URL: zod_1.z.string().min(1, "DATABASE_URL must be provided"),
    JWT_SECRET: zod_1.z.string().min(10),
    STRIPE_SECRET_KEY: zod_1.z.string().min(1),
    STRIPE_WEBHOOK_SECRET: zod_1.z.string().min(1),
    MEILISEARCH_HOST: zod_1.z.string().default('http://localhost:7700'),
    MEILISEARCH_API_KEY: zod_1.z.string().optional(),
}).refine((data) => {
    if (data.NODE_ENV === 'production') {
        return !data.JWT_SECRET.includes('placeholder') && !data.STRIPE_SECRET_KEY.includes('placeholder');
    }
    return true;
}, {
    message: "Production security check failed: Placeholders found in critical security keys",
    path: ["JWT_SECRET"]
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Invalid environment variables:\n', _env.error.format());
    process.exit(1);
}
exports.env = _env.data;
//# sourceMappingURL=env.js.map