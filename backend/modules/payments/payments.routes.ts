import express from 'express';
import { createCheckoutSession, verifySession } from './payments.controller';
import { requireAuth } from '../../middleware/requireAuth';
import { restrictTo } from '../../middleware/restrictTo';

const router = express.Router();

router.use(requireAuth);
router.post('/create-checkout', restrictTo('STUDENT'), createCheckoutSession);
router.get('/verify-session', verifySession);

export default router;
