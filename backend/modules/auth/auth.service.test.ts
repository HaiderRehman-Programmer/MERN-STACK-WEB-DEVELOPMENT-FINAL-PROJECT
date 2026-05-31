import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Tests use the real sqlite database via setup.ts

// No mocks for bcrypt or jwt so they can generate valid strings for the database

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should throw an error if email is already registered', async () => {
      // We use the real DB, so we need to insert the user first
      await AuthService.register({ email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' });

      await expect(AuthService.register({ email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' }))
        .rejects.toThrow('Email is already registered');
    });

    it('should proceed if email is unique', async () => {
      const result = await AuthService.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123'
      });

      expect(result).toHaveProperty('id');
    });
  });

  describe('login', () => {
    it('should throw error for incorrect credentials', async () => {
      await expect(AuthService.login({ email: 'wrong@test.com', password: '123' }))
        .rejects.toThrow('Incorrect email or password');
    });
  });
});
