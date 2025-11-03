import express from 'express';
import { addOrderItems, getMyOrders } from '../controllers/orderController.js';
import { createRazorpayOrder, verifyRazorpayPayment, updateOrderPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addOrderItems);
router.get('/mine', protect, getMyOrders);

// Payment routes
router.post('/create-razorpay-order', protect, createRazorpayOrder);
router.post('/verify-razorpay-payment', protect, verifyRazorpayPayment);
router.put('/:id/pay', protect, updateOrderPayment);

export default router;


