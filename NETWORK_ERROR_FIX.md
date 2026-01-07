# Network Error Fix - Products Not Fetching

## ❌ Error
```
Error fetching fresh drops: Error: Network Error
```

## 🔍 Root Cause
The mobile app cannot connect to the backend server. This is a **network connectivity issue**.

## ✅ Solution Steps

### Step 1: Start the Backend Server

**Open a NEW terminal window** and run:

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server is running on port 5000
✅ All routes registered successfully!
```

**Keep this terminal open** - the backend must be running for the mobile app to work.

### Step 2: Verify Backend is Running

Test the API directly in your browser:
```
http://localhost:5000/api/products/men?limit=10
```

You should see JSON data. If you see an error, the backend is not running correctly.

### Step 3: Check Mobile App API URL

**For Android Emulator:**
1. Open `mobile-app/.env` file (or create it)
2. Add this line:
   ```env
   EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
   ```
   ⚠️ **Important:** Use `10.0.2.2` NOT `localhost` for Android emulator!

**For iOS Simulator:**
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

**For Physical Device:**
1. Find your computer's IP address:
   - Windows: Run `ipconfig` → Look for "IPv4 Address"
   - Mac/Linux: Run `ifconfig` → Look for "inet"
2. Use that IP:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.XXX:5000/api
   ```

### Step 4: Restart Expo

After updating `.env` file:

```bash
cd mobile-app
npx expo start --clear
```

### Step 5: Verify Connection

Check the console logs. You should see:
```
✅ API Base URL: http://10.0.2.2:5000/api
🌐 API Request: GET http://10.0.2.2:5000/api/products/men?limit=10
✅ API Success: ... (200)
```

## 🔧 Quick Checklist

- [ ] Backend server is running (`npm run dev` in backend folder)
- [ ] Backend shows "Server is running on port 5000"
- [ ] `.env` file exists in `mobile-app/` folder
- [ ] `.env` has correct URL for your platform
- [ ] Expo restarted after `.env` changes
- [ ] Can access API in browser: `http://localhost:5000/api/products/men`

## 🚨 Common Issues

### Issue 1: "Backend not running"
**Solution:** Start backend in a separate terminal:
```bash
cd backend
npm run dev
```

### Issue 2: "Wrong URL in .env"
**Solution:** 
- Android Emulator: `http://10.0.2.2:5000/api`
- iOS Simulator: `http://localhost:5000/api`
- Physical Device: `http://YOUR_IP:5000/api`

### Issue 3: "Backend running but still network error"
**Solutions:**
1. Check firewall isn't blocking port 5000
2. Verify backend is actually on port 5000 (check backend/.env)
3. Try accessing backend URL in browser first
4. Check backend logs for errors

### Issue 4: "Can't find .env file"
**Solution:** Create it manually:
```bash
cd mobile-app
echo "EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api" > .env
```

## 📝 Next Steps

1. **Start backend** (most important!)
2. **Create/update .env** file
3. **Restart Expo**
4. **Check console logs** for connection status

The network error will be resolved once the backend is running and the API URL is correctly configured.
