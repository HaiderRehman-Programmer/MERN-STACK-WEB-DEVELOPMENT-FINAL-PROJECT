import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { AuthService } from '../modules/auth/auth.service';

// Mock the AuthService using the hoisted mock pattern
vi.mock('../modules/auth/auth.service', () => ({
  AuthService: {
    register: vi.fn(),
    login: vi.fn(),
    refresh: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    clearRefreshToken: vi.fn(),
  }
}));

describe('Auth Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validUser = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'Password123'
  };

  describe('POST /api/v1/auth/register', () => {
    it('should return 201 on successful registration', async () => {
      vi.mocked(AuthService.register).mockResolvedValue({ id: 'user-123' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('user-123');
    });

    it('should return 400 when registration fails in service', async () => {
      // Mocking a reject with an object that the error handler handles
      vi.mocked(AuthService.register).mockRejectedValue({
        message: 'Email is already registered',
        statusCode: 400,
        isOperational: true
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validUser, email: 'duplicate@test.com' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email is already registered');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should set a cookie and return access token on success', async () => {
      vi.mocked(AuthService.login).mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: { id: 'user-123', firstName: 'John', lastName: 'Doe', role: 'STUDENT', createdAt: new Date(), updatedAt: new Date() }
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'john@example.com', password: 'Password123' });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBe('mock-access-token');
      expect(res.header['set-cookie']).toBeDefined();
    });
  });
});
