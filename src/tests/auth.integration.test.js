"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const auth_service_1 = require("../modules/auth/auth.service");
// Mock the AuthService using the hoisted mock pattern
vitest_1.vi.mock('../modules/auth/auth.service', () => ({
    AuthService: {
        register: vitest_1.vi.fn(),
        login: vitest_1.vi.fn(),
        refresh: vitest_1.vi.fn(),
        forgotPassword: vitest_1.vi.fn(),
        resetPassword: vitest_1.vi.fn(),
        clearRefreshToken: vitest_1.vi.fn(),
    }
}));
(0, vitest_1.describe)('Auth Integration', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    const validUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123'
    };
    (0, vitest_1.describe)('POST /api/v1/auth/register', () => {
        (0, vitest_1.it)('should return 201 on successful registration', async () => {
            vitest_1.vi.mocked(auth_service_1.AuthService.register).mockResolvedValue({ id: 'user-123' });
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/register')
                .send(validUser);
            (0, vitest_1.expect)(res.status).toBe(201);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.id).toBe('user-123');
        });
        (0, vitest_1.it)('should return 400 when registration fails in service', async () => {
            // Mocking a reject with an object that the error handler handles
            vitest_1.vi.mocked(auth_service_1.AuthService.register).mockRejectedValue({
                message: 'Email is already registered',
                statusCode: 400,
                isOperational: true
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/register')
                .send({ ...validUser, email: 'duplicate@test.com' });
            (0, vitest_1.expect)(res.status).toBe(400);
            (0, vitest_1.expect)(res.body.error).toBe('Email is already registered');
        });
    });
    (0, vitest_1.describe)('POST /api/v1/auth/login', () => {
        (0, vitest_1.it)('should set a cookie and return access token on success', async () => {
            vitest_1.vi.mocked(auth_service_1.AuthService.login).mockResolvedValue({
                accessToken: 'mock-access-token',
                refreshToken: 'mock-refresh-token',
                user: { id: 'user-123', firstName: 'John', lastName: 'Doe', role: 'STUDENT', createdAt: new Date(), updatedAt: new Date() }
            });
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/login')
                .send({ email: 'john@example.com', password: 'Password123' });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.data.accessToken).toBe('mock-access-token');
            (0, vitest_1.expect)(res.header['set-cookie']).toBeDefined();
        });
    });
});
//# sourceMappingURL=auth.integration.test.js.map