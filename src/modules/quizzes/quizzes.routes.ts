import express from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { restrictTo } from '../../middleware/restrictTo';
import { createOrUpdateQuiz, getQuizByLesson, submitQuiz } from './quizzes.controller';

const router = express.Router();

router.use(requireAuth);

// Student access
router.get('/lesson/:lessonId', getQuizByLesson);
router.post('/:quizId/submit', submitQuiz);

// Instructor access
router.post('/', restrictTo('INSTRUCTOR', 'ADMIN'), createOrUpdateQuiz);

export default router;
