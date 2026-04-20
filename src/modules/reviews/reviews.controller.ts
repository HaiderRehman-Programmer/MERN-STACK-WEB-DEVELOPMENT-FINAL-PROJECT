import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { ReviewService } from './reviews.service';

export const createReview = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.createOrUpdate(req.body, req.user!.id);
  res.status(result.updated ? 200 : 201).json({
    success: true,
    message: result.updated ? 'Review updated' : 'Review submitted',
    data: result.data || { id: result.id }
  });
});

export const getCourseReviews = catchAsync(async (req: Request, res: Response) => {
  const reviews = await ReviewService.getCourseReviews(req.params['courseId'] as string);
  res.status(200).json({
    success: true,
    results: reviews.length,
    data: reviews,
  });
});

export const deleteReview = catchAsync(async (req: Request, res: Response) => {
  await ReviewService.deleteReview(req.params['id'] as string, req.user!.id);
  res.status(200).json({
    success: true,
    message: 'Review deleted'
  });
});
