import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { PaymentService } from '../modules/payments/payments.service';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

// Mock PaymentService
vi.mock('../modules/payments/payments.service', () => ({
  PaymentService: {
    createCheckout: vi.fn(),
    handleWebhook: vi.fn(),
    verifySession: vi.fn(),
  }
}));

describe('Payments Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockToken = jwt.sign({ id: 'user-123', role: 'STUDENT' }, env.JWT_SECRET);

  describe('POST /api/v1/payments/create-checkout', () => {
    it('should return 200 and stripe URL on success', async () => {
      vi.mocked(PaymentService.createCheckout).mockResolvedValue({ url: 'https://stripe.com/checkout/mock' });

      const res = await request(app)
        .post('/api/v1/payments/create-checkout')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ courseId: 'course-123' });
      
      expect(res.status).toBe(200);
      expect(res.body.data.url).toBe('https://stripe.com/checkout/mock');
    });

    it('should return 401 when no token is provided', async () => {
      const res = await request(app)
        .post('/api/v1/payments/create-checkout')
        .send({ courseId: 'course-123' });
      
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/payments/webhook', () => {
    it('should return 200 on successful webhook processing', async () => {
      vi.mocked(PaymentService.handleWebhook).mockResolvedValue({ received: true });

      const res = await request(app)
        .post('/api/v1/payments/webhook')
        .set('stripe-signature', 'mock-signature')
        .send({ type: 'checkout.session.completed' });

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
    });

    it('should return 400 when webhook handling fails', async () => {
      vi.mocked(PaymentService.handleWebhook).mockRejectedValue(new Error('Invalid signature'));

      const res = await request(app)
        .post('/api/v1/payments/webhook')
        .set('stripe-signature', 'invalid')
        .send({});

      expect(res.status).toBe(400);
      // Stripe webhook errors in our controller return plain text
      expect(res.text).toContain('Invalid signature');
    });
  });
});
