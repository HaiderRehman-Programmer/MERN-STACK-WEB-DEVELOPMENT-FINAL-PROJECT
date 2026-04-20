import express from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import { createCourseSchema } from './courses.schema';
import { createCourse, getAllCourses, getMyCourses, getMyAnalytics, togglePublish, deleteCourse, updateCourse } from './courses.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { restrictTo } from '../../middleware/restrictTo';

const router = express.Router();

// Public Read Vectors
router.get('/', getAllCourses);

// Secured Creation & Management Vectors
router.use(requireAuth);

router.get('/mine', restrictTo('INSTRUCTOR', 'ADMIN'), getMyCourses);
router.get('/mine/analytics', restrictTo('INSTRUCTOR', 'ADMIN'), getMyAnalytics);
router.post('/', restrictTo('INSTRUCTOR', 'ADMIN'), validateRequest(createCourseSchema), createCourse);
router.patch('/:id', restrictTo('INSTRUCTOR', 'ADMIN'), updateCourse);
router.patch('/:id/publish', restrictTo('INSTRUCTOR', 'ADMIN'), togglePublish);
router.delete('/:id', restrictTo('INSTRUCTOR', 'ADMIN'), deleteCourse);

export default router;
