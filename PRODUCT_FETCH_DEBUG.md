# Product Fetch Debugging Guide

## Issue
Products are not getting fetched from the API.

## Enhanced Debugging Added

### 1. API Service (`src/services/api.js`)
- ✅ Added API base URL logging on first call
- ✅ Added request URL logging for each API call
- ✅ Added success/error logging with details
- ✅ Added network error detection
- ✅ Added 30-second timeout
- ✅ Better error messages

### 2. HomeScreen (`src/screens/HomeScreen.js`)
- ✅ Enhanced logging for each API call
- ✅ Shows success/failure for each category
- ✅ Shows product counts
- ✅ Shows error details

## How to Debug

### Step 1: Check Console Logs
When the app starts, you should see:
```
✅ API Base URL: http://10.0.2.2:5000/api
🔗 API Configuration:
   Base URL: http://10.0.2.2:5000/api
   Endpoint: /products/men?limit=10&category=shoes
🌐 API Request: GET http://10.0.2.2:5000/api/products/men?limit=10&category=shoes
```

### Step 2: Check for Errors

**If you see:**
```
⚠️ EXPO_PUBLIC_API_URL is not set
```
**Solution:** Create/update `.env` file with:
```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
```

**If you see:**
```
❌ API Error: Network error: Unable to reach server
```
**Possible causes:**
1. Backend server not running
2. Wrong API URL (check `.env` file)
3. Firewall blocking connection
4. Backend not accessible from emulator/device

**If you see:**
```
❌ API Error: 404 Not Found
```
**Possible causes:**
1. Wrong endpoint path
2. Backend route not registered
3. API URL missing `/api` prefix

**If you see:**
```
❌ API Error: 500 Internal Server Error
```
**Possible causes:**
1. Backend database connection issue
2. Backend code error
3. Missing environment variables in backend

### Step 3: Verify Backend

1. **Check if backend is running:**
   ```bash
   cd backend
   npm run dev
   ```
   Should see: `🚀 Server is running on port 5000`

2. **Test API endpoint directly:**
   ```bash
   curl http://localhost:5000/api/products/men?limit=10
   ```
   Or open in browser: `http://localhost:5000/api/products/men?limit=10`

3. **Check backend logs** for any errors

### Step 4: Verify Environment

1. **Check `.env` file exists:**
   ```bash
   cd mobile-app
   cat .env
   ```

2. **For Android Emulator:**
   ```env
   EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
   ```

3. **For iOS Simulator:**
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:5000/api
   ```

4. **For Physical Device:**
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_COMPUTER_IP:5000/api
   ```
   Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)

### Step 5: Restart Everything

1. **Restart Expo:**
   ```bash
   cd mobile-app
   npx expo start --clear
   ```

2. **Restart Backend:**
   ```bash
   cd backend
   npm run dev
   ```

## Common Issues & Solutions

### Issue 1: "API Base URL is not configured"
**Solution:** Create `.env` file in `mobile-app/` directory

### Issue 2: "Network error: Unable to reach server"
**Solutions:**
- Ensure backend is running on port 5000
- Check `.env` has correct URL for your platform
- For Android: Use `10.0.2.2` not `localhost`
- For physical device: Use your computer's IP address

### Issue 3: "404 Not Found"
**Solutions:**
- Verify backend routes are registered
- Check API URL includes `/api` prefix
- Test endpoint in browser/Postman

### Issue 4: Products return empty arrays
**Solutions:**
- Check backend database has products
- Verify API endpoints return data
- Check backend logs for errors

## Next Steps

1. **Check console logs** - Look for the debug messages
2. **Share the console output** - This will help identify the exact issue
3. **Verify backend is running** - Test API endpoints directly
4. **Check `.env` file** - Ensure correct API URL

The enhanced logging will show exactly where the issue is occurring.

