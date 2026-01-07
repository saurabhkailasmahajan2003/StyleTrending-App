# Mobile App Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd mobile-app
npm install
```

### 2. Configure API URL

**Important:** Update the API base URL in `src/services/api.js`:

```javascript
// For development on physical device, use your computer's IP:
// Example: 'http://192.168.1.100:5000/api'
const API_BASE_URL = 'http://localhost:5000/api';
```

**To find your IP address:**
- Windows: Run `ipconfig` in CMD, look for IPv4 Address
- Mac/Linux: Run `ifconfig` or `ip addr`, look for inet address

### 3. Start Development Server

```bash
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app on your phone

## Project Structure

```
mobile-app/
├── src/
│   ├── screens/          # Screen components (pages)
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── ProductDetailScreen.js
│   │   └── ...
│   ├── components/       # Reusable UI components
│   ├── services/         # API services
│   │   └── api.js        # All API calls
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.js
│   ├── context/          # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── WishlistContext.jsx
│   └── utils/            # Utility functions
│       └── storage.js     # Storage helpers
├── App.js                # Root component
├── app.json              # Expo config
└── package.json          # Dependencies
```

## What's Already Done ✅

- ✅ Project structure created
- ✅ API service adapted from web (uses AsyncStorage for tokens)
- ✅ Context providers (Auth, Cart, Wishlist) - adapted from web
- ✅ Navigation structure set up
- ✅ Storage utilities (AsyncStorage + SecureStore)
- ✅ Placeholder screens created
- ✅ Root App.js with all providers

## What's Next 🚀

1. **Convert Screens** - Replace placeholder screens with actual implementations
2. **Create Components** - Build reusable UI components (ProductCard, etc.)
3. **Add Styling** - Use NativeWind or StyleSheet
4. **Payment Integration** - Add Razorpay React Native SDK
5. **Image Handling** - Optimize images with expo-image
6. **Testing** - Test on real devices

## Key Differences from Web

| Web | Mobile |
|-----|--------|
| `localStorage` | `AsyncStorage` / `SecureStore` |
| `react-router-dom` | `@react-navigation/native` |
| `<div>`, `<img>`, etc. | `<View>`, `<Image>`, etc. |
| CSS/Tailwind | StyleSheet or NativeWind |
| `window` object | React Native APIs |

## Troubleshooting

### "Network request failed"
- Check if backend is running
- Use IP address instead of localhost for physical devices
- Ensure phone and computer are on same network

### "Module not found"
- Run `npm install` again
- Clear cache: `npm start -- --clear`
- Delete `node_modules` and reinstall

### Expo Go not connecting
- Ensure phone and computer are on same WiFi
- Try tunnel mode: `npm start -- --tunnel`
- Check firewall settings

## Development Tips

1. **Hot Reload**: Changes auto-reload in Expo Go
2. **Debugging**: Shake device → "Debug Remote JS"
3. **Logs**: Check Metro bundler terminal
4. **API Testing**: Use your computer's IP for physical devices

## Next Steps

See `MOBILE_CONVERSION_ANALYSIS.md` in the root directory for detailed conversion plan.

