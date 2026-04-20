import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('Health Check Integration', () => {
  it('should return 200 and system operational status', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('System Operational');
  });

  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/non-existent');
    expect(res.status).toBe(404);
  });
});
