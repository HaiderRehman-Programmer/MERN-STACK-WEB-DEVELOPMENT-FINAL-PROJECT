import { Request, Response } from 'express';
import { db } from '../../config/db';
import { coursesTable } from '../../db/schema';
import { catchAsync } from '../../utils/catchAsync';
import { eq } from 'drizzle-orm';
import { CourseService } from './courses.service';

export const createCourse = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.createCourse(req.body, req.user!.id);
  res.status(201).json({ success: true, data: result });
});

export const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.findCourses(req.query);
  res.status(200).json({ success: true, ...result });
});

export const getMyCourses = catchAsync(async (req: Request, res: Response) => {
  const courses = await CourseService.findInstructorCourses(req.user!.id);
  res.status(200).json({ success: true, results: courses.length, data: courses });
});

export const getMyAnalytics = catchAsync(async (req: Request, res: Response) => {
  const result = await CourseService.getInstructorAnalytics(req.user!.id);
  res.status(200).json({ success: true, data: result });
});

export const togglePublish = catchAsync(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const result = await CourseService.togglePublish(id, req.user!.id);
  res.status(200).json({ success: true, data: result });
});

export const updateCourse = catchAsync(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const result = await CourseService.updateCourse(id, req.body, req.user!.id);
  res.status(200).json({ success: true, data: result });
});

export const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  await CourseService.deleteCourse(id, req.user!.id);
  res.status(200).json({ success: true, message: 'Course deleted successfully' });
});
