# ⚡ Quick Fix: Update .env File

## Action Required

**You need to manually update your `.env` file** to use the hosted backend.

### Step 1: Open `.env` file

Open `mobile-app/.env` file in your editor.

### Step 2: Update the API URL

**Change this line:**

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

**To this:**

```env
EXPO_PUBLIC_API_URL=https://astra-fashion-backend.onrender.com/api
```

### Step 3: Save and Restart

1. Save the `.env` file
2. Restart Expo:
   ```bash
   cd mobile-app
   npx expo start --clear
   ```

## ✅ That's It!

After restarting, the app will use the hosted backend and products should load.

## 🔍 Verify

Check console logs. You should see:
```
✅ API Base URL: https://astra-fashion-backend.onrender.com/api
🌐 API Request: GET https://astra-fashion-backend.onrender.com/api/products/men?limit=10
✅ API Success: ... (200)
```

## 📝 Note

The code has been updated to use the hosted backend as default, but if you have a `.env` file, it will override the default. Make sure your `.env` file has the correct URL.

