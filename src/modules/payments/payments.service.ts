import Stripe from 'stripe';
import { db } from '../../config/db';
import { coursesTable, enrollmentsTable } from '../../db/schema';
import { eq, and } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { logger } from '../../config/logger';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export class PaymentService {
  static async createCheckout(courseId: string, studentId: string) {
    const courseArr = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
    const course = courseArr[0];

    if (!course || !course.isPublished) {
      throw new AppError('Course not found or not available', 404);
    }

    const existingEnrollment = await db.select().from(enrollmentsTable)
      .where(and(eq(enrollmentsTable.studentId, studentId), eq(enrollmentsTable.courseId, courseId)))
      .limit(1);

    if (existingEnrollment.length > 0) {
      throw new AppError('You are already enrolled in this course', 400);
    }

    if (course.price === 0) {
      await db.insert(enrollmentsTable).values({
        id: uuidv7(),
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
      metadata: { courseId: course.id, studentId: studentId },
      success_url: `http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/courses`,
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
          const existing = await db.select().from(enrollmentsTable)
            .where(and(eq(enrollmentsTable.studentId, studentId), eq(enrollmentsTable.courseId, courseId)))
            .limit(1);

          if (existing.length === 0) {
            await db.insert(enrollmentsTable).values({
              id: uuidv7(),
              courseId,
              studentId,
              status: 'ACTIVE',
            });
            logger.info({ studentId, courseId }, '✅ Enrollment confirmed via Stripe Webhook');
          } else {
            logger.warn({ studentId, courseId }, 'ℹ️ Enrollment already exists, skipping webhook insert');
          }
        } catch (dbErr) {
          logger.error({ dbErr, studentId, courseId }, '🚨 CRITICAL: Failed to create enrollment after successful payment');
          // Note: We don't throw here to avoid Stripe retrying a successful payment event multiple times if just the DB insert fails once
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
