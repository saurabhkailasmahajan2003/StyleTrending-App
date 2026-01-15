/**
 * Checkout Screen - React Native version
 * Converted from web Checkout.jsx
 * Features: Razorpay integration, COD support, Same backend APIs
 */
import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { paymentAPI, profileAPI, orderAPI } from '../services/api';
import BottomNavBar from '../components/BottomNavBar';
// Razorpay integration - requires native modules
let RazorpayCheckout;
try {
  RazorpayCheckout = require('react-native-razorpay');
} catch (error) {
  console.warn('Razorpay module not available. Please run: npx expo prebuild');
  RazorpayCheckout = null;
}

const CheckoutScreen = () => {
  const navigation = useNavigation();
  const { cart, getCartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { colors, isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [error, setError] = useState('');
  const [addressSaved, setAddressSaved] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'COD'
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address?.address || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    if (cart.length === 0) {
      navigation.navigate('Cart');
      return;
    }

    // Load user profile to get saved address
    const loadUserProfile = async () => {
      try {
        const response = await profileAPI.getProfile();
        if (response.success && response.data.user) {
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
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, [isAuthenticated, cart.length, navigation]);

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
      const addressData = {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        address: {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state || '',
          zipCode: shippingAddress.zipCode || '',
          country: shippingAddress.country || 'India',
        },
      };

      const response = await profileAPI.updateProfile(addressData);
      if (response.success) {
        setAddressSaved(true);
        setTimeout(() => setAddressSaved(false), 3000);
      } else {
        setError('Failed to save address. Please try again.');
      }
    } catch (err) {
      console.error('Error saving address:', err);
      setError('Failed to save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePayment = async () => {
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
      setError('Please fill in all required shipping address fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Save address automatically before proceeding to payment
      try {
        const addressData = {
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          address: {
            name: shippingAddress.name,
            phone: shippingAddress.phone,
            address: shippingAddress.address,
            city: shippingAddress.city,
            state: shippingAddress.state || '',
            zipCode: shippingAddress.zipCode || '',
            country: shippingAddress.country || 'India',
          },
        };
        await profileAPI.updateProfile(addressData);
      } catch (saveErr) {
        console.error('Error auto-saving address:', saveErr);
        // Continue with payment even if address save fails
      }

      // Handle Cash on Delivery
      if (paymentMethod === 'COD') {
        setIsProcessingOrder(true);
        setLoading(true);
        setProcessingStep(0);

        // Step 1: Validating order details
        setProcessingStep(1);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Step 2: Processing payment method
        setProcessingStep(2);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Step 3: Confirming order
        setProcessingStep(3);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Step 4: Creating order
        setProcessingStep(4);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = await orderAPI.createOrder(shippingAddress, 'COD');

        if (response.success) {
          // Step 5: Order confirmed
          setProcessingStep(5);
          await new Promise((resolve) => setTimeout(resolve, 1000));

          setIsProcessingOrder(false);
          setLoading(false);
          clearCart();

          Alert.alert(
            'Order Placed Successfully!',
            `Your order has been confirmed. Order ID: ${response.data?.order?._id || response.data?.order?.id || 'N/A'}`,
            [
              {
                text: 'View Orders',
                onPress: () => navigation.navigate('Profile', { tab: 'orders' }),
              },
              {
                text: 'Continue Shopping',
                onPress: () => navigation.navigate('Home'),
                style: 'cancel',
              },
            ]
          );
        } else {
          setIsProcessingOrder(false);
          setLoading(false);
          setProcessingStep(0);
          throw new Error(response.message || 'Failed to create order');
        }
        return;
      }

      // Handle Razorpay payment
      if (!RazorpayCheckout) {
        throw new Error('Razorpay module not available. Please run: npx expo prebuild');
      }

      // Create Razorpay order on backend
      const response = await paymentAPI.createRazorpayOrder(shippingAddress);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create payment order');
      }

      const { orderId, amount, currency, key } = response.data;

      // Razorpay options (same as web)
      const options = {
        description: `Order for ${cart.length} item(s)`,
        image: 'https://your-logo-url.com', // Replace with your logo URL
        currency: currency || 'INR',
        key: key, // Razorpay key from backend
        amount: amount, // Amount in paise
        name: 'StyleTrending',
        prefill: {
          email: user?.email || '',
          contact: shippingAddress.phone,
          name: shippingAddress.name,
        },
        theme: { color: '#000000' },
      };

      // Open Razorpay checkout
      RazorpayCheckout.open(options)
        .then(async (data) => {
          // Payment successful - verify payment on backend
          try {
            const verifyResponse = await paymentAPI.verifyPayment(
              data.razorpay_order_id,
              data.razorpay_payment_id,
              data.razorpay_signature
            );

            if (verifyResponse.success) {
              clearCart();
              setLoading(false);

              Alert.alert(
                'Payment Successful!',
                'Your order has been placed successfully.',
                [
                  {
                    text: 'View Orders',
                    onPress: () => navigation.navigate('Profile', { tab: 'orders' }),
                  },
                  {
                    text: 'Continue Shopping',
                    onPress: () => navigation.navigate('Home'),
                    style: 'cancel',
                  },
                ]
              );
            } else {
              setError('Payment verification failed. Please contact support.');
              setLoading(false);
            }
          } catch (err) {
            console.error('Payment verification error:', err);
            setError('Payment verification failed. Please contact support.');
            setLoading(false);
          }
        })
        .catch((error) => {
          // Payment failed or cancelled
          console.error('Payment error:', error);
          if (error.code !== 'BAD_REQUEST_ERROR' && error.description !== 'Payment cancelled by user') {
            setError(`Payment failed: ${error.description || error.message || 'Unknown error'}`);
          }
          setLoading(false);
        });
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
    }
  };

  if (!isAuthenticated || cart.length === 0) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
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
              <View style={{ backgroundColor: isDark ? '#7F1D1D' : '#FEF2F2', borderLeftWidth: 4, borderLeftColor: colors.error, padding: 16, margin: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="alert-circle" size={20} color={colors.error} />
                <Text style={{ fontSize: 14, color: colors.error, flex: 1, marginLeft: 12 }}>{error}</Text>
              </View>
            ) : null}

            {/* Processing Order Overlay */}
            {isProcessingOrder && (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.overlay, justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                <View style={{ backgroundColor: colors.card, borderRadius: 16, padding: 24, width: '90%', maxWidth: 400, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
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
                </View>
              </View>
            )}

            {/* Shipping Address Form */}
            <View style={{ backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="location-outline" size={20} color={colors.primary} />
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Shipping Address</Text>
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
                    style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, backgroundColor: colors.background, height: 90, textAlignVertical: 'top' }}
                    value={shippingAddress.address}
                    onChangeText={(value) => handleInputChange('address', value)}
                    placeholder="Enter your complete address"
                    multiline
                    numberOfLines={3}
                    placeholderTextColor={colors.textTertiary}
                  />
                </View>

                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      City <Text style={{ color: colors.error }}>*</Text>
                    </Text>
                    <TextInput
                      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, backgroundColor: colors.background }}
                      value={shippingAddress.city}
                      onChangeText={(value) => handleInputChange('city', value)}
                      placeholder="City"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>

                  <View style={{ flex: 1, marginLeft: 6 }}>
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

                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <View style={{ flex: 1, marginRight: 6 }}>
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

                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Country</Text>
                    <TextInput
                      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: colors.text, backgroundColor: colors.background }}
                      value={shippingAddress.country}
                      onChangeText={(value) => handleInputChange('country', value)}
                      placeholder="Country"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={saveAddress}
                  disabled={savingAddress}
                  style={{ backgroundColor: colors.backgroundTertiary, paddingVertical: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginTop: 8, flexDirection: 'row', justifyContent: 'center', opacity: savingAddress ? 0.6 : 1 }}
                >
                  {savingAddress ? (
                    <ActivityIndicator size="small" color={colors.text} />
                  ) : (
                    <>
                      <Ionicons name="save-outline" size={18} color={colors.text} />
                      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginLeft: 8 }}>Save Address</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Order Summary */}
            <View style={{ backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
                <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Order Summary</Text>
              </View>
              <View style={{ marginBottom: 20 }}>
                {cart.map((item) => {
                  const product = item.product || item;
                  const price = product.price || product.finalPrice || 0;
                  return (
                    <View key={item._id || item.id} style={{ paddingBottom: 16, marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
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

              <View style={{ paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>Subtotal</Text>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: colors.text }}>
                    ₹{getCartTotal().toLocaleString()}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 14, color: colors.textSecondary }}>Shipping</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.success, marginLeft: 4 }}>Free</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 16, borderTopWidth: 2, borderTopColor: colors.border }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Total</Text>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: colors.primary }}>
                    ₹{getCartTotal().toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Payment Method Selection */}
            <View style={{ backgroundColor: colors.card, marginHorizontal: 16, marginTop: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 20, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
                <Ionicons name="card-outline" size={20} color={colors.primary} />
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Payment Method</Text>
              </View>
              <View>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 2, borderColor: paymentMethod === 'razorpay' ? colors.primary : colors.border,
                    borderRadius: 12, backgroundColor: paymentMethod === 'razorpay' ? (isDark ? '#1A1A1A' : '#F9FAFB') : colors.card, marginBottom: 12,
                  }}
                  onPress={() => setPaymentMethod('razorpay')}
                  activeOpacity={0.7}
                >
                  <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: paymentMethod === 'razorpay' ? colors.primary : colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: paymentMethod === 'razorpay' ? colors.primary : 'transparent', marginRight: 16 }}>
                    {paymentMethod === 'razorpay' && <Ionicons name="checkmark" size={14} color={isDark ? '#000000' : '#FFFFFF'} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="wallet-outline" size={18} color={paymentMethod === 'razorpay' ? colors.primary : colors.textSecondary} />
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginLeft: 8 }}>Online Payment</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: colors.textSecondary }}>Cards, UPI, Wallets</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row', alignItems: 'center', padding: 16, borderWidth: 2, borderColor: paymentMethod === 'COD' ? colors.primary : colors.border,
                    borderRadius: 12, backgroundColor: paymentMethod === 'COD' ? (isDark ? '#1A1A1A' : '#F9FAFB') : colors.card,
                  }}
                  onPress={() => setPaymentMethod('COD')}
                  activeOpacity={0.7}
                >
                  <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: paymentMethod === 'COD' ? colors.primary : colors.border, justifyContent: 'center', alignItems: 'center', backgroundColor: paymentMethod === 'COD' ? colors.primary : 'transparent', marginRight: 16 }}>
                    {paymentMethod === 'COD' && <Ionicons name="checkmark" size={14} color={isDark ? '#000000' : '#FFFFFF'} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <Ionicons name="cash-outline" size={18} color={paymentMethod === 'COD' ? colors.primary : colors.textSecondary} />
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginLeft: 8 }}>Cash on Delivery</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: colors.textSecondary }}>Pay on delivery</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* Payment Button */}
            <TouchableOpacity
              onPress={handlePayment}
              disabled={loading || isProcessingOrder}
              style={{
                backgroundColor: (loading || isProcessingOrder) ? colors.backgroundTertiary : colors.primary,
                paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginHorizontal: 16, marginTop: 24,
                shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
                opacity: (loading || isProcessingOrder) ? 0.6 : 1,
              }}
              activeOpacity={0.8}
            >
              {loading || isProcessingOrder ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={isDark ? '#000000' : '#FFFFFF'} />
                  <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 17, fontWeight: '700', marginLeft: 12 }}>
                    {isProcessingOrder ? 'Placing Order...' : 'Processing...'}
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 17, fontWeight: '700' }}>
                    {paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'}
                  </Text>
                  <Ionicons name={paymentMethod === 'COD' ? 'checkmark-circle' : 'card'} size={20} color={isDark ? '#000000' : '#FFFFFF'} style={{ marginLeft: 8 }} />
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
