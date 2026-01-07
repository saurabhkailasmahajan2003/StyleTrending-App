# Environment Variables Setup Guide

## ✅ Setup Complete

Environment variables are now configured using `EXPO_PUBLIC_API_URL` with support for both development and production.

## 📋 Configuration

### Environment Variable
- **Variable Name**: `EXPO_PUBLIC_API_URL`
- **Purpose**: API base URL for backend communication
- **Format**: Full URL including protocol and path (e.g., `https://api.example.com/api`)

## 🚀 Setup Instructions

### 1. Create `.env` File

Create a `.env` file in the `mobile-app` directory:

```bash
cd mobile-app
touch .env
```

### 2. Add Environment Variables

Add your API URL to the `.env` file:

**For Development:**
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

**For Production:**
```env
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api
```

### 3. Environment Variable Priority

The system checks for the API URL in this order:

1. **`EXPO_PUBLIC_API_URL`** from `.env` file (highest priority)
2. `Constants.expoConfig.extra.apiBaseUrl` from `app.json`
3. Fallback to `http://localhost:5000/api` (development only)

### 4. Restart Expo

After creating or updating `.env` file:

```bash
# Stop the current Expo server (Ctrl+C)
# Then restart
npm start
# or
npx expo start --clear
```

## 🔧 Configuration Files

### `src/config/env.js`
Handles environment variable loading with proper fallbacks.

### `app.json`
Contains fallback configuration in `extra.apiBaseUrl` field.

## 🌍 Environment-Specific Setup

### Development
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### Staging
```env
EXPO_PUBLIC_API_URL=https://staging-api.example.com/api
```

### Production
```env
EXPO_PUBLIC_API_URL=https://api.example.com/api
```

## 📱 Usage in Code

The API service automatically uses the environment variable:

```javascript
import env from '../config/env';

// env.apiBaseUrl is automatically set from EXPO_PUBLIC_API_URL
const API_BASE_URL = env.apiBaseUrl;
```

## ⚠️ Important Notes

1. **`.env` is gitignored**: Never commit `.env` files to version control
2. **Restart Required**: Changes to `.env` require restarting Expo
3. **EXPO_PUBLIC_ Prefix**: Only variables prefixed with `EXPO_PUBLIC_` are available in Expo
4. **No Hardcoded URLs**: All API URLs should use the environment variable

## 🚢 Production Deployment

### EAS Build
Set environment variables in `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.example.com/api"
      }
    }
  }
}
```

### Expo Go (Development)
Use `.env` file for local development.

### Standalone Builds
Environment variables are baked into the build at build time.

## 🔍 Verification

To verify your environment variable is loaded:

```javascript
import env from './src/config/env';
console.log('API URL:', env.apiBaseUrl);
```

## 📚 Resources

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Build Environment Variables](https://docs.expo.dev/build-reference/variables/)
