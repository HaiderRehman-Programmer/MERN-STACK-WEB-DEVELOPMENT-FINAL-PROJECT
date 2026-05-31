import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { DiscussionService } from './discussions.service';

export const createQuestion = catchAsync(async (req: Request, res: Response) => {
  const { lessonId, content } = req.body;
  if (!content) throw new AppError('Content is required', 400);

  const result = await DiscussionService.createQuestion(lessonId, req.user!.id, content);
  res.status(201).json({
    success: true,
    message: 'Question posted successfully',
    data: result
  });
});

export const replyToQuestion = catchAsync(async (req: Request, res: Response) => {
  const { discussionId, content } = req.body;
  if (!content) throw new AppError('Content is required', 400);

  const result = await DiscussionService.createReply(discussionId, req.user!.id, content);
  res.status(201).json({
    success: true,
    message: 'Reply posted successfully',
    data: result
  });
});

export const getLessonDiscussions = catchAsync(async (req: Request, res: Response) => {
  const lessonId = req.params['lessonId'] as string;
  const discussions = await DiscussionService.getByLesson(lessonId);
  res.status(200).json({
    success: true,
    data: discussions
  });
});
export const deleteQuestion = catchAsync(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  await DiscussionService.deleteOwnQuestion(id, req.user!.id);
  res.status(200).json({
    success: true,
    message: 'Question deleted successfully'
  });
});

export const deleteReply = catchAsync(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  await DiscussionService.deleteOwnReply(id, req.user!.id);
  res.status(200).json({
    success: true,
    message: 'Reply deleted successfully'
  });
});
