"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
(0, vitest_1.describe)('Auth Integration', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.restoreAllMocks();
    });
    const validUser = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123'
    };
    (0, vitest_1.describe)('POST /api/v1/auth/register', () => {
        (0, vitest_1.it)('should return 201 on successful registration', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/register')
                .send(validUser);
            if (res.status !== 201) {
                console.error('Registration failed with 500:', res.body);
            }
            (0, vitest_1.expect)(res.status).toBe(201);
            (0, vitest_1.expect)(res.body.success).toBe(true);
            (0, vitest_1.expect)(res.body.data.id).toBeDefined();
        });
        (0, vitest_1.it)('should return 400 when registration fails in service', async () => {
            // First insert
            await (0, supertest_1.default)(app_1.default).post('/api/v1/auth/register').send(validUser);
            // We should send the exact same email to trigger duplicate error
            const resDup = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/register')
                .send(validUser);
            (0, vitest_1.expect)(resDup.status).toBe(400);
            (0, vitest_1.expect)(resDup.body.error).toBe('Email is already registered');
        });
    });
    (0, vitest_1.describe)('POST /api/v1/auth/login', () => {
        vitest_1.it.skip('should set a cookie and return access token on success', async () => {
            // Create user first
            await (0, supertest_1.default)(app_1.default).post('/api/v1/auth/register').send(validUser);
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/auth/login')
                .send({ email: 'john@example.com', password: 'Password123' });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.data.accessToken).toBeDefined();
            (0, vitest_1.expect)(res.header['set-cookie']).toBeDefined();
        });
    });
});
//# sourceMappingURL=auth.integration.test.js.map