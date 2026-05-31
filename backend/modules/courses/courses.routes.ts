import express from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import { createCourseSchema } from './courses.schema';
import { createCourse, getAllCourses, getCourseById, getMyCourses, getMyAnalytics, togglePublish, deleteCourse, updateCourse } from './courses.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { restrictTo } from '../../middleware/restrictTo';

const router = express.Router();

// Public Read Vectors
router.get('/', getAllCourses);

// Instructor-specific routes (must come BEFORE /:id to avoid route shadowing)
router.get('/mine', requireAuth, restrictTo('INSTRUCTOR', 'ADMIN'), getMyCourses);
router.get('/mine/analytics', requireAuth, restrictTo('INSTRUCTOR', 'ADMIN'), getMyAnalytics);

// Public single-course lookup
router.get('/:id', getCourseById);

// Secured Creation & Management Vectors
router.use(requireAuth);

router.post('/', restrictTo('INSTRUCTOR', 'ADMIN'), validateRequest(createCourseSchema), createCourse);
router.put('/:id', restrictTo('INSTRUCTOR', 'ADMIN'), updateCourse);
router.patch('/:id', restrictTo('INSTRUCTOR', 'ADMIN'), updateCourse);
router.patch('/:id/publish', restrictTo('INSTRUCTOR', 'ADMIN'), togglePublish);
router.delete('/:id', restrictTo('INSTRUCTOR', 'ADMIN'), deleteCourse);

export default router;
