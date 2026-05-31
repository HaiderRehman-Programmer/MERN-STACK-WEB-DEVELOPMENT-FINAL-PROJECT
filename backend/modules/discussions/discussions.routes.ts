import express from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { createQuestion, getLessonDiscussions, replyToQuestion, deleteQuestion, deleteReply } from './discussions.controller';

const router = express.Router();

router.use(requireAuth);

router.get('/lesson/:lessonId', getLessonDiscussions);
router.post('/question', createQuestion);
router.post('/reply', replyToQuestion);
router.delete('/question/:id', deleteQuestion);
router.delete('/reply/:id', deleteReply);

export default router;
