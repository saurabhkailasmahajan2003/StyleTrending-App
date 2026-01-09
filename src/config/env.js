/**
 * Environment Configuration
 * Loads environment variables from Expo
 * 
 * Priority:
 * 1. EXPO_PUBLIC_API_URL (from .env file)
 * 2. Fallback with Android emulator support
 */

import { Platform } from 'react-native';

// Get environment variables
const getEnvVars = () => {
  // EXPO_PUBLIC_* variables are available in Expo
  // They can be set in .env file
  let apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;

  // If not set, use hosted backend as default
  if (!apiBaseUrl) {
    // Use hosted backend by default
    apiBaseUrl = 'https://api.styletrending.in/api';
    console.log('ℹ️ Using default hosted backend:', apiBaseUrl);
  }

  // Ensure URL ends with /api if it doesn't already
  if (apiBaseUrl && !apiBaseUrl.endsWith('/api')) {
    // If it's the base domain, add /api
    if (apiBaseUrl.includes('onrender.com') && !apiBaseUrl.includes('/api')) {
      apiBaseUrl = `${apiBaseUrl}/api`;
    }
  }

  if (!apiBaseUrl) {
    console.error(
      '⚠️ EXPO_PUBLIC_API_URL is not set. Please set it in .env file'
    );
    console.error(
      '📱 For hosted backend: Use https://astra-fashion-backend.onrender.com/api'
    );
    console.error(
      '📱 For local development: Use http://10.0.2.2:5000/api (Android) or http://localhost:5000/api (iOS)'
    );
  } else {
    console.log('✅ API Base URL:', apiBaseUrl);
    
    // Warn if using localhost on Android
    if (Platform.OS === 'android' && apiBaseUrl.includes('localhost')) {
      console.error('❌ WARNING: localhost does not work on Android emulator!');
      console.error('   Change .env to: EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api');
      console.error('   Or use hosted backend: EXPO_PUBLIC_API_URL=https://astra-fashion-backend.onrender.com/api');
      console.error('   Then restart Expo: npx expo start --clear');
    }
  }

  return {
    apiBaseUrl: apiBaseUrl || '',
    isDevelopment: __DEV__,
  };
};

export default getEnvVars();

