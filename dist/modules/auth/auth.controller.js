"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAvatar = exports.verifyEmail = exports.changePassword = exports.updateProfile = exports.resetPassword = exports.forgotPassword = exports.logout = exports.refresh = exports.getDashboard = exports.getMyEnrollments = exports.getMe = exports.login = exports.register = void 0;
const db_1 = require("../../config/db");
const schema_1 = require("../../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const catchAsync_1 = require("../../utils/catchAsync");
const AppError_1 = require("../../utils/AppError");
const env_1 = require("../../config/env");
const auth_service_1 = require("./auth.service");
/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new student
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password]
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
exports.register = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const result = await auth_service_1.AuthService.register(req.body);
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: result,
    });
});
/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Log into the system
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful, returns JWT
 */
exports.login = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { accessToken, refreshToken, user } = await auth_service_1.AuthService.login(req.body);
    res.cookie('jwt_refresh', refreshToken, {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(200).json({
        success: true,
        data: {
            accessToken,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            }
        }
    });
});
exports.getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const userArr = await db_1.db
        .select({
        id: schema_1.usersTable.id,
        firstName: schema_1.usersTable.firstName,
        lastName: schema_1.usersTable.lastName,
        role: schema_1.usersTable.role,
        email: schema_1.userAuthTable.email,
        createdAt: schema_1.usersTable.createdAt,
    })
        .from(schema_1.usersTable)
        .innerJoin(schema_1.userAuthTable, (0, drizzle_orm_1.eq)(schema_1.usersTable.id, schema_1.userAuthTable.userId))
        .where((0, drizzle_orm_1.eq)(schema_1.usersTable.id, userId))
        .limit(1);
    res.status(200).json({
        success: true,
        data: { user: userArr[0] },
    });
});
exports.getMyEnrollments = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const enrollments = await db_1.db
        .select({
        enrollmentId: schema_1.enrollmentsTable.id,
        status: schema_1.enrollmentsTable.status,
        purchasedAt: schema_1.enrollmentsTable.purchasedAt,
        courseId: schema_1.coursesTable.id,
        courseTitle: schema_1.coursesTable.title,
        coursePrice: schema_1.coursesTable.price,
    })
        .from(schema_1.enrollmentsTable)
        .innerJoin(schema_1.coursesTable, (0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.courseId, schema_1.coursesTable.id))
        .where((0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.studentId, userId));
    res.status(200).json({
        success: true,
        results: enrollments.length,
        data: enrollments,
    });
});
exports.getDashboard = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.user.id;
    const enrollments = await db_1.db
        .select({
        enrollmentId: schema_1.enrollmentsTable.id,
        status: schema_1.enrollmentsTable.status,
        purchasedAt: schema_1.enrollmentsTable.purchasedAt,
        courseId: schema_1.coursesTable.id,
        courseTitle: schema_1.coursesTable.title,
        courseCategory: schema_1.coursesTable.category,
        coursePrice: schema_1.coursesTable.price,
    })
        .from(schema_1.enrollmentsTable)
        .innerJoin(schema_1.coursesTable, (0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.courseId, schema_1.coursesTable.id))
        .where((0, drizzle_orm_1.eq)(schema_1.enrollmentsTable.studentId, userId));
    const enriched = await Promise.all(enrollments.map(async (enr) => {
        const lessonCountResult = await db_1.db
            .select({ value: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(schema_1.lessonsTable)
            .where((0, drizzle_orm_1.eq)(schema_1.lessonsTable.courseId, enr.courseId));
        const completedCountResult = await db_1.db
            .select({ value: (0, drizzle_orm_1.sql) `cast(count(*) as int)` })
            .from(schema_1.lessonProgressTable)
            .innerJoin(schema_1.lessonsTable, (0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.lessonId, schema_1.lessonsTable.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.lessonProgressTable.studentId, userId), (0, drizzle_orm_1.eq)(schema_1.lessonsTable.courseId, enr.courseId)));
        const totalLessons = lessonCountResult[0]?.value || 0;
        const completedLessons = completedCountResult[0]?.value || 0;
        const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        return {
            ...enr,
            totalLessons,
            completedLessons,
            progressPercent,
        };
    }));
    const totalEnrollments = enriched.length;
    const totalCompleted = enriched.filter(e => e.progressPercent === 100).length;
    const averageProgress = totalEnrollments > 0
        ? Math.round(enriched.reduce((sum, e) => sum + e.progressPercent, 0) / totalEnrollments)
        : 0;
    res.status(200).json({
        success: true,
        data: {
            stats: { totalEnrollments, totalCompleted, averageProgress },
            enrollments: enriched,
        }
    });
});
exports.refresh = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const refreshToken = req.cookies.jwt_refresh;
    const { accessToken } = await auth_service_1.AuthService.refresh(refreshToken);
    res.status(200).json({
        success: true,
        data: { accessToken }
    });
});
exports.logout = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const refreshToken = req.cookies.jwt_refresh;
    await auth_service_1.AuthService.clearRefreshToken(refreshToken);
    res.clearCookie('jwt_refresh', {
        httpOnly: true,
        secure: env_1.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});
exports.forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await auth_service_1.AuthService.forgotPassword(req.body.email);
    res.status(200).json({ success: true, message: 'If the email exists, a reset link was sent.' });
});
exports.resetPassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const token = req.params['token'];
    await auth_service_1.AuthService.resetPassword(token, req.body.password);
    res.status(200).json({ success: true, message: 'Password successfully reset' });
});
exports.updateProfile = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await auth_service_1.AuthService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Profile updated successfully' });
});
exports.changePassword = (0, catchAsync_1.catchAsync)(async (req, res) => {
    await auth_service_1.AuthService.changePassword(req.user.id, req.body);
    res.status(200).json({ success: true, message: 'Password changed successfully' });
});
exports.verifyEmail = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const token = req.params['token'];
    await auth_service_1.AuthService.verifyEmail(token);
    res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.' });
});
exports.updateAvatar = (0, catchAsync_1.catchAsync)(async (req, res) => {
    if (!req.file)
        throw new AppError_1.AppError('No file uploaded', 400);
    const result = await auth_service_1.AuthService.updateAvatar(req.user.id, req.file.filename);
    res.status(200).json({
        success: true,
        message: 'Avatar updated successfully',
        data: result
    });
});
//# sourceMappingURL=auth.controller.js.map