# Quick Setup Guide - Razorpay Payment Link

## ⚠️ Current Issue
You're seeing "Payment link not generated" because Razorpay API keys are not configured.

## ✅ Quick Fix (3 Steps)

### Step 1: Get Your Razorpay API Keys

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Login or Sign up
3. Go to **Settings** → **API Keys**
4. If you don't have keys, click **Generate Test Key** (for testing) or **Generate Live Key** (for production)
5. Copy:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret** (long string)

### Step 2: Create `.env` File

1. Navigate to `fashion-store/backend/` folder
2. Create a file named `.env` (if it doesn't exist)
3. Add these lines:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/fashion_store
JWT_SECRET=your_jwt_secret_key_here

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx

# Frontend URL (for payment callbacks)
FRONTEND_URL=http://localhost:5173

PORT=5001
NODE_ENV=development
```

4. **Replace** `rzp_test_xxxxxxxxxxxxx` with your actual Key ID
5. **Replace** `xxxxxxxxxxxxxxxxxxxxxxxx` with your actual Key Secret

### Step 3: Restart Backend Server

1. **Stop** the current backend server (press `Ctrl+C` in the terminal)
2. **Start** it again:
   ```bash
   cd fashion-store/backend
   node server.js
   ```

## ✅ Verify Setup

After restarting, when you click "Pay" button, you should see in the backend logs:
```
Creating Razorpay payment link...
Razorpay Payment Link created successfully: plink_xxxxx
Payment Link URL: https://rzp.io/i/xxxxx
```

## 📱 What Happens Next

Once configured:
1. ✅ Payment link will be created automatically
2. ✅ Amount will be pre-filled (no manual entry)
3. ✅ QR code will be displayed on Razorpay page
4. ✅ User can scan and pay instantly

## 🔍 Troubleshooting

### Error: "Razorpay not configured"
- ✅ Check `.env` file exists in `fashion-store/backend/`
- ✅ Check `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are present
- ✅ Restart backend server after adding keys

### Error: "Invalid API key"
- ✅ Check if keys are copied correctly (no extra spaces)
- ✅ Check if using Test keys in test mode
- ✅ Verify keys are active in Razorpay dashboard

### Error: "Payment link creation failed"
- ✅ Check backend console for detailed error
- ✅ Verify Razorpay account is active
- ✅ Check internet connection

## 🚀 Need Help?

Check the backend terminal logs - they will show the exact error message from Razorpay API.

