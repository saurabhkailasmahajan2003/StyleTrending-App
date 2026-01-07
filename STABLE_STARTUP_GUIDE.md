# Stable Startup Guide - Fix All Issues Once

## Root Causes of Startup Issues

1. **NativeWind v4 Configuration Complexity** - Requires specific Metro + Babel setup
2. **Reanimated Plugin Conflicts** - Must be last in plugins array
3. **Cache Issues** - Metro bundler cache can cause persistent errors
4. **Dependency Version Mismatches** - Expo SDK 54 has strict requirements

## ✅ Bulletproof Configuration

### Step 1: Clean Everything
```bash
cd mobile-app
rm -rf node_modules
rm -rf .expo
rm -rf .metro
npm cache clean --force
```

### Step 2: Reinstall Dependencies
```bash
npm install
npx expo install --fix
```

### Step 3: Verify Critical Files

**babel.config.js** (MINIMAL - No NativeWind Babel plugin needed):
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // MUST be last
    ],
  };
};
```

**metro.config.js** (NativeWind v4 setup):
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

### Step 4: Start with Clean Cache
```bash
npx expo start --clear
```

## 🔧 If Still Not Working

### Option A: Temporarily Remove NativeWind (Test Basic App)
1. Comment out NativeWind in `metro.config.js`
2. Use `StyleSheet` instead of `className`
3. Get app running first, then re-enable NativeWind

### Option B: Check for Specific Errors
1. Read the FULL error message
2. Check which file is causing the issue
3. Verify that file's imports and syntax

## 📋 Pre-Flight Checklist

Before starting, verify:
- [ ] `package.json` has correct Expo SDK 54 versions
- [ ] `babel.config.js` is minimal (no NativeWind plugin)
- [ ] `metro.config.js` uses `withNativeWind` correctly
- [ ] `App.js` imports `react-native-gesture-handler` first
- [ ] `global.css` exists and has Tailwind directives
- [ ] `assets/icon.png` and `assets/splash.png` exist
- [ ] `.env` file exists with `EXPO_PUBLIC_API_URL`

## 🚨 Common Errors & Quick Fixes

### Error: ".plugins is not a valid Plugin property"
**Fix:** Remove `nativewind/babel` from `babel.config.js` plugins array

### Error: "Unable to resolve asset"
**Fix:** Create missing asset files or update `app.json` paths

### Error: "Cannot find module"
**Fix:** Run `npm install` and `npx expo install --fix`

### Error: "Network Error"
**Fix:** Check `.env` file has correct `EXPO_PUBLIC_API_URL`

## 💡 Pro Tips

1. **Always use `--clear` flag** when starting: `npx expo start --clear`
2. **One change at a time** - Don't change multiple configs simultaneously
3. **Check terminal output** - The first error is usually the real issue
4. **Version lock** - Use exact versions (`~54.0.0` not `^54.0.0`) for Expo packages

## 🎯 Success Criteria

App should start when you see:
```
Metro waiting on exp://192.168.x.x:8081
› Press a │ open Android
```

No red errors in terminal = SUCCESS ✅

