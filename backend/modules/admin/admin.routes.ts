import express from 'express';
import { getAllUsers, updateUserRole, getAdminStats, getHealth, toggleUserBan, getModerationContent, deleteDiscussion, deleteReply, moderationStrike, deleteUser } from './admin.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { restrictTo } from '../../middleware/restrictTo';

const router = express.Router();

router.use(requireAuth, restrictTo('ADMIN'));

router.get('/users', getAllUsers);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/ban', toggleUserBan);
router.delete('/users/:id', deleteUser);

router.get('/stats', getAdminStats);
router.get('/health', getHealth);

router.get('/moderation', getModerationContent);
router.delete('/discussions/:id', deleteDiscussion);
router.delete('/replies/:id', deleteReply);
router.post('/courses/:id/strike', moderationStrike);

export default router;
