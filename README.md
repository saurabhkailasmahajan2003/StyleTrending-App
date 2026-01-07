# Astra Fashion Mobile App

React Native mobile application built with Expo SDK 51 for the Astra Fashion e-commerce platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Installation

```bash
# Navigate to mobile app directory
cd mobile-app

# Install dependencies
npm install

# Start development server
npm start
```

### Environment Setup

1. **Option 1: Using .env file** (Recommended)
   ```bash
   # Copy example file
   cp .env.example .env
   
   # Edit .env and set your API URL
   EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api
   ```

2. **Option 2: Using app.json**
   ```json
   {
     "expo": {
       "extra": {
         "apiBaseUrl": "http://localhost:5000/api"
       }
     }
   }
   ```

**Important:** For testing on a physical device, replace `localhost` with your computer's IP address:
- Windows: Run `ipconfig` and find IPv4 Address
- Mac/Linux: Run `ifconfig` or `ip addr`

Example: `http://192.168.1.100:5000/api`

## 📁 Project Structure

```
mobile-app/
├── src/
│   ├── screens/          # Screen components (pages)
│   │   ├── HomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── ProductDetailScreen.js
│   │   └── ...
│   ├── components/       # Reusable UI components
│   │   └── (to be created)
│   ├── services/         # API services
│   │   └── api.js        # Axios-based API client
│   ├── navigation/       # Navigation configuration
│   │   └── AppNavigator.js
│   ├── context/          # React Context providers
│   │   ├── AuthContext.jsx
│   │   ├── CartContext.jsx
│   │   └── WishlistContext.jsx
│   ├── config/           # Configuration files
│   │   ├── env.js        # Environment variables
│   │   └── constants.js  # App constants
│   ├── utils/            # Utility functions
│   │   └── storage.js     # Storage helpers
│   └── types/            # Type definitions (JSDoc)
│       └── index.js
├── App.js                # Root component
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── .env.example          # Environment variables template
```

## 🛠️ Tech Stack

- **Framework:** Expo SDK 51
- **React Native:** 0.74.1
- **Navigation:** React Navigation v6
- **HTTP Client:** Axios
- **Storage:** AsyncStorage + SecureStore
- **State Management:** React Context API

## 📦 Key Features

- ✅ Latest Expo SDK 51
- ✅ Axios for API calls with interceptors
- ✅ Environment variable configuration
- ✅ React Navigation setup
- ✅ Scalable folder structure
- ✅ Authentication context
- ✅ Cart management
- ✅ Wishlist functionality
- ✅ Secure token storage

## 🔧 API Configuration

The API service is configured in `src/services/api.js`:

- **Base URL:** Loaded from environment variables
- **Authentication:** Automatic token injection via interceptors
- **Error Handling:** Global error handling with interceptors
- **Timeout:** 30 seconds default

### Using the API

```javascript
import { authAPI, productAPI } from '../services/api';

// Login
const response = await authAPI.login(email, password);

// Get products
const products = await productAPI.getWatches({ limit: 10 });
```

## 🧭 Navigation

Navigation is set up using React Navigation:

- **Stack Navigator:** For screen transitions
- **Tab Navigator:** Ready for bottom tabs (if needed)
- **Auth Flow:** Separate stack for login/signup

### Navigation Example

```javascript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

// Navigate to screen
navigation.navigate('ProductDetail', { productId: '123' });

// Go back
navigation.goBack();
```

## 💾 Storage

Storage utilities in `src/utils/storage.js`:

- **SecureStore:** For sensitive data (tokens)
- **AsyncStorage:** For general data

```javascript
import { storage } from '../utils/storage';

// Store token
await storage.setToken('token', tokenValue);

// Get token
const token = await storage.getToken('token');

// Store general data
await storage.setItem('key', data);
```

## 🧪 Development

### Running on Different Platforms

```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on Web
npm run web
```

### Debugging

- **React Native Debugger:** Shake device → "Debug Remote JS"
- **Console Logs:** Check Metro bundler terminal
- **Network Requests:** Check Network tab in debugger

## 📱 Building for Production

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 🔐 Environment Variables

Environment variables are loaded from:
1. `.env` file (EXPO_PUBLIC_* prefix)
2. `app.json` extra field
3. Default fallback values

Access in code:
```javascript
import env from './src/config/env';

console.log(env.apiBaseUrl);
```

## 📚 Next Steps

1. Convert web screens to React Native
2. Create reusable components
3. Add styling (NativeWind or StyleSheet)
4. Implement payment integration (Razorpay)
5. Add image optimization
6. Set up error boundaries
7. Add loading states
8. Implement pull-to-refresh

## 🤝 Contributing

1. Follow the existing folder structure
2. Use the API service for all network requests
3. Use Context providers for state management
4. Follow React Native best practices

## 📄 License

Private - Astra Fashion

## 🆘 Troubleshooting

### API Connection Issues
- Check if backend server is running
- Verify API URL in `.env` or `app.json`
- For physical devices, use IP address not localhost
- Check network connectivity

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --clear
```

### Navigation Issues
- Ensure `react-native-gesture-handler` is imported at the top of `App.js`
- Check that all screens are properly registered

---

**Built with ❤️ using Expo**
