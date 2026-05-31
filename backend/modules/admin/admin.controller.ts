import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { AdminService } from './admin.service';

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await AdminService.getAllUsers();

  res.status(200).json({
    success: true,
    results: users.length,
    data: users,
  });
});

export const updateUserRole = catchAsync(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const { role } = req.body;

  const result = await AdminService.updateUserRole(id, role);

  res.status(200).json({
    success: true,
    message: `User role updated to ${result.role}`,
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const result = await AdminService.deleteUser(id);

  res.status(200).json(result);
});

export const getAdminStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await AdminService.getGlobalStats();

  res.status(200).json({
    success: true,
    data: stats,
  });
});

export const getHealth = catchAsync(async (req: Request, res: Response) => {
  const health = await AdminService.getSystemHealth();

  res.status(200).json({
    success: true,
    data: health,
  });
});

export const toggleUserBan = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isBanned } = req.body;
  const result = await AdminService.toggleUserBan(id as string, isBanned);
  res.status(200).json({ success: true, message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`, data: result });
});

export const getModerationContent = catchAsync(async (req: Request, res: Response) => {
  const data = await AdminService.getContentForModeration();
  res.status(200).json({ success: true, data });
});

export const deleteDiscussion = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AdminService.deleteDiscussion(id as string);
  res.status(200).json({ success: true, message: 'Discussion thread deleted' });
});

export const deleteReply = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await AdminService.deleteReply(id as string);
  res.status(200).json({ success: true, message: 'Reply deleted' });
});

export const moderationStrike = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const result = await AdminService.moderationStrike(id as string, reason || 'No reason provided');
  res.status(200).json(result);
});
