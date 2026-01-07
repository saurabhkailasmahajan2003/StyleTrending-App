# 🚨 URGENT: Fix Network Error

## The Problem
Your `.env` file has `http://localhost:5000/api` which **doesn't work on Android emulator**.

## ✅ Quick Fix (2 Steps)

### Step 1: Update .env File

**Open `mobile-app/.env` file** and change:

**FROM:**
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

**TO (for Android Emulator):**
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
```

**OR (for iOS Simulator):**
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 2: Start Backend Server

**Open a NEW terminal** and run:

```bash
cd backend
npm run dev
```

Wait until you see:
```
🚀 Server is running on port 5000
✅ All routes registered successfully!
```

**Keep this terminal open!** The backend must stay running.

### Step 3: Restart Expo

**In your mobile-app terminal**, restart Expo:

```bash
cd mobile-app
npx expo start --clear
```

## ✅ That's It!

After these 3 steps, the network error should be fixed and products will load.

## 🔍 Verify It's Working

Check the console logs. You should see:
```
✅ API Base URL: http://10.0.2.2:5000/api
🌐 API Request: GET http://10.0.2.2:5000/api/products/men?limit=10
✅ API Success: ... (200)
📦 Products loaded: Fresh Drops: X products
```

## ⚠️ Important Notes

1. **Backend MUST be running** - Without it, you'll always get network errors
2. **Android needs 10.0.2.2** - `localhost` doesn't work on Android emulator
3. **Restart Expo after .env changes** - Environment variables load on startup

