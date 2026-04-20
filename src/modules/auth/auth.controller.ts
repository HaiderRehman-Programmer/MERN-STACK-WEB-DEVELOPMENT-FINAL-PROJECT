import { Request, Response } from 'express';
import { db } from '../../config/db';
import { usersTable, userAuthTable, enrollmentsTable, coursesTable, lessonsTable, lessonProgressTable } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { catchAsync } from '../../utils/catchAsync';
import { env } from '../../config/env';
import { AuthService } from './auth.service';

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
export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);

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
export const login = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await AuthService.login(req.body);

  res.cookie('jwt_refresh', refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
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

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const userArr = await db
    .select({
      id: usersTable.id,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      role: usersTable.role,
      email: userAuthTable.email,
      createdAt: usersTable.createdAt,
    })
    .from(usersTable)
    .innerJoin(userAuthTable, eq(usersTable.id, userAuthTable.userId))
    .where(eq(usersTable.id, userId))
    .limit(1);

  res.status(200).json({
    success: true,
    data: { user: userArr[0] },
  });
});

export const getMyEnrollments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const enrollments = await db
    .select({
      enrollmentId: enrollmentsTable.id,
      status: enrollmentsTable.status,
      purchasedAt: enrollmentsTable.purchasedAt,
      courseId: coursesTable.id,
      courseTitle: coursesTable.title,
      coursePrice: coursesTable.price,
    })
    .from(enrollmentsTable)
    .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .where(eq(enrollmentsTable.studentId, userId));

  res.status(200).json({
    success: true,
    results: enrollments.length,
    data: enrollments,
  });
});

export const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const enrollments = await db
    .select({
      enrollmentId: enrollmentsTable.id,
      status: enrollmentsTable.status,
      purchasedAt: enrollmentsTable.purchasedAt,
      courseId: coursesTable.id,
      courseTitle: coursesTable.title,
      courseCategory: coursesTable.category,
      coursePrice: coursesTable.price,
    })
    .from(enrollmentsTable)
    .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .where(eq(enrollmentsTable.studentId, userId));

  const enriched = await Promise.all(
    enrollments.map(async (enr) => {
      const lessonCountResult = await db
        .select({ value: sql<number>`cast(count(*) as int)` })
        .from(lessonsTable)
        .where(eq(lessonsTable.courseId, enr.courseId));

      const completedCountResult = await db
        .select({ value: sql<number>`cast(count(*) as int)` })
        .from(lessonProgressTable)
        .innerJoin(lessonsTable, eq(lessonProgressTable.lessonId, lessonsTable.id))
        .where(
          and(
            eq(lessonProgressTable.studentId, userId),
            eq(lessonsTable.courseId, enr.courseId)
          )
        );

      const totalLessons = lessonCountResult[0]?.value || 0;
      const completedLessons = completedCountResult[0]?.value || 0;
      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        ...enr,
        totalLessons,
        completedLessons,
        progressPercent,
      };
    })
  );

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

export const refresh = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.jwt_refresh;
  const { accessToken } = await AuthService.refresh(refreshToken);

  res.status(200).json({
    success: true,
    data: { accessToken }
  });
});

export const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.jwt_refresh;
  await AuthService.clearRefreshToken(refreshToken);

  res.clearCookie('jwt_refresh', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body.email);
  res.status(200).json({ success: true, message: 'If the email exists, a reset link was sent.' });
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.params['token'] as string;
  await AuthService.resetPassword(token, req.body.password);
  res.status(200).json({ success: true, message: 'Password successfully reset' });
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  await AuthService.updateProfile(req.user!.id, req.body);
  res.status(200).json({ success: true, message: 'Profile updated successfully' });
});

export const changePassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.changePassword(req.user!.id, req.body);
  res.status(200).json({ success: true, message: 'Password changed successfully' });
});
