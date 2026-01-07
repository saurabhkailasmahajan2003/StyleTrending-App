# NativeWind CSS Not Applied - Fix Guide

## ✅ Fixed Configuration

### 1. **Metro Config** (`metro.config.js`)
Created Metro config to process CSS files:
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

### 2. **Babel Config** (`babel.config.js`)
Updated Babel to include NativeWind preset:
```javascript
presets: [
  ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
  'nativewind/babel',
],
```

## 🔄 Next Steps

### 1. Clear Cache and Restart
```bash
cd mobile-app
npx expo start --clear
```

### 2. If Still Not Working

**Option A: Reinstall NativeWind**
```bash
cd mobile-app
npm uninstall nativewind tailwindcss
npm install nativewind@^4.0.1 tailwindcss@^3.4.1
```

**Option B: Check Imports**
Make sure `global.css` is imported in `App.js`:
```javascript
import './global.css';
```

**Option C: Verify Tailwind Config**
Check `tailwind.config.js` has correct content paths:
```javascript
content: [
  "./App.{js,jsx,ts,tsx}",
  "./src/**/*.{js,jsx,ts,tsx}"
],
```

## 🐛 Common Issues

1. **Cache Issues**: Always use `--clear` flag
2. **Missing Metro Config**: NativeWind v4 requires metro.config.js
3. **Wrong Babel Preset Order**: NativeWind preset must be after expo preset
4. **CSS Not Imported**: global.css must be imported in App.js

## ✅ Verification

After restarting, check if classes work:
- `className="bg-white"` should show white background
- `className="text-black"` should show black text
- `className="p-4"` should add padding

If styles still don't apply, check the console for errors.

