import express from 'express';
import { validateRequest } from '../../middleware/validateRequest';
import { createEnrollmentSchema } from './enrollments.schema';
import { enrollInCourse, generateCertificate } from './enrollments.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { restrictTo } from '../../middleware/restrictTo';

const router = express.Router();

router.use(requireAuth);
router.post('/', restrictTo('STUDENT'), validateRequest(createEnrollmentSchema), enrollInCourse);
router.get('/:id/certificate', restrictTo('STUDENT'), generateCertificate);

export default router;
