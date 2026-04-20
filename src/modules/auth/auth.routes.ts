import express from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, updateProfileSchema, changePasswordSchema } from './auth.schema';
import { register, login, getMe, getMyEnrollments, getDashboard, refresh, logout, forgotPassword, resetPassword, updateProfile, changePassword } from './auth.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { restrictTo } from '../../middleware/restrictTo';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh', refresh);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.patch('/reset-password/:token', validateRequest(resetPasswordSchema), resetPassword);

// Secure Routing Boundary
router.use(requireAuth);

router.post('/logout', logout);
router.patch('/me', validateRequest(updateProfileSchema), updateProfile);
router.patch('/change-password', validateRequest(changePasswordSchema), changePassword);
router.get('/me', restrictTo('STUDENT', 'INSTRUCTOR', 'ADMIN'), getMe);
router.get('/me/enrollments', restrictTo('STUDENT', 'INSTRUCTOR', 'ADMIN'), getMyEnrollments);
router.get('/me/dashboard', restrictTo('STUDENT', 'INSTRUCTOR', 'ADMIN'), getDashboard);

export default router;
