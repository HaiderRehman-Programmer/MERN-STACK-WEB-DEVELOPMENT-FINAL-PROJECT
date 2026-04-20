import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './auth.service';
import { db } from '../../config/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Improved mocking for Drizzle chainable API
const mockSelect = vi.fn().mockReturnThis();
const mockFrom = vi.fn().mockReturnThis();
const mockWhere = vi.fn().mockReturnThis();
const mockLimit = vi.fn().mockImplementation((val) => Promise.resolve([])); // Default to empty array
const mockOrderBy = vi.fn().mockReturnThis();
const mockInnerJoin = vi.fn().mockReturnThis();
const mockValues = vi.fn().mockReturnThis();
const mockReturning = vi.fn().mockReturnThis();

vi.mock('../../config/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockImplementation((val) => Promise.resolve([])),
      innerJoin: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
    })),
    update: vi.fn(() => ({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockImplementation((val) => Promise.resolve([{ id: 'updated' }])),
      returning: vi.fn().mockReturnThis(),
    })),
    insert: vi.fn(() => ({
      values: vi.fn().mockImplementation((val) => Promise.resolve([{ id: 'inserted' }])),
    })),
    transaction: vi.fn(),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
    decode: vi.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('should throw an error if email is already registered', async () => {
      // Re-mock specifically for this test
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 'existing-id' }]),
      });

      await expect(AuthService.register({ email: 'test@example.com' }))
        .rejects.toThrow('Email is already registered');
    });

    it('should proceed if email is unique', async () => {
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      (bcrypt.hash as any).mockResolvedValue('hashed-pass');
      
      (db.transaction as any).mockImplementation(async (cb: any) => {
        return cb({ 
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockResolvedValue(true)
        });
      });

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
      (db.select as any).mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      await expect(AuthService.login({ email: 'wrong@test.com', password: '123' }))
        .rejects.toThrow('Incorrect email or password');
    });
  });
});
