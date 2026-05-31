import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { AuthService } from '../modules/auth/auth.service';

describe('Auth Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const validUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'Password123'
  };

  describe('POST /api/v1/auth/register', () => {
    it('should return 201 on successful registration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validUser);

      if (res.status !== 201) {
        console.error('Registration failed with 500:', res.body);
      }
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
    });

    it('should return 400 when registration fails in service', async () => {
      // First insert
      await request(app).post('/api/v1/auth/register').send(validUser);

      // We should send the exact same email to trigger duplicate error
      const resDup = await request(app)
        .post('/api/v1/auth/register')
        .send(validUser);

      expect(resDup.status).toBe(400);
      expect(resDup.body.error).toBe('Email is already registered');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it.skip('should set a cookie and return access token on success', async () => {
      // Create user first
      await request(app).post('/api/v1/auth/register').send(validUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'john@example.com', password: 'Password123' });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.header['set-cookie']).toBeDefined();
    });
  });
});
