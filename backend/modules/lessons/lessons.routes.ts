import express from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import { createLessonSchema } from './lessons.schema';
import { createLesson, getCourseLessons, uploadMedia, deleteLesson, updateLesson, toggleLessonCompletion, updateLessonProgress } from './lessons.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { restrictTo } from '../../middleware/restrictTo';
import { uploadEngine } from '../../utils/uploadEngine';

const router = express.Router();

// Mixed Authorization Paths
router.get('/course/:courseId', getCourseLessons); // Evaluates context dynamically inside controller

router.use(requireAuth);

// Student Mutation Bounday
router.post('/:id/complete', toggleLessonCompletion);
router.patch('/:id/progress', updateLessonProgress);

// Instructor Mutation Boundaries
router.use(restrictTo('INSTRUCTOR', 'ADMIN'));
router.post('/', validateRequest(createLessonSchema), createLesson);
router.post('/upload', uploadEngine.single('media'), uploadMedia);
router.patch('/:id', updateLesson);
router.delete('/:id', deleteLesson);

export default router;
