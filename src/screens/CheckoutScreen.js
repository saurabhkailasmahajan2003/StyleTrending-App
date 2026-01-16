import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
  Animated,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { profileAPI, orderAPI } from '../services/api';
import BottomNavBar from '../components/BottomNavBar';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const { cart, getCartTotal, clearCart, isLoading: cartLoading, loadCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const { notifyOrderPlaced } = useNotifications();
  const { colors, isDark } = theme || { colors: { background: '#FFFFFF', text: '#000000', primary: '#000000', card: '#FFFFFF', border: '#E5E7EB', textSecondary: '#666666', backgroundTertiary: '#F3F4F6', error: '#EF4444', overlay: 'rgba(0, 0, 0, 0.5)', success: '#10B981', shadow: '#000000' }, isDark: false };

  // Log when component mounts
  useEffect(() => {
    console.log('✅ CheckoutScreen mounted');
    return () => {
      console.log('❌ CheckoutScreen unmounted');
    };
  }, []);

  const [loading, setLoading] = useState(true);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState('');
  const [addressSaved, setAddressSaved] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ Checkout loading timeout - forcing stop');
        setLoading(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [loading]);

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address?.address || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
  });

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      let hasInitialized = false;

      const initializeCheckout = async () => {
        if (hasInitialized) {
          console.log('⏭️ Already initialized, skipping...');
          return;
        }
        hasInitialized = true;

        try {
          console.log('🔄 Initializing checkout screen...');
          setLoading(true);

          if (!isMounted) return;

          if (!isAuthenticated) {
            console.log('⚠️ User not authenticated, redirecting to login');
            setLoading(false);
            setTimeout(() => {
              if (isMounted) {
                navigation.navigate('Login');
              }
            }, 300);
            return;
          }

          // Load user profile for address
          try {
            console.log('📋 Loading user profile...');
            const response = await profileAPI.getProfile();
            if (response.success && response.data.user && isMounted) {
              const userData = response.data.user;
              if (userData.address) {
                setShippingAddress({
                  name: userData.address.name || userData.name || '',
                  phone: userData.address.phone || userData.phone || '',
                  address: userData.address.address || '',
                  city: userData.address.city || '',
                  state: userData.address.state || '',
                  zipCode: userData.address.zipCode || '',
                  country: userData.address.country || 'India',
                });
                console.log('✅ Address loaded from profile');
              }
            }
          } catch (error) {
            console.error('❌ Error loading user profile:', error);
          }
        } catch (error) {
          console.error('❌ Error initializing checkout:', error);
        } finally {
          if (isMounted) {
            console.log('✅ Checkout initialization complete - setting loading to false');
            setLoading(false);
          }
        }
      };

      // Initialize immediately
      initializeCheckout();

      return () => {
        isMounted = false;
      };
    }, [isAuthenticated, navigation])
  );

  const handleInputChange = (name, value) => {
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
    if (addressSaved) {
      setAddressSaved(false);
    }
  };

  const saveAddress = async () => {
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      setError('Please fill in all required fields before saving');
      return;
    }

    setSavingAddress(true);
    setError('');
    try {
      const response = await profileAPI.updateProfile({
        address: {
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.zipCode || '',
          country: shippingAddress.country || 'India',
        },
      });
      if (response.success) {
        setAddressSaved(true);
        Alert.alert('Success', 'Address saved successfully!');
      } else {
        setError(response.message || 'Failed to save address.');
      }
    } catch (err) {
      setError(err.message || 'Failed to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      setError('Please fill in all required shipping address fields');
      Alert.alert('Missing Information', 'Please fill in all required shipping address fields (Name, Phone, Address, City)');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty. Please add items before placing an order.');
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before placing an order.');
      return;
    }

    // Smooth animation for processing overlay
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    setIsProcessingOrder(true);
    setLoading(true);
    setProcessingStep(0);
    setError('');

    // Animate overlay fade in
    Animated.spring(overlayOpacity, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    try {
      // Fast validation step
      setProcessingStep(1);
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Quick payment processing step
      setProcessingStep(2);
      await new Promise((resolve) => setTimeout(resolve, 250));

      // Fast confirmation step
      setProcessingStep(3);
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Creating order step
      setProcessingStep(4);
      
      console.log('📦 Creating COD order with:', {
        shippingAddress,
        paymentMethod: 'COD',
        cartItemsCount: cart.length,
        cartTotal: getCartTotal()
      });

      const response = await orderAPI.createOrder(shippingAddress, 'COD');

      console.log('📦 Order creation response:', JSON.stringify(response, null, 2));

      if (response && response.success) {
        // Quick confirmation step
        setProcessingStep(5);
        await new Promise((resolve) => setTimeout(resolve, 300));

        const orderId = response.data?.order?._id || response.data?.order?.id || response.data?._id || response.order?._id;
        const orderTotal = getCartTotal();
        const orderData = response.data?.order || response.data || { _id: orderId };

        console.log('✅ Order created successfully:', { 
          orderId, 
          orderTotal,
          responseData: response.data,
          fullResponse: response
        });

        if (!orderId) {
          console.warn('⚠️ Warning: Order ID not found in response, using timestamp as fallback');
        }

        // Add notification for order placed
        try {
          notifyOrderPlaced({
            ...orderData,
            orderNumber: orderData.orderNumber || orderId?.slice(-8) || `ORD-${Date.now()}`,
            _id: orderId || orderData._id
          });
        } catch (notifError) {
          console.warn('Failed to add order notification:', notifError);
        }

        // Clear cart and navigate smoothly
        await clearCart();
        
        // Animate overlay fade out before navigation
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setIsProcessingOrder(false);
          setLoading(false);
        });

        // Small delay for smooth transition
        await new Promise((resolve) => setTimeout(resolve, 250));

        // Navigate to OrderSuccess screen
        try {
          navigation.replace('OrderSuccess', {
            orderId: orderId || `temp-${Date.now()}`,
            method: 'COD',
            orderTotal: orderTotal
          });
          console.log('✅ Navigation to OrderSuccess completed');
        } catch (navError) {
          console.error('❌ Navigation error:', navError);
          // Fallback: try navigate instead of replace
          navigation.navigate('OrderSuccess', {
            orderId: orderId || `temp-${Date.now()}`,
            method: 'COD',
            orderTotal: orderTotal
          });
        }
      } else {
        const errorMessage = response?.message || response?.error || response?.data?.message || 'Failed to create order. Please try again.';
        console.error('❌ Order creation failed:', {
          errorMessage,
          response,
          responseData: response?.data,
          fullResponse: JSON.stringify(response, null, 2)
        });
        // Animate overlay fade out on error
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setIsProcessingOrder(false);
          setLoading(false);
        });
        setProcessingStep(0);
        setError(errorMessage);
        Alert.alert('Order Failed', errorMessage);
      }
    } catch (orderErr) {
      console.error('❌ Order creation error:', {
        message: orderErr.message,
        response: orderErr.response?.data,
        status: orderErr.response?.status,
        fullError: JSON.stringify(orderErr, null, 2)
      });
      const errorMessage = orderErr.message || 
                          orderErr.response?.data?.message || 
                          orderErr.response?.data?.error ||
                          `Failed to create order. ${orderErr.response?.status ? `Status: ${orderErr.response.status}` : ''}`;
      // Animate overlay fade out on error
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsProcessingOrder(false);
        setLoading(false);
      });
      setProcessingStep(0);
      setError(errorMessage);
      Alert.alert('Order Failed', errorMessage);
    }
  };

  // Only show loading screen during initial load, not during cart loading
  useEffect(() => {
    console.log('🔄 Loading state changed:', loading, 'isAuthenticated:', isAuthenticated, 'cart.length:', cart.length);
  }, [loading, isAuthenticated, cart.length]);

  if (loading) {
    console.log('⏳ Showing loading screen...');
    return (
      <View style={{ flex: 1, backgroundColor: colors?.background || '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors?.primary || '#000000'} />
        <Text style={{ marginTop: 16, color: colors?.text || '#000000' }}>Loading checkout...</Text>
      </View>
    );
  }

  console.log('✅ Loading complete, checking conditions...', { isAuthenticated, cartLength: cart.length });

  if (!isAuthenticated) {
    console.log('⚠️ Not authenticated, showing login redirect');
    return (
      <View style={{ flex: 1, backgroundColor: colors?.background || '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors?.primary || '#000000'} />
        <Text style={{ marginTop: 16, color: colors?.text || '#000000' }}>Redirecting to login...</Text>
      </View>
    );
  }

  if (cart.length === 0) {
    console.log('⚠️ Cart is empty, showing empty cart message');
    return (
      <View style={{ flex: 1, backgroundColor: colors?.background || '#FFFFFF', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="cart-outline" size={64} color={colors?.textSecondary || '#999999'} />
        <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '600', color: colors?.text || '#000000' }}>Your cart is empty</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Cart')}
          style={{ marginTop: 24, backgroundColor: colors?.primary || '#000000', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
        >
          <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Go to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log('✅ All conditions passed, rendering checkout form...');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: colors.backgroundTertiary }}
              >
                <Ionicons name="chevron-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Checkout</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </Text>
              </View>
              <View style={{ width: 40 }} />
            </View>

            {/* Error Message */}
            {error ? (
              <View style={{ backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2', borderLeftWidth: 4, borderLeftColor: colors.error, padding: 16, margin: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', zIndex: 999 }}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={{ fontSize: 14, color: colors.error, flex: 1, marginLeft: 12, fontWeight: '600' }}>{error}</Text>
                <TouchableOpacity
                  onPress={() => setError('')}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Processing Order Overlay */}
            {isProcessingOrder && (
              <Animated.View 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  right: 0, 
                  bottom: 0, 
                  backgroundColor: colors.overlay, 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  zIndex: 1000,
                  opacity: overlayOpacity,
                }}
              >
                <Animated.View 
                  style={{ 
                    backgroundColor: colors.card, 
                    borderRadius: 16, 
                    padding: 24, 
                    width: '90%', 
                    maxWidth: 400, 
                    alignItems: 'center', 
                    borderWidth: 1, 
                    borderColor: colors.border,
                    transform: [{
                      scale: overlayOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.9, 1],
                      })
                    }]
                  }}
                >
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 }}>Placing Your Order</Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 24, textAlign: 'center' }}>Please wait while we process your order...</Text>
                  <View style={{ width: '100%' }}>
                    {[1, 2, 3, 4, 5].map((step) => (
                      <View key={step} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View
                          style={{
                            width: 28, height: 28, borderRadius: 14, backgroundColor: processingStep >= step ? colors.success : colors.backgroundTertiary,
                            justifyContent: 'center', alignItems: 'center',
                          }}
                        >
                          {processingStep > step ? (
                            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                          ) : processingStep === step ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                          ) : null}
                        </View>
                        <Text
                          style={{
                            fontSize: 14, color: processingStep >= step ? colors.text : colors.textSecondary,
                            fontWeight: processingStep >= step ? '600' : '400',
                            marginLeft: 12,
                          }}
                        >
                          {step === 1 ? 'Validating order' :
                            step === 2 ? 'Processing payment' :
                            step === 3 ? 'Confirming order' :
                            step === 4 ? 'Creating order' :
                            step === 5 ? 'Order confirmed' : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                </Animated.View>
              </Animated.View>
            )}

            {/* Shipping Address Form */}
            <View style={{ backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                  <Ionicons name="location-outline" size={20} color={colors.primary} />
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginLeft: 8 }}>Shipping Address</Text>
                </View>
                {addressSaved ? (
                  <View style={{ backgroundColor: isDark ? '#064E3B' : '#D1FAE5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.success, marginLeft: 4 }}>Saved</Text>
                  </View>
                ) : null}
              </View>

              <View>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Full Name <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, backgroundColor: colors.background }}
                    value={shippingAddress.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Phone Number <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, backgroundColor: colors.background }}
                    value={shippingAddress.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Address <Text style={{ color: colors.error }}>*</Text>
                  </Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, backgroundColor: colors.background }}
                    value={shippingAddress.address}
                    onChangeText={(value) => handleInputChange('address', value)}
                    placeholder="House No., Building, Street, Area"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>City <Text style={{ color: colors.error }}>*</Text></Text>
                    <TextInput
                      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, backgroundColor: colors.background }}
                      value={shippingAddress.city}
                      onChangeText={(value) => handleInputChange('city', value)}
                      placeholder="City"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>State</Text>
                    <TextInput
                      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, backgroundColor: colors.background }}
                      value={shippingAddress.state}
                      onChangeText={(value) => handleInputChange('state', value)}
                      placeholder="State"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </View>

                <View style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>ZIP Code</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, backgroundColor: colors.background }}
                    value={shippingAddress.zipCode}
                    onChangeText={(value) => handleInputChange('zipCode', value)}
                    placeholder="ZIP Code"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <TouchableOpacity
                  onPress={saveAddress}
                  disabled={savingAddress}
                  style={{
                    backgroundColor: savingAddress ? colors.backgroundTertiary : colors.primary,
                    paddingVertical: 14, borderRadius: 10, alignItems: 'center',
                    opacity: savingAddress ? 0.7 : 1,
                  }}
                  activeOpacity={0.8}
                >
                  {savingAddress ? (
                    <ActivityIndicator size="small" color={isDark ? '#000000' : '#FFFFFF'} />
                  ) : (
                    <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                      {addressSaved ? 'Address Saved!' : 'Save Address'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Order Summary */}
            <View style={{ backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginLeft: 8 }}>Order Summary</Text>
              </View>
              <View style={{ marginBottom: 20 }}>
                {cart.map((item) => {
                  const product = item.product || item;
                  const price = product.price || product.finalPrice || 0;
                  return (
                    <View key={item._id || item.id} style={{ paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 6 }} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, color: colors.textSecondary }}>Qty: {item.quantity}</Text>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                          ₹{(price * item.quantity).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 15, color: colors.textSecondary }}>Subtotal</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>₹{getCartTotal().toLocaleString()}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 15, color: colors.textSecondary }}>Shipping</Text>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>Free</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Total</Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: colors.primary }}>₹{getCartTotal().toLocaleString()}</Text>
                </View>
              </View>
            </View>

            {/* Payment Method - COD Only */}
            <View style={{ backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                <Ionicons name="card-outline" size={20} color={colors.primary} />
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginLeft: 8 }}>Payment Method</Text>
              </View>
              <View>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 2, borderColor: colors.primary,
                    borderRadius: 12, backgroundColor: isDark ? '#1A1A1A' : '#F9FAFB',
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.primary, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary, marginRight: 16 }}>
                    <Ionicons name="checkmark" size={14} color={isDark ? '#000000' : '#FFFFFF'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="cash-outline" size={18} color={colors.primary} />
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginLeft: 8 }}>Cash on Delivery</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: colors.textSecondary }}>Pay on delivery</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Place Order Button */}
            <TouchableOpacity
              onPress={handlePlaceOrder}
              disabled={isProcessingOrder}
              style={{
                backgroundColor: isProcessingOrder ? colors.backgroundTertiary : colors.primary,
                paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginHorizontal: 16, marginTop: 24,
                shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
                opacity: isProcessingOrder ? 0.6 : 1,
              }}
              activeOpacity={0.8}
            >
              {isProcessingOrder ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={isDark ? '#000000' : '#FFFFFF'} />
                  <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 17, fontWeight: '700', marginLeft: 12 }}>
                    Placing Order...
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 17, fontWeight: '700' }}>
                    Place Order
                  </Text>
                  <Ionicons name="checkmark-circle" size={20} color={isDark ? '#000000' : '#FFFFFF'} style={{ marginLeft: 8 }} />
                </View>
              )}
            </TouchableOpacity>

            <Text style={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center', marginTop: 16, marginHorizontal: 16, lineHeight: 18 }}>
              By placing your order, you agree to our{' '}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Terms & Conditions</Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <BottomNavBar />
    </View>
  );
};

export default CheckoutScreen;
