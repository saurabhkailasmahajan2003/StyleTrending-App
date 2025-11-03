import express from 'express';
import { getMyWishlist, toggleWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/mine', protect, getMyWishlist);
router.post('/toggle', protect, toggleWishlist);

export default router;


