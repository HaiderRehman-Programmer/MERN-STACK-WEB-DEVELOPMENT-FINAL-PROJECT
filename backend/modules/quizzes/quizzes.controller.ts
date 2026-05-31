import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { QuizService } from './quizzes.service';

export const createOrUpdateQuiz = catchAsync(async (req: Request, res: Response) => {
  const result = await QuizService.createOrUpdate(req.body, req.user!.id);
  res.status(201).json({
    success: true,
    message: 'Quiz created successfully',
    data: result
  });
});

export const getQuizByLesson = catchAsync(async (req: Request, res: Response) => {
  const lessonId = req.params['lessonId'] as string;
  const result = await QuizService.getByLesson(lessonId);
  res.status(200).json({
    success: true,
    data: result
  });
});

export const submitQuiz = catchAsync(async (req: Request, res: Response) => {
  const quizId = req.params['quizId'] as string;
  const result = await QuizService.submitAttempt(quizId, req.body.answers, req.user!.id);
  res.status(200).json({
    success: true,
    data: result
  });
});
