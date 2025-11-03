# Payment Gateway Setup Guide

This guide will help you integrate Razorpay payment gateway into your fashion store.

## 1. Install Razorpay Package (Backend)

Navigate to the backend directory and install Razorpay:

```bash
cd fashion-store/backend
npm install razorpay
```

## 2. Get Razorpay API Keys

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to Settings → API Keys
3. Generate Key ID and Key Secret
4. Copy both keys for later use

## 3. Configure Environment Variables

### Backend (.env)

Add these to your `fashion-store/backend/.env` file:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

### Frontend (.env or .env.local)

Create or update `fashion-store/frontend/.env.local`:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

## 4. Update Payment Controller

Update `fashion-store/backend/controllers/paymentController.js`:

1. Uncomment the Razorpay SDK import at the top
2. Uncomment the actual Razorpay order creation code
3. Uncomment the signature verification code

Replace the mock implementation with the actual Razorpay code that's commented out.

## 5. Testing

### Test Mode
- Razorpay provides test keys that start with `rzp_test_`
- Use test card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

### Test Cards
- **Success**: 4111 1111 1111 1111
- **Failure**: 4012 8888 8888 1881
- **3D Secure**: 5267 3181 8797 5449

## 6. Production Deployment

1. Switch to live mode in Razorpay dashboard
2. Generate live API keys
3. Update environment variables with live keys
4. Ensure HTTPS is enabled (required for production)

## Alternative Payment Gateways

If you prefer a different payment gateway:

### Stripe (International)
```bash
npm install stripe
```
Update the payment controller to use Stripe instead of Razorpay.

### PayPal
```bash
npm install @paypal/checkout-server-sdk
```
Follow PayPal's integration guide.

## Security Notes

- **Never commit API keys to Git**
- Always use environment variables
- Verify payment signatures on backend
- Use HTTPS in production
- Implement proper error handling

## Troubleshooting

### Common Issues:

1. **"Razorpay is not defined"**
   - Ensure Razorpay script is loaded in Checkout.jsx
   - Check browser console for script errors

2. **"Invalid Key"**
   - Verify your Razorpay Key ID is correct
   - Ensure you're using test keys in test mode

3. **Payment Verification Failed**
   - Check signature verification logic
   - Ensure key secret matches your key ID

## Support

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay API Reference](https://razorpay.com/docs/api/)

