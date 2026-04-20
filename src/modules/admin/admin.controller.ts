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
