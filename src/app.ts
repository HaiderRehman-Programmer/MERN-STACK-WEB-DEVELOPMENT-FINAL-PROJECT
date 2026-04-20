import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './utils/AppError';
import { apiLimiter, authLimiter } from './middleware/rateLimiter';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './modules/auth/auth.routes';
import courseRoutes from './modules/courses/courses.routes';
import enrollmentRoutes from './modules/enrollments/enrollments.routes';
import lessonRoutes from './modules/lessons/lessons.routes';
import adminRoutes from './modules/admin/admin.routes';
import paymentRoutes from './modules/payments/payments.routes';
import reviewRoutes from './modules/reviews/reviews.routes';
import quizRoutes from './modules/quizzes/quizzes.routes';
import discussionRoutes from './modules/discussions/discussions.routes';
import { stripeWebhook } from './modules/payments/payments.controller';
import path from 'path';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());

// Rate Limiting — Apply globally to all API routes (Skip in tests)
if (process.env.NODE_ENV !== 'test') {
  app.use('/api/v1', apiLimiter);
}

// API Documentation
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Stripe Webhook — MUST be before express.json() (requires raw body)
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// JSON Body Parser (after webhook route)
app.use(express.json({ limit: '10kb' }));

// Static Assets
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Feature Routes
app.use('/api/v1/auth', process.env.NODE_ENV === 'test' ? [] : [authLimiter], authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/quizzes', quizRoutes);
app.use('/api/v1/discussions', discussionRoutes);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'System Operational',
    data: {},
  });
});

// Undefined Route Handler
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// Global Error Handler
app.use(errorHandler);

export default app;
