/**
 * Login Screen - React Native version with NativeWind
 * Converted from web Login.jsx
 * Features: Same JWT API, Secure token storage using Expo SecureStore, Same validation
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    // Validation (same as web)
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        // Navigation will be handled by AuthContext/auth state change
        navigation.navigate('Home');
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
      <SafeAreaView className="flex-1" edges={['top']}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View className="pt-6 pb-4" style={{ paddingHorizontal: 16 }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="w-10 h-10 justify-center items-center rounded-full bg-white"
                style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }}
              >
                <Ionicons name="chevron-back" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View className="flex-1 px-6">
              {/* Logo/Brand Section */}
              <View className="items-center mb-8">
                <View className="w-20 h-20 bg-gray-900 rounded-2xl items-center justify-center mb-4" style={{ elevation: 4 }}>
                  <Text className="text-white text-3xl font-bold">S</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-1">Welcome Back</Text>
                <Text className="text-sm text-gray-500 text-center">Sign in to continue shopping</Text>
              </View>

              <View className="mb-6">
                <Text className="text-2xl font-bold text-gray-900 mb-1">Sign in</Text>
                <Text className="text-sm text-gray-500">
                  Don't have an account?{' '}
                  <Text
                    className="text-gray-900 font-semibold"
                    onPress={() => navigation.navigate('SignUp')}
                  >
                    Sign up
                  </Text>
                </Text>
              </View>

              {/* Error Message */}
              {error && (
                <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex-row items-center" style={{ elevation: 1 }}>
                  <Ionicons name="alert-circle" size={20} color="#dc2626" />
                  <Text className="text-sm text-red-600 ml-2 flex-1">{error}</Text>
                </View>
              )}

              {/* Form */}
              <View className="mb-6">
                {/* Email Input */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
                  <View className="flex-row items-center border border-gray-200 rounded-xl bg-white" style={{ elevation: 1 }}>
                    <View className="pl-4 pr-3">
                      <Ionicons name="mail-outline" size={22} color="#6b7280" />
                    </View>
                    <TextInput
                      className="flex-1 py-4 pr-4 text-base text-gray-900"
                      placeholder="Enter your email"
                      placeholderTextColor="#9ca3af"
                      value={formData.email}
                      onChangeText={(value) => handleChange('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View className="mb-4">
                  <Text className="text-sm font-semibold text-gray-700 mb-2">Password</Text>
                  <View className="flex-row items-center border border-gray-200 rounded-xl bg-white relative" style={{ elevation: 1 }}>
                    <View className="pl-4 pr-3">
                      <Ionicons name="lock-closed-outline" size={22} color="#6b7280" />
                    </View>
                    <TextInput
                      className="flex-1 py-4 pr-14 text-base text-gray-900"
                      placeholder="Enter your password"
                      placeholderTextColor="#9ca3af"
                      value={formData.password}
                      onChangeText={(value) => handleChange('password', value)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      className="absolute right-4 p-1"
                    >
                      <Ionicons name={showPassword ? "eye" : "eye-off"} size={22} color="#6b7280" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remember Me & Forgot Password */}
                <View className="flex-row justify-between items-center mb-6">
                  <TouchableOpacity className="flex-row items-center">
                    <View className="w-5 h-5 border-2 border-gray-300 rounded mr-2 items-center justify-center">
                      {false && <Ionicons name="checkmark" size={14} color="#111827" />}
                    </View>
                    <Text className="text-sm text-gray-600">Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text className="text-sm text-gray-900 font-semibold">Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading}
                  className={`bg-gray-900 py-4 rounded-xl items-center justify-center ${isLoading ? 'opacity-70' : ''}`}
                  style={{ elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
                >
                  {isLoading ? (
                    <View className="flex-row items-center gap-2">
                      <ActivityIndicator size="small" color="#fff" />
                      <Text className="text-white text-base font-semibold">Signing in...</Text>
                    </View>
                  ) : (
                    <Text className="text-white text-base font-semibold">Sign in</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View className="flex-row items-center my-8">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="px-4 text-xs text-gray-500 font-medium">OR</Text>
                <View className="flex-1 h-px bg-gray-200" />
              </View>

              {/* OTP Login Button */}
              <TouchableOpacity
                className="flex-row items-center justify-center py-4 border-2 border-gray-200 rounded-xl bg-white"
                style={{ elevation: 1 }}
                onPress={() => {
                  // Navigate to OTP login if implemented
                  // navigation.navigate('LoginOTP');
                }}
              >
                <Ionicons name="phone-portrait-outline" size={20} color="#374151" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">Login with OTP</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;
