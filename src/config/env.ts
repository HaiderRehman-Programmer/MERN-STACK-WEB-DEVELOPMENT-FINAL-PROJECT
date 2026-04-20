import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  DATABASE_URL: z.string().min(1, "DATABASE_URL must be provided"),
  JWT_SECRET: z.string().min(10),
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  MEILISEARCH_HOST: z.string().default('http://localhost:7700'),
  MEILISEARCH_API_KEY: z.string().optional(),
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

export const env = _env.data;
