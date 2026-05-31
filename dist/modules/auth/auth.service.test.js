"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const auth_service_1 = require("./auth.service");
// Improved mocking for Drizzle chainable API
const mockSelect = vitest_1.vi.fn().mockReturnThis();
const mockFrom = vitest_1.vi.fn().mockReturnThis();
const mockWhere = vitest_1.vi.fn().mockReturnThis();
const mockLimit = vitest_1.vi.fn().mockImplementation((val) => Promise.resolve([])); // Default to empty array
const mockOrderBy = vitest_1.vi.fn().mockReturnThis();
const mockInnerJoin = vitest_1.vi.fn().mockReturnThis();
const mockValues = vitest_1.vi.fn().mockReturnThis();
const mockReturning = vitest_1.vi.fn().mockReturnThis();
// No db mock, we use the real sqlite test database
// No mocks for bcrypt or jwt so they can generate valid strings for the database
(0, vitest_1.describe)('AuthService', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('register', () => {
        (0, vitest_1.it)('should throw an error if email is already registered', async () => {
            // We use the real DB, so we need to insert the user first
            await auth_service_1.AuthService.register({ email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' });
            await (0, vitest_1.expect)(auth_service_1.AuthService.register({ email: 'test@example.com', password: 'password123', firstName: 'Test', lastName: 'User' }))
                .rejects.toThrow('Email is already registered');
        });
        (0, vitest_1.it)('should proceed if email is unique', async () => {
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
            await (0, vitest_1.expect)(auth_service_1.AuthService.login({ email: 'wrong@test.com', password: '123' }))
                .rejects.toThrow('Incorrect email or password');
        });
    });
});
//# sourceMappingURL=auth.service.test.js.map