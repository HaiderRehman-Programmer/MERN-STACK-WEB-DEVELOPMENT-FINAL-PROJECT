import express from 'express';
import { createReview, getCourseReviews, deleteReview } from './reviews.controller';
import { requireAuth } from '../../middleware/requireAuth';

const router = express.Router();

// Public: read reviews
router.get('/course/:courseId', getCourseReviews);

// Protected: write/delete reviews
router.use(requireAuth);
router.post('/', createReview);
router.delete('/:id', deleteReview);

export default router;
