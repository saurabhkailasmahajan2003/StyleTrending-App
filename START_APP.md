# How to Start the App

## Quick Start

1. **Navigate to mobile-app directory:**
   ```bash
   cd mobile-app
   ```

2. **Clear cache and start Expo:**
   ```bash
   npx expo start --clear
   ```

3. **If port 8081 is busy, use a different port:**
   ```bash
   npx expo start --clear --port 8082
   ```

## Troubleshooting

### Port Already in Use
If you see "Port 8081 is being used by another process":

**Option 1: Kill the process using the port**
```powershell
# Find the process
netstat -ano | findstr :8081

# Kill it (replace PID with the process ID from above)
taskkill /PID <PID> /F
```

**Option 2: Use a different port**
```bash
npx expo start --clear --port 8082
```

### App Not Starting
1. **Clear all caches:**
   ```bash
   npx expo start --clear
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules
   npm install
   npx expo start --clear
   ```

3. **Check for errors in terminal:**
   - Look for red error messages
   - Check for missing dependencies
   - Verify all screen files exist

### Common Issues

1. **Reanimated Error:**
   - Already fixed - drawer navigator is configured correctly
   - If error persists, clear cache: `npx expo start --clear`

2. **SafeAreaView Warning:**
   - This is just a warning, not an error
   - App should still work

3. **Module Not Found:**
   - Run `npm install` to ensure all dependencies are installed
   - Clear cache: `npx expo start --clear`

## Running on Device/Emulator

After `npx expo start --clear`:
- Press `a` for Android emulator
- Press `i` for iOS simulator
- Scan QR code with Expo Go app on your phone
