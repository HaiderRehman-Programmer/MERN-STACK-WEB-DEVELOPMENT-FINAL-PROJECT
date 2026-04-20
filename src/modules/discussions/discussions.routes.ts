import express from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { createQuestion, getLessonDiscussions, replyToQuestion } from './discussions.controller';

const router = express.Router();

router.use(requireAuth);

router.get('/lesson/:lessonId', getLessonDiscussions);
router.post('/question', createQuestion);
router.post('/reply', replyToQuestion);

export default router;
