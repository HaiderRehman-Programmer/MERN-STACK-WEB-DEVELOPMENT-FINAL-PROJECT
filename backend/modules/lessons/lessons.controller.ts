import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { LessonService } from './lessons.service';

export const uploadMedia = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError("No file payload was transmitted", 400);
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    data: { url: fileUrl }
  });
});

export const createLesson = catchAsync(async (req: Request, res: Response) => {
  const result = await LessonService.createLesson(req.body, req.user!.id, req.user!.role);
  res.status(201).json({ success: true, data: result });
});

export const getCourseLessons = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params['courseId'] as string;
  if (!courseId) throw new AppError('Course ID is required', 400);

  const finalLessons = await LessonService.getCourseLessons(courseId, req.user?.id);

  res.status(200).json({
    success: true,
    data: finalLessons
  });
});

export const deleteLesson = catchAsync(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  await LessonService.deleteLesson(id, req.user!.id, req.user!.role);
  res.status(200).json({
    success: true,
    message: 'Lesson deleted successfully'
  });
});

export const updateLesson = catchAsync(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const updated = await LessonService.updateLesson(id, req.body, req.user!.id, req.user!.role);
  res.status(200).json({
    success: true,
    data: updated
  });
});

export const toggleLessonCompletion = catchAsync(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const isCompleted = await LessonService.toggleCompletion(id, req.user!.id);
  res.status(200).json({
    success: true,
    message: `Lesson marked as ${isCompleted ? 'completed' : 'incomplete'}`,
    isCompleted
  });
});

export const updateLessonProgress = catchAsync(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const { seconds } = req.body;
  if (typeof seconds !== 'number') throw new AppError('Seconds must be a number', 400);

  await LessonService.updateProgress(id, req.user!.id, seconds);
  res.status(200).json({
    success: true,
    message: 'Progress updated',
    data: { lastWatchedSeconds: seconds }
  });
});
