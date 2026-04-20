"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const auth_service_1 = require("./auth.service");
const db_1 = require("../../config/db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Improved mocking for Drizzle chainable API
const mockSelect = vitest_1.vi.fn().mockReturnThis();
const mockFrom = vitest_1.vi.fn().mockReturnThis();
const mockWhere = vitest_1.vi.fn().mockReturnThis();
const mockLimit = vitest_1.vi.fn().mockImplementation((val) => Promise.resolve([])); // Default to empty array
const mockOrderBy = vitest_1.vi.fn().mockReturnThis();
const mockInnerJoin = vitest_1.vi.fn().mockReturnThis();
const mockValues = vitest_1.vi.fn().mockReturnThis();
const mockReturning = vitest_1.vi.fn().mockReturnThis();
vitest_1.vi.mock('../../config/db', () => ({
    db: {
        select: vitest_1.vi.fn(() => ({
            from: vitest_1.vi.fn().mockReturnThis(),
            where: vitest_1.vi.fn().mockReturnThis(),
            limit: vitest_1.vi.fn().mockImplementation((val) => Promise.resolve([])),
            innerJoin: vitest_1.vi.fn().mockReturnThis(),
            orderBy: vitest_1.vi.fn().mockReturnThis(),
        })),
        update: vitest_1.vi.fn(() => ({
            set: vitest_1.vi.fn().mockReturnThis(),
            where: vitest_1.vi.fn().mockImplementation((val) => Promise.resolve([{ id: 'updated' }])),
            returning: vitest_1.vi.fn().mockReturnThis(),
        })),
        insert: vitest_1.vi.fn(() => ({
            values: vitest_1.vi.fn().mockImplementation((val) => Promise.resolve([{ id: 'inserted' }])),
        })),
        transaction: vitest_1.vi.fn(),
    },
}));
vitest_1.vi.mock('bcryptjs', () => ({
    default: {
        hash: vitest_1.vi.fn(),
        compare: vitest_1.vi.fn(),
    },
}));
vitest_1.vi.mock('jsonwebtoken', () => ({
    default: {
        sign: vitest_1.vi.fn(),
        verify: vitest_1.vi.fn(),
        decode: vitest_1.vi.fn(),
    },
}));
(0, vitest_1.describe)('AuthService', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('register', () => {
        (0, vitest_1.it)('should throw an error if email is already registered', async () => {
            // Re-mock specifically for this test
            db_1.db.select.mockReturnValueOnce({
                from: vitest_1.vi.fn().mockReturnThis(),
                where: vitest_1.vi.fn().mockReturnThis(),
                limit: vitest_1.vi.fn().mockResolvedValue([{ id: 'existing-id' }]),
            });
            await (0, vitest_1.expect)(auth_service_1.AuthService.register({ email: 'test@example.com' }))
                .rejects.toThrow('Email is already registered');
        });
        (0, vitest_1.it)('should proceed if email is unique', async () => {
            db_1.db.select.mockReturnValueOnce({
                from: vitest_1.vi.fn().mockReturnThis(),
                where: vitest_1.vi.fn().mockReturnThis(),
                limit: vitest_1.vi.fn().mockResolvedValue([]),
            });
            bcryptjs_1.default.hash.mockResolvedValue('hashed-pass');
            db_1.db.transaction.mockImplementation(async (cb) => {
                return cb({
                    insert: vitest_1.vi.fn().mockReturnThis(),
                    values: vitest_1.vi.fn().mockResolvedValue(true)
                });
            });
            const result = await auth_service_1.AuthService.register({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password123'
            });
            (0, vitest_1.expect)(result).toHaveProperty('id');
        });
    });
    (0, vitest_1.describe)('login', () => {
        (0, vitest_1.it)('should throw error for incorrect credentials', async () => {
            db_1.db.select.mockReturnValueOnce({
                from: vitest_1.vi.fn().mockReturnThis(),
                where: vitest_1.vi.fn().mockReturnThis(),
                limit: vitest_1.vi.fn().mockResolvedValue([]),
            });
            await (0, vitest_1.expect)(auth_service_1.AuthService.login({ email: 'wrong@test.com', password: '123' }))
                .rejects.toThrow('Incorrect email or password');
        });
    });
});
//# sourceMappingURL=auth.service.test.js.map