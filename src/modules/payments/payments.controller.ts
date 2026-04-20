import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { AppError } from '../../utils/AppError';
import { PaymentService } from './payments.service';

export const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.createCheckout(req.body.courseId, req.user!.id);
  res.status(200).json({ success: true, data: result });
});

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  try {
    const result = await PaymentService.handleWebhook(req.body, sig);
    res.status(200).json(result);
  } catch (err: any) {
    console.error('⚠️ Webhook Error:', err.message);
    res.status(400).send(err.message);
  }
};

export const verifySession = catchAsync(async (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;
  if (!sessionId) throw new AppError('Session ID is required', 400);

  const result = await PaymentService.verifySession(sessionId);
  res.status(200).json({ success: true, data: result });
});
