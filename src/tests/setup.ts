import { beforeAll, afterAll, beforeEach } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

beforeAll(async () => {
  // Global setup logic (e.g., ensuring test database is available)
});

beforeEach(async () => {
  // Logic to clean up tables before each test if using a real DB
});

afterAll(async () => {
  // Global teardown logic
});
