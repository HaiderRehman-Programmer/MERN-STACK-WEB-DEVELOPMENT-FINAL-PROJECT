"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const db_1 = require("../config/db");
const schema_1 = require("../db/schema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
vitest_1.vi.mock('stripe', () => {
    return {
        default: class StripeMock {
            checkout = {
                sessions: {
                    create: vitest_1.vi.fn().mockResolvedValue({ url: 'https://stripe.com/checkout/mock' })
                }
            };
            webhooks = {
                constructEvent: vitest_1.vi.fn((body, sig) => {
                    if (sig === 'invalid')
                        throw new Error('Invalid signature');
                    return { type: 'checkout.session.completed', data: { object: { client_reference_id: 'user-123', metadata: { courseId: 'course-123' } } } };
                })
            };
        }
    };
});
(0, vitest_1.describe)('Payments Integration', () => {
    (0, vitest_1.beforeEach)(async () => {
        vitest_1.vi.clearAllMocks();
        // Seed required data for the real service to proceed without 404
        await db_1.db.insert(schema_1.usersTable).values({ id: 'user-123', firstName: 'John', lastName: 'Doe', role: 'STUDENT' });
        await db_1.db.insert(schema_1.usersTable).values({ id: 'inst-123', firstName: 'Jane', lastName: 'Doe', role: 'INSTRUCTOR' });
        await db_1.db.insert(schema_1.coursesTable).values({ id: 'course-123', title: 'Test Course', description: 'desc', instructorId: 'inst-123', price: 10, category: 'dev', isPublished: true });
    });
    (0, vitest_1.afterEach)(() => {
        vitest_1.vi.restoreAllMocks();
    });
    const mockToken = jsonwebtoken_1.default.sign({ id: 'user-123', role: 'STUDENT' }, env_1.env.JWT_SECRET);
    (0, vitest_1.describe)('POST /api/v1/payments/create-checkout', () => {
        vitest_1.it.skip('should return 200 and stripe URL on success', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/payments/create-checkout')
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ courseId: 'course-123' });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.data.url).toBe('https://stripe.com/checkout/mock');
        });
        (0, vitest_1.it)('should return 401 when no token is provided', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/payments/create-checkout')
                .send({ courseId: 'course-123' });
            (0, vitest_1.expect)(res.status).toBe(401);
        });
    });
    (0, vitest_1.describe)('POST /api/v1/payments/webhook', () => {
        vitest_1.it.skip('should return 200 on successful webhook processing', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/payments/webhook')
                .set('stripe-signature', 'mock-signature')
                .send({ type: 'checkout.session.completed' });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.received).toBe(true);
        });
        vitest_1.it.skip('should return 400 when webhook handling fails', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/payments/webhook')
                .set('stripe-signature', 'invalid')
                .send({});
            (0, vitest_1.expect)(res.status).toBe(400);
            // Stripe webhook errors in our controller return plain text
            (0, vitest_1.expect)(res.text).toContain('Invalid signature');
        });
    });
});
//# sourceMappingURL=payments.integration.test.js.map