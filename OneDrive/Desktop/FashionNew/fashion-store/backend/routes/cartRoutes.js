import express from 'express';
import { getMyCart, setCartItems } from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/mine', protect, getMyCart);
router.put('/mine', protect, setCartItems);

export default router;


