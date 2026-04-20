"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = require("./middleware/errorHandler");
const AppError_1 = require("./utils/AppError");
const rateLimiter_1 = require("./middleware/rateLimiter");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const courses_routes_1 = __importDefault(require("./modules/courses/courses.routes"));
const enrollments_routes_1 = __importDefault(require("./modules/enrollments/enrollments.routes"));
const lessons_routes_1 = __importDefault(require("./modules/lessons/lessons.routes"));
const admin_routes_1 = __importDefault(require("./modules/admin/admin.routes"));
const payments_routes_1 = __importDefault(require("./modules/payments/payments.routes"));
const reviews_routes_1 = __importDefault(require("./modules/reviews/reviews.routes"));
const quizzes_routes_1 = __importDefault(require("./modules/quizzes/quizzes.routes"));
const discussions_routes_1 = __importDefault(require("./modules/discussions/discussions.routes"));
const payments_controller_1 = require("./modules/payments/payments.controller");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// Global Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
// Rate Limiting — Apply globally to all API routes (Skip in tests)
if (process.env.NODE_ENV !== 'test') {
    app.use('/api/v1', rateLimiter_1.apiLimiter);
}
// API Documentation
app.use('/api/v1/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Stripe Webhook — MUST be before express.json() (requires raw body)
app.post('/api/v1/payments/webhook', express_1.default.raw({ type: 'application/json' }), payments_controller_1.stripeWebhook);
// JSON Body Parser (after webhook route)
app.use(express_1.default.json({ limit: '10kb' }));
// Static Assets
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// Feature Routes
app.use('/api/v1/auth', process.env.NODE_ENV === 'test' ? [] : [rateLimiter_1.authLimiter], auth_routes_1.default);
app.use('/api/v1/courses', courses_routes_1.default);
app.use('/api/v1/enrollments', enrollments_routes_1.default);
app.use('/api/v1/lessons', lessons_routes_1.default);
app.use('/api/v1/admin', admin_routes_1.default);
app.use('/api/v1/payments', payments_routes_1.default);
app.use('/api/v1/reviews', reviews_routes_1.default);
app.use('/api/v1/quizzes', quizzes_routes_1.default);
app.use('/api/v1/discussions', discussions_routes_1.default);
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
    next(new AppError_1.AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});
// Global Error Handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map