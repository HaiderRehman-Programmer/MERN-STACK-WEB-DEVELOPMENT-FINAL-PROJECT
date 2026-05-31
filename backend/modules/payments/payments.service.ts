import Stripe from 'stripe';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { logger, auditLog } from '../../config/logger';
import { Course } from '../../models/Course';
import { Enrollment } from '../../models/Enrollment';

const CLIENT_URL = env.CLIENT_URL || 'http://localhost:5000';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export class PaymentService {
  static async createCheckout(courseId: string, studentId: string) {
    const course = await Course.findById(courseId);

    if (!course || !course.isPublished) {
      throw new AppError('Course not found or not available', 404);
    }

    const existingEnrollment = await Enrollment.findOne({ studentId, courseId });

    if (existingEnrollment) {
      throw new AppError('You are already enrolled in this course', 400);
    }

    if (course.price === 0) {
      await Enrollment.create({
        courseId,
        studentId,
        status: 'ACTIVE',
      });
      return { free: true };
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: course.title,
            description: course.description.substring(0, 200),
          },
          unit_amount: Math.round(course.price * 100),
        },
        quantity: 1,
      }],
      metadata: { courseId: course._id.toString(), studentId: studentId.toString() },
      success_url: `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${CLIENT_URL}/courses`,
    });

    return { url: session.url };
  }

  static async handleWebhook(reqBody: any, signature: string) {
    let event: any;
    try {
      event = stripe.webhooks.constructEvent(reqBody, signature, env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      logger.error({ err }, '⚠️ Stripe Webhook Signature Verification Failed');
      throw new Error(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const courseId = session.metadata?.courseId;
      const studentId = session.metadata?.studentId;

      if (courseId && studentId) {
        try {
          const existing = await Enrollment.findOne({ studentId, courseId });

          if (!existing) {
            await Enrollment.create({
              courseId,
              studentId,
              status: 'ACTIVE',
            });
            auditLog('PAYMENT_SUCCESS', { studentId, courseId, stripeEventId: event.id });
          } else {
            logger.warn({ studentId, courseId, stripeEventId: event.id }, 'ℹ️ Enrollment already exists, skipping duplicate webhook event');
          }
        } catch (dbErr) {
          logger.error({ dbErr, studentId, courseId }, '🚨 CRITICAL: Failed to create enrollment after successful payment');
        }
      }
    }
    return { received: true };
  }

  static async verifySession(sessionId: string): Promise<{ status: string; courseId: string | undefined }> {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      status: session.payment_status,
      courseId: session.metadata?.courseId,
    };
  }
}
