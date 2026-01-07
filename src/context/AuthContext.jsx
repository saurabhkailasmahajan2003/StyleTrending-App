import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { storage } from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = await storage.getToken('token');
      const savedUser = await storage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token with backend
          const response = await authAPI.getMe();
          if (response.success) {
            setUser(response.data.user);
          } else {
            // Token invalid, clear storage
            await storage.removeToken('token');
            await storage.removeItem('user');
          }
        } catch (error) {
          // Token invalid or expired
          await storage.removeToken('token');
          await storage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.success) {
        const { token, user: userData } = response.data;
        await storage.setToken('token', token);
        await storage.setItem('user', userData);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const signup = async (name, email, password, phone) => {
    try {
      const response = await authAPI.signup({ name, email, password, phone });
      if (response.success) {
        const { token, user: userData } = response.data;
        await storage.setToken('token', token);
        await storage.setItem('user', userData);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    setUser(null);
    await storage.removeToken('token');
    await storage.removeItem('user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    signup,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

