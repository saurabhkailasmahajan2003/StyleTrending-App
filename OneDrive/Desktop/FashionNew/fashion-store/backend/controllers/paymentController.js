import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Initialize Razorpay only if keys are configured
// This prevents error when server starts without keys
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret || keyId === '' || keySecret === '') {
    return null;
  }
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });
};

// Create Razorpay order and payment link
export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', orderItems, shippingAddress } = req.body;

  console.log('createRazorpayOrder called with:', { amount, orderItems, shippingAddress });

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  if (!shippingAddress || !shippingAddress.name || !shippingAddress.address) {
    return res.status(400).json({ message: 'Shipping address is required' });
  }

  // Create order in database first
  const orderItemsWithDetails = orderItems.map(item => ({
    product: item.product,
    name: item.name || item.data?.name || 'Product',
    qty: item.qty,
    price: item.price || item.data?.price || 0,
    image: item.image || item.data?.images?.[0] || ''
  }));

  // Calculate totals
  const itemsPrice = orderItems.reduce((sum, item) => sum + (item.price || item.data?.price || 0) * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 5;
  const taxPrice = +(itemsPrice * 0.1).toFixed(2);
  const totalPrice = +(itemsPrice + shippingPrice + taxPrice).toFixed(2);
  const amountInPaise = Math.round(totalPrice * 100); // Convert to paise

  // Create order in database
  const order = await Order.create({
    user: req.user._id,
    orderItems: orderItemsWithDetails,
    shippingAddress,
    paymentMethod: 'razorpay',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    isPaid: false
  });

  // Use Razorpay Payment Links API to create dynamic payment link with QR code
  try {
    // Check if Razorpay is configured
    const hasKeyId = !!process.env.RAZORPAY_KEY_ID;
    const hasKeySecret = !!process.env.RAZORPAY_KEY_SECRET;
    
    console.log('Checking Razorpay configuration:', {
      hasKeyId,
      hasKeySecret,
      keyIdValue: hasKeyId ? process.env.RAZORPAY_KEY_ID.substring(0, 15) + '...' : 'NOT SET',
      keySecretValue: hasKeySecret ? 'SET (hidden)' : 'NOT SET'
    });
    
    if (!hasKeyId || !hasKeySecret) {
      console.warn('Razorpay credentials not configured.');
      console.warn('Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env file');
      console.warn('Make sure to REMOVE the # at the start of the lines in .env');
      return res.status(400).json({
        orderId: order._id,
        amount: amountInPaise,
        currency: 'INR',
        error: 'Razorpay not configured',
        usePersonalizedLink: true,
        message: 'Razorpay API keys not configured. Please:\n1. Open backend/.env file\n2. Uncomment RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET lines (remove #)\n3. Add your actual keys from Razorpay dashboard\n4. Restart the backend server'
      });
    }
    
    // Check if keys are still placeholder values
    if (process.env.RAZORPAY_KEY_ID.includes('xxxxxxxxxxxxx') || 
        process.env.RAZORPAY_KEY_SECRET.includes('xxxxxxxxxxxxx')) {
      console.warn('Razorpay keys are still placeholder values');
      return res.status(400).json({
        orderId: order._id,
        amount: amountInPaise,
        currency: 'INR',
        error: 'Razorpay keys are placeholders',
        usePersonalizedLink: true,
        message: 'Please replace the placeholder keys (xxxxxxxxxxxxx) with your actual Razorpay API keys in backend/.env file'
      });
    }

    console.log('Creating Razorpay payment link...');
    console.log('Razorpay config check:', {
      hasKeyId: !!process.env.RAZORPAY_KEY_ID,
      hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
      keyIdPrefix: process.env.RAZORPAY_KEY_ID?.substring(0, 10)
    });

    const paymentLinkPayload = {
      amount: amountInPaise,
      currency: currency || 'INR',
      description: `Order #${order._id.toString()}`,
      customer: {
        name: shippingAddress.name,
        email: shippingAddress.email || req.user.email,
        contact: shippingAddress.phone
      },
      notify: {
        sms: true,
        email: true
      },
      reminder_enable: true,
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      },
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-callback`,
      callback_method: 'get'
    };

    console.log('Payment link payload:', { ...paymentLinkPayload, customer: { ...paymentLinkPayload.customer } });
    
    // Get Razorpay instance
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      throw new Error('Razorpay instance could not be created');
    }
    
    const paymentLink = await razorpay.paymentLink.create(paymentLinkPayload);

    console.log('Razorpay Payment Link created successfully:', paymentLink.id);
    console.log('Payment Link URL:', paymentLink.short_url);

    return res.json({
      orderId: order._id,
      paymentLinkId: paymentLink.id,
      paymentLinkUrl: paymentLink.short_url,
      amount: amountInPaise,
      currency: 'INR',
      // QR code will be available on the payment link page
      qrCode: true
    });
  } catch (error) {
    console.error('Razorpay Payment Link creation error:', error);
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error
    });
    
    // Return detailed error for debugging
    return res.status(500).json({
      orderId: order._id,
      amount: amountInPaise,
      currency: 'INR',
      error: error.message || 'Payment link creation failed',
      errorDetails: error.error || error,
      usePersonalizedLink: true,
      message: `Could not create payment link: ${error.message || 'Unknown error'}. Please check Razorpay credentials.`
    });
  }
});

// Verify Razorpay payment
export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Verify payment signature
  if (process.env.RAZORPAY_KEY_SECRET) {
    try {
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }
    } catch (error) {
      console.error('Signature verification error:', error);
    }
  }

  // For testing, accept if signature exists
  const isSignatureValid = razorpaySignature && razorpaySignature.length > 0;

  if (isSignatureValid) {
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: razorpayPaymentId,
      status: 'success',
      update_time: new Date().toISOString(),
      email_address: req.user.email
    };
    await order.save();

    // Clear user's cart after successful payment
    await Cart.findOneAndDelete({ user: req.user._id });

    res.json({
      message: 'Payment verified successfully',
      order: order
    });
  } else {
    res.status(400).json({ message: 'Payment verification failed' });
  }
});

// Update order payment status
export const updateOrderPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentResult } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentResult = paymentResult;
  await order.save();

  // Clear cart
  await Cart.findOneAndDelete({ user: req.user._id });

  res.json(order);
});

