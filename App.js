/**
 * Main App Component
 * Sets up providers and navigation
 * 
 * IMPORTANT: Import gesture handler at the very top
 */
import 'react-native-gesture-handler';
import './global.css';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { NotificationProvider } from './src/context/NotificationContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/components/SplashScreen';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator />
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

