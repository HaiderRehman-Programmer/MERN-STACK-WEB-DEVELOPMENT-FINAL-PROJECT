import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { WishlistService } from './wishlist.service';

export const toggleWishlist = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const result = await WishlistService.toggleWishlist(req.user!.id, courseId as string);
  res.status(200).json({
    success: true,
    message: result.favorited ? 'Added to wishlist' : 'Removed from wishlist',
    data: result
  });
});

export const getWishlist = catchAsync(async (req: Request, res: Response) => {
  const wishlist = await WishlistService.getWishlist(req.user!.id);
  res.status(200).json({
    success: true,
    data: wishlist
  });
});
