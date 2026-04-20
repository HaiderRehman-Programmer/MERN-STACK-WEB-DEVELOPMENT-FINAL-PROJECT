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
