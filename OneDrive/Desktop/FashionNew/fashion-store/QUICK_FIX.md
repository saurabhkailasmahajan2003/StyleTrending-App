# 🔧 QUICK FIX - Add Razorpay Keys

## The Problem
Your `.env` file has Razorpay keys **commented out** (lines start with `#`). They need to be **uncommented** and filled with your actual keys.

## ✅ Solution (2 minutes)

### Step 1: Open `.env` file
Open: `fashion-store/backend/.env`

### Step 2: Uncomment and Update
**FIND these lines:**
```env
# RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
# RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
```

**REPLACE with your actual keys:**
```env
RAZORPAY_KEY_ID=rzp_test_YOUR_ACTUAL_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_ACTUAL_KEY_SECRET_HERE
```

**Important:**
- Remove the `#` at the start
- Replace with your actual keys from Razorpay Dashboard
- **NO spaces** around the `=` sign
- Save the file

### Step 3: Get Your Keys (if you don't have them)

1. Go to: https://dashboard.razorpay.com/
2. Login/Sign up
3. Go to **Settings** → **API Keys**
4. Click **Generate Test Key** (for testing)
5. Copy:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (long string)

### Step 4: Restart Backend

1. **Stop** server: Press `Ctrl+C` in terminal
2. **Start** again:
   ```bash
   cd fashion-store/backend
   node server.js
   ```

## ✅ Verify It Works

After restart, when you click "Pay", you should see in backend logs:
```
Creating Razorpay payment link...
Razorpay Payment Link created successfully: plink_xxxxx
Payment Link URL: https://rzp.io/i/xxxxx
```

If you see errors, check:
- Keys are uncommented (no `#`)
- Keys are correct (copied from Razorpay)
- Backend was restarted after changes

