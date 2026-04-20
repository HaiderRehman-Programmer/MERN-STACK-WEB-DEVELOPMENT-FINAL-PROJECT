"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const payments_service_1 = require("../modules/payments/payments.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
// Mock PaymentService
vitest_1.vi.mock('../modules/payments/payments.service', () => ({
    PaymentService: {
        createCheckout: vitest_1.vi.fn(),
        handleWebhook: vitest_1.vi.fn(),
        verifySession: vitest_1.vi.fn(),
    }
}));
(0, vitest_1.describe)('Payments Integration', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
    });
    const mockToken = jsonwebtoken_1.default.sign({ id: 'user-123', role: 'STUDENT' }, env_1.env.JWT_SECRET);
    (0, vitest_1.describe)('POST /api/v1/payments/create-checkout', () => {
        (0, vitest_1.it)('should return 200 and stripe URL on success', async () => {
            vitest_1.vi.mocked(payments_service_1.PaymentService.createCheckout).mockResolvedValue({ url: 'https://stripe.com/checkout/mock' });
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
        (0, vitest_1.it)('should return 200 on successful webhook processing', async () => {
            vitest_1.vi.mocked(payments_service_1.PaymentService.handleWebhook).mockResolvedValue({ received: true });
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/v1/payments/webhook')
                .set('stripe-signature', 'mock-signature')
                .send({ type: 'checkout.session.completed' });
            (0, vitest_1.expect)(res.status).toBe(200);
            (0, vitest_1.expect)(res.body.received).toBe(true);
        });
        (0, vitest_1.it)('should return 400 when webhook handling fails', async () => {
            vitest_1.vi.mocked(payments_service_1.PaymentService.handleWebhook).mockRejectedValue(new Error('Invalid signature'));
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