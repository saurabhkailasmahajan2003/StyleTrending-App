# Razorpay Payment Setup with QR Code

## ✅ What's Implemented

The payment system now uses **Razorpay Payment Links API** which automatically:
- ✅ Pre-fills the payment amount (no manual entry needed)
- ✅ Generates a QR code for scanning
- ✅ Pre-fills customer details (name, email, phone)
- ✅ Supports payment verification callbacks

## 🔧 Setup Instructions

### Step 1: Get Razorpay API Keys

1. **Sign up/Login** to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. Generate **Test Mode** keys (for development) or **Live Mode** keys (for production)
4. Copy your `Key ID` and `Key Secret`

### Step 2: Configure Environment Variables

1. **Create `.env` file** in `fashion-store/backend/`:
   ```bash
   cd fashion-store/backend
   cp .env.example .env
   ```

2. **Add your Razorpay credentials**:
   ```env
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
   FRONTEND_URL=http://localhost:5173
   ```

### Step 3: Restart Backend Server

After adding the credentials:
```bash
cd fashion-store/backend
# Stop current server (Ctrl+C)
npm start
```

## 🎯 How It Works

1. **User clicks "Pay"** on checkout page
2. **Backend creates order** in database
3. **Backend creates Razorpay Payment Link** with:
   - Pre-filled amount (in paise)
   - Customer details (name, email, phone)
   - Order description
   - Callback URL for verification
4. **User redirected** to Razorpay payment page
5. **Payment page shows**:
   - ✅ Amount already filled
   - ✅ QR code to scan
   - ✅ Payment options (cards, UPI, wallets, etc.)
6. **After payment**, user redirected to `/payment-callback` for verification

## 📱 QR Code Payment

When the payment link opens:
- **QR code is displayed** automatically
- User can **scan with any UPI app** (PhonePe, GPay, Paytm, etc.)
- **Amount is pre-filled** - no manual entry needed
- Customer details are also pre-filled

## 🔐 Security Features

- ✅ Payment signature verification
- ✅ Secure API key storage (environment variables)
- ✅ Callback URL validation
- ✅ Order verification after payment

## 🧪 Testing

### Test Mode
- Use **Test Mode** keys from Razorpay Dashboard
- Use test cards: `4111 1111 1111 1111`
- Test UPI: Any valid UPI ID

### Live Mode
- Switch to **Live Mode** keys in production
- Update `.env` with live credentials
- Ensure HTTPS is enabled

## 📋 Files Modified

- ✅ `backend/controllers/paymentController.js` - Payment link creation
- ✅ `frontend/src/pages/Checkout.jsx` - Payment flow
- ✅ `backend/package.json` - Added razorpay package

## ⚠️ Troubleshooting

### Error: "Razorpay not configured"
- **Solution**: Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `.env` file

### Error: "Payment link creation failed"
- **Solution**: Check Razorpay dashboard for API key status
- Ensure keys are active and have correct permissions

### QR Code not showing
- **Solution**: QR code appears on Razorpay's payment page automatically
- Make sure you're redirected to the payment link URL (not personalized link)

## 🚀 Production Checklist

- [ ] Switch to **Live Mode** API keys
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Enable HTTPS
- [ ] Test payment flow end-to-end
- [ ] Set up payment webhooks (optional)
- [ ] Configure email/SMS notifications

## 📞 Support

- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: https://razorpay.com/support/

