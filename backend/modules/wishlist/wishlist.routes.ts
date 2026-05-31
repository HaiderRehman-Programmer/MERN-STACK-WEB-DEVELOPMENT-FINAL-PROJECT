import express from 'express';
import { requireAuth } from '../../middleware/requireAuth';
import { toggleWishlist, getWishlist } from './wishlist.controller';

const router = express.Router();

router.use(requireAuth);

router.get('/', getWishlist);
router.post('/:courseId', toggleWishlist);

export default router;
