# Hosted Backend Setup

## ✅ Configuration Updated

Your mobile app is now configured to use the hosted backend:
**https://astra-fashion-backend.onrender.com/api**

## 🔧 What Changed

1. **Default API URL** - Now uses hosted backend by default
2. **`.env` file** - Updated to use hosted backend
3. **Auto-detection** - Automatically adds `/api` suffix if needed

## 📝 Current Configuration

The app will use:
```
https://astra-fashion-backend.onrender.com/api
```

## 🚀 Next Steps

### Option 1: Use Hosted Backend (Recommended)

1. **Update `.env` file** (if it exists):
   ```env
   EXPO_PUBLIC_API_URL=https://astra-fashion-backend.onrender.com/api
   ```

2. **Restart Expo:**
   ```bash
   cd mobile-app
   npx expo start --clear
   ```

3. **That's it!** No need to run local backend.

### Option 2: Use Local Backend (Development)

If you want to use local backend for development:

1. **Update `.env` file:**
   ```env
   # For Android Emulator
   EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
   
   # For iOS Simulator
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   ```

2. **Start local backend:**
   ```bash
   cd backend
   npm run dev
   ```

3. **Restart Expo**

## ✅ Verification

After restarting, check console logs. You should see:
```
✅ API Base URL: https://astra-fashion-backend.onrender.com/api
🌐 API Request: GET https://astra-fashion-backend.onrender.com/api/products/men?limit=10
✅ API Success: ... (200)
```

## 🔍 Testing

Test the hosted backend directly:
```
https://astra-fashion-backend.onrender.com/api/products/men?limit=10
```

If this returns JSON data, the backend is working!

## 📱 Benefits of Hosted Backend

- ✅ No need to run local backend
- ✅ Works on all devices (emulator, simulator, physical)
- ✅ Always available
- ✅ Same URL for all platforms

## ⚠️ Notes

- The hosted backend must be accessible and running
- If hosted backend is down, you'll get network errors
- For local development, you can still use local backend by updating `.env`

