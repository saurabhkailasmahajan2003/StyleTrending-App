import { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '../utils/storage';

const THEME_STORAGE_KEY = 'app_theme';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState('system'); // 'light', 'dark', 'system'
  const [isDark, setIsDark] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    loadTheme();
  }, []);

  // Update isDark based on theme and system preference
  useEffect(() => {
    if (theme === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(theme === 'dark');
    }
  }, [theme, systemColorScheme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await storage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async (newTheme) => {
    try {
      setTheme(newTheme);
      await storage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Theme colors
  const colors = {
    // Background colors
    background: isDark ? '#000000' : '#FFFFFF',
    backgroundSecondary: isDark ? '#111111' : '#F9FAFB',
    backgroundTertiary: isDark ? '#1A1A1A' : '#F3F4F6',
    
    // Text colors
    text: isDark ? '#FFFFFF' : '#111827',
    textSecondary: isDark ? '#9CA3AF' : '#6B7280',
    textTertiary: isDark ? '#6B7280' : '#9CA3AF',
    
    // Border colors
    border: isDark ? '#1F1F1F' : '#E5E7EB',
    borderLight: isDark ? '#2A2A2A' : '#F3F4F6',
    
    // Primary colors
    primary: isDark ? '#FFFFFF' : '#000000',
    primaryLight: isDark ? '#2A2A2A' : '#F3F4F6',
    
    // Accent colors
    accent: '#000000',
    accentLight: isDark ? '#2A2A2A' : '#F9FAFB',
    
    // Bottom nav colors
    bottomNav: isDark ? '#000000' : '#FFFFFF',
    bottomNavActive: isDark ? '#FFFFFF' : '#000000',
    bottomNavInactive: isDark ? '#6B7280' : '#6B7280',
    
    // Card colors
    card: isDark ? '#111111' : '#FFFFFF',
    cardBorder: isDark ? '#1F1F1F' : '#E5E7EB',
    
    // Status colors
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Shadow
    shadow: isDark ? '#000000' : '#000000',
    
    // Overlay
    overlay: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
