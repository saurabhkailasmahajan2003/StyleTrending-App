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
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { login } = useAuth();
  const { colors, isDark } = useTheme();

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
        // Navigate to Main which contains the Home screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={{ paddingTop: 20, paddingBottom: 12, paddingHorizontal: 20 }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ 
                  width: 44, 
                  height: 44, 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  borderRadius: 22, 
                  backgroundColor: colors.backgroundTertiary,
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}>
              {/* Logo/Brand Section */}
              <View style={{ alignItems: 'center', marginBottom: 48 }}>
                <View style={{ 
                  width: 96, 
                  height: 96, 
                  backgroundColor: colors.primary, 
                  borderRadius: 24, 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  marginBottom: 24,
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}>
                  <Text style={{ 
                    color: isDark ? '#000000' : '#FFFFFF', 
                    fontSize: 40, 
                    fontWeight: '800',
                    letterSpacing: -1,
                  }}>
                    ST
                  </Text>
                </View>
                <Text style={{ fontSize: 32, fontWeight: '800', color: colors.text, marginBottom: 8, letterSpacing: -0.5 }}>Welcome Back</Text>
                <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 }}>Sign in to continue your shopping journey</Text>
              </View>

              <View style={{ marginBottom: 32 }}>
                <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 12, letterSpacing: -0.3 }}>Sign in</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, color: colors.textSecondary }}>
                    Don't have an account?{' '}
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('SignUp')} activeOpacity={0.7}>
                    <Text style={{ fontSize: 15, color: colors.primary, fontWeight: '700' }}>
                      Sign up
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message */}
              {error ? (
                <View style={{ 
                  backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2', 
                  borderLeftWidth: 4, 
                  borderLeftColor: colors.error, 
                  borderRadius: 12, 
                  padding: 16, 
                  marginBottom: 24, 
                  flexDirection: 'row', 
                  alignItems: 'center',
                }}>
                  <Ionicons name="alert-circle" size={20} color={colors.error} />
                  <Text style={{ fontSize: 14, color: colors.error, marginLeft: 12, flex: 1, lineHeight: 20 }}>{error}</Text>
                </View>
              ) : null}

              {/* Form */}
              <View style={{ marginBottom: 32 }}>
                {/* Email Input */}
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email Address</Text>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    borderWidth: 2, 
                    borderColor: colors.border, 
                    borderRadius: 14, 
                    backgroundColor: colors.card,
                    paddingHorizontal: 4,
                  }}>
                    <View style={{ paddingLeft: 16, paddingRight: 12 }}>
                      <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                    </View>
                    <TextInput
                      style={{ flex: 1, paddingVertical: 16, paddingRight: 16, fontSize: 16, color: colors.text }}
                      placeholder="Email"
                      placeholderTextColor={colors.textTertiary}
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
                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Password</Text>
                  <View style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    borderWidth: 2, 
                    borderColor: colors.border, 
                    borderRadius: 14, 
                    backgroundColor: colors.card,
                    paddingHorizontal: 4,
                    position: 'relative',
                  }}>
                    <View style={{ paddingLeft: 16, paddingRight: 12 }}>
                      <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                    </View>
                    <TextInput
                      style={{ flex: 1, paddingVertical: 16, paddingRight: 56, fontSize: 16, color: colors.text }}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.textTertiary}
                      value={formData.password}
                      onChangeText={(value) => handleChange('password', value)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 16, padding: 8 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remember Me & Forgot Password */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} activeOpacity={0.7}>
                    <View style={{ 
                      width: 20, 
                      height: 20, 
                      borderWidth: 2, 
                      borderColor: colors.border, 
                      borderRadius: 5, 
                      marginRight: 10, 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: colors.card,
                    }}>
                      {false && <Ionicons name="checkmark" size={14} color={colors.primary} />}
                    </View>
                    <Text style={{ fontSize: 14, color: colors.textSecondary }}>Remember me</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>Forgot password?</Text>
                  </TouchableOpacity>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading}
                  style={{ 
                    backgroundColor: colors.primary, 
                    paddingVertical: 18, 
                    borderRadius: 14, 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    opacity: isLoading ? 0.7 : 1,
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 6,
                  }}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <ActivityIndicator size="small" color={isDark ? '#000000' : '#FFFFFF'} />
                      <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 17, fontWeight: '700', marginLeft: 12 }}>Signing in...</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 17, fontWeight: '700' }}>Sign in</Text>
                      <Ionicons name="arrow-forward" size={20} color={isDark ? '#000000' : '#FFFFFF'} style={{ marginLeft: 8 }} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 32 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.borderLight }} />
                <Text style={{ paddingHorizontal: 16, fontSize: 12, color: colors.textTertiary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>OR</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.borderLight }} />
              </View>

              {/* OTP Login Button */}
              <TouchableOpacity
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  paddingVertical: 16, 
                  borderWidth: 2, 
                  borderColor: colors.border, 
                  borderRadius: 14, 
                  backgroundColor: colors.card,
                }}
                activeOpacity={0.7}
                onPress={() => {
                  // Navigate to OTP login if implemented
                  // navigation.navigate('LoginOTP');
                }}
              >
                <Ionicons name="phone-portrait-outline" size={20} color={colors.text} />
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginLeft: 10 }}>Login with OTP</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default LoginScreen;
