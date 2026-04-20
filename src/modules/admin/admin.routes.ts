import express from 'express';
import { getAllUsers, updateUserRole, getAdminStats, getHealth } from './admin.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { restrictTo } from '../../middleware/restrictTo';

const router = express.Router();

router.use(requireAuth);
router.use(restrictTo('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/health', getHealth);
router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);

export default router;
