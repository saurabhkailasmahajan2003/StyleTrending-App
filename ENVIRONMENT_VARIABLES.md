# Environment Variables Configuration

## ✅ Setup Complete

Environment variables are now properly configured for Expo with support for both development and production environments.

## 📋 Environment Variable

### `EXPO_PUBLIC_API_URL`
- **Type**: String (URL)
- **Required**: Yes (for production)
- **Description**: Base URL for the backend API
- **Example**: `https://api.example.com/api`

## 🚀 Quick Start

### 1. Create `.env` File

Create a `.env` file in the `mobile-app` directory:

```bash
cd mobile-app
cp env.example .env
```

### 2. Set Your API URL

Edit `.env` and set your API URL:

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### 3. Restart Expo

```bash
npx expo start --clear
```

## 🔧 How It Works

### Priority Order

The system checks for the API URL in this order:

1. **`EXPO_PUBLIC_API_URL`** from `.env` file (highest priority)
2. `Constants.expoConfig.extra.apiBaseUrl` from `app.json`
3. Fallback to `http://localhost:5000/api` (development only)

### Configuration Files

#### `src/config/env.js`
- Loads environment variables
- Provides fallback values
- Exports `apiBaseUrl` and `isDevelopment`

#### `app.json`
- Contains fallback configuration
- Uses `${EXPO_PUBLIC_API_URL}` placeholder

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

## 🚢 Production Deployment

### EAS Build

Create `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.example.com/api"
      }
    },
    "development": {
      "env": {
        "EXPO_PUBLIC_API_URL": "http://localhost:5000/api"
      }
    }
  }
}
```

### Environment Variables in EAS

You can also set environment variables in EAS dashboard or via CLI:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://api.example.com/api
```

## ⚠️ Important Notes

1. **`.env` is gitignored**: Never commit `.env` files
2. **Restart Required**: Changes require restarting Expo
3. **EXPO_PUBLIC_ Prefix**: Only variables with this prefix are available
4. **No Hardcoded URLs**: All API calls use `env.apiBaseUrl`

## 🔍 Verification

Check if environment variable is loaded:

```javascript
import env from './src/config/env';
console.log('API URL:', env.apiBaseUrl);
console.log('Is Development:', env.isDevelopment);
```

## 📚 Files

- `src/config/env.js` - Environment configuration
- `app.json` - Expo configuration
- `.env` - Local environment variables (gitignored)
- `env.example` - Example environment file

## 🐛 Troubleshooting

### Variable Not Loading
1. Ensure variable name starts with `EXPO_PUBLIC_`
2. Restart Expo server with `--clear` flag
3. Check `.env` file is in `mobile-app` directory
4. Verify no typos in variable name

### Production Build Issues
1. Set environment variables in EAS build configuration
2. Ensure variables are set before building
3. Check EAS build logs for environment variable errors

