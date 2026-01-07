# 🚀 How to Start Backend Server

## Quick Start

**Open a NEW terminal window** and run:

```bash
cd backend
npm run dev
```

## What You Should See

```
✅ Connected to MongoDB Atlas
🚀 Server is running on port 5000
📋 Registered API Routes:
   ✓ /api/auth
   ✓ /api/products/*
   ✓ /api/admin
   ✓ /api/cart
   ✓ /api/orders
   ✓ /api/profile
   ✓ /api/payment
   ✓ /api/reviews
✅ All routes registered successfully!
```

## ⚠️ Important

1. **Keep this terminal open** - Backend must stay running
2. **Don't close this terminal** - Mobile app needs backend to work
3. **Check for errors** - If you see errors, fix them before using mobile app

## Test Backend

Open in browser: `http://localhost:5000/api/products/men?limit=10`

You should see JSON data. If you see an error, the backend has issues.

## Troubleshooting

**If backend won't start:**
1. Check if port 5000 is already in use
2. Verify `.env` file exists in `backend/` folder
3. Run `npm install` in backend folder
4. Check backend logs for specific errors

