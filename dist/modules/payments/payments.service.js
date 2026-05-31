"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const uuidv7_1 = require("uuidv7");
const env_1 = require("../../config/env");
const AppError_1 = require("../../utils/AppError");
const logger_1 = require("../../config/logger");
const stripe = new stripe_1.default(env_1.env.STRIPE_SECRET_KEY);
class PaymentService {
    static async createCheckout(courseId, studentId) {
        const courseArr = await db_1.db.select().from(schema_1.coursesTable).where((0, drizzle_orm_1.eq)(schema_1.coursesTable.id, courseId)).limit(1);
        const course = courseArr[0];
        if (!course || !course.isPublished) {
            throw new AppError_1.AppError('Course not found or not available', 404);
        }
        const existingEnrollment = await db_1.db.select().from(schema_1.enrollmentsTable)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.studentId, studentId), (0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.courseId, courseId)))
            .limit(1);
        if (existingEnrollment.length > 0) {
            throw new AppError_1.AppError('You are already enrolled in this course', 400);
        }
        if (course.price === 0) {
            await db_1.db.insert(schema_1.enrollmentsTable).values({
                id: (0, uuidv7_1.uuidv7)(),
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
    static async handleWebhook(reqBody, signature) {
        let event;
        try {
            event = stripe.webhooks.constructEvent(reqBody, signature, env_1.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            logger_1.logger.error({ err }, '⚠️ Stripe Webhook Signature Verification Failed');
            throw new Error(`Webhook Error: ${err.message}`);
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const courseId = session.metadata?.courseId;
            const studentId = session.metadata?.studentId;
            if (courseId && studentId) {
                try {
                    const existing = await db_1.db.select().from(schema_1.enrollmentsTable)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.studentId, studentId), (0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.courseId, courseId)))
                        .limit(1);
                    if (existing.length === 0) {
                        await db_1.db.insert(schema_1.enrollmentsTable).values({
                            id: (0, uuidv7_1.uuidv7)(),
                            courseId,
                            studentId,
                            status: 'ACTIVE',
                        });
                        (0, logger_1.auditLog)('PAYMENT_SUCCESS', { studentId, courseId, stripeEventId: event.id });
                    }
                    else {
                        logger_1.logger.warn({ studentId, courseId, stripeEventId: event.id }, 'ℹ️ Enrollment already exists, skipping duplicate webhook event');
                    }
                }
                catch (dbErr) {
                    logger_1.logger.error({ dbErr, studentId, courseId }, '🚨 CRITICAL: Failed to create enrollment after successful payment');
                    // Note: We don't throw here to avoid Stripe retrying a successful payment event multiple times if just the DB insert fails once
                }
            }
        }
        return { received: true };
    }
    static async verifySession(sessionId) {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return {
            status: session.payment_status,
            courseId: session.metadata?.courseId,
        };
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=payments.service.js.map