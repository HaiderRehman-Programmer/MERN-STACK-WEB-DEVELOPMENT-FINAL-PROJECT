import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';
import { AuthService } from './auth.service';
import { User } from '../../models/User';
import { Enrollment } from '../../models/Enrollment';
import { Course } from '../../models/Course';
import { Lesson } from '../../models/Lesson';
import { LessonProgress } from '../../models/LessonProgress';

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

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

  const user = await User.findById(userId).select('-hashedPassword');

  if (!user) throw new AppError('User not found', 404);

  res.status(200).json({
    success: true,
    data: { user },
  });
});

export const getMyEnrollments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const enrollments = await Enrollment.find({ studentId: userId })
    .populate('courseId', 'title price');

  const formatted = enrollments.map((e: any) => ({
    enrollmentId: e._id,
    status: e.status,
    purchasedAt: e.createdAt,
    courseId: e.courseId ? e.courseId._id : null,
    courseTitle: e.courseId ? e.courseId.title : null,
    coursePrice: e.courseId ? e.courseId.price : null,
  }));

  res.status(200).json({
    success: true,
    results: formatted.length,
    data: formatted,
  });
});

export const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const enrollments = await Enrollment.find({ studentId: userId })
    .populate('courseId', 'title category price');

  const enriched = await Promise.all(
    enrollments.map(async (enr: any) => {
      const courseIdStr = enr.courseId ? enr.courseId._id.toString() : null;
      if (!courseIdStr) return null;

      const totalLessons = await Lesson.countDocuments({ courseId: courseIdStr });
      
      const lessons = await Lesson.find({ courseId: courseIdStr }).select('_id');
      const lessonIds = lessons.map(l => l._id);

      const completedLessons = await LessonProgress.countDocuments({
        studentId: userId,
        lessonId: { $in: lessonIds },
        isCompleted: true
      });

      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        enrollmentId: enr._id,
        status: enr.status,
        purchasedAt: enr.createdAt,
        courseId: courseIdStr,
        courseTitle: enr.courseId.title,
        courseCategory: enr.courseId.category,
        coursePrice: enr.courseId.price,
        totalLessons,
        completedLessons,
        progressPercent,
      };
    })
  );

  const filteredEnriched = enriched.filter(Boolean);

  const totalEnrollments = filteredEnriched.length;
  const totalCompleted = filteredEnriched.filter((e: any) => e.progressPercent === 100).length;
  const averageProgress = totalEnrollments > 0
    ? Math.round(filteredEnriched.reduce((sum: number, e: any) => sum + e.progressPercent, 0) / totalEnrollments)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      stats: { totalEnrollments, totalCompleted, averageProgress },
      enrollments: filteredEnriched,
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

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const token = req.params['token'] as string;
  await AuthService.verifyEmail(token);
  res.status(200).json({ success: true, message: 'Email verified successfully! You can now log in.' });
});

export const updateAvatar = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError('No file uploaded', 400);

  const result = await AuthService.updateAvatar(req.user!.id, req.file.filename);
  res.status(200).json({
    success: true,
    message: 'Avatar updated successfully',
    data: result
  });
});
