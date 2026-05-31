import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./backend/tests/setup.ts'],
    hookTimeout: 300000, // Allow up to 5 minutes for first-time binary download
    testTimeout: 300000,
    coverage: {
      provider: 'v8', // Even if I installed c8, vitest prefers v8 now
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
    include: ['backend/**/*.test.ts', 'backend/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './backend'),
    },
  },
});
