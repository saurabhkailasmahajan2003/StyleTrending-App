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
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Checkout</Text>
            <Text style={styles.headerSubtitle}>
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Processing Order Overlay */}
        {isProcessingOrder && (
          <View style={styles.processingOverlay}>
            <View style={styles.processingModal}>
              <ActivityIndicator size="large" color="#111827" />
              <Text style={styles.processingTitle}>Placing Your Order</Text>
              <Text style={styles.processingText}>Please wait while we process your order...</Text>
              <View style={styles.stepsContainer}>
                {[1, 2, 3, 4, 5].map((step) => (
                  <View key={step} style={styles.step}>
                    <View
                      style={[
                        styles.stepIndicator,
                        processingStep >= step && styles.stepIndicatorActive,
                      ]}
                    >
                      {processingStep > step ? (
                        <Text style={styles.stepCheck}>✓</Text>
                      ) : processingStep === step ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.stepText,
                        processingStep >= step && styles.stepTextActive,
                      ]}
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            {addressSaved && (
              <View style={styles.savedBadge}>
                <Text style={styles.savedText}>✓ Saved</Text>
              </View>
            )}
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.name}
                onChangeText={(value) => handleInputChange('name', value)}
                placeholder="Enter your full name"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Address <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={shippingAddress.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Enter your complete address"
                multiline
                numberOfLines={3}
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>
                  City <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  value={shippingAddress.city}
                  onChangeText={(value) => handleInputChange('city', value)}
                  placeholder="City"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>State</Text>
                <TextInput
                  style={styles.input}
                  value={shippingAddress.state}
                  onChangeText={(value) => handleInputChange('state', value)}
                  placeholder="State"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>ZIP Code</Text>
                <TextInput
                  style={styles.input}
                  value={shippingAddress.zipCode}
                  onChangeText={(value) => handleInputChange('zipCode', value)}
                  placeholder="ZIP Code"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Country</Text>
                <TextInput
                  style={styles.input}
                  value={shippingAddress.country}
                  onChangeText={(value) => handleInputChange('country', value)}
                  placeholder="Country"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={saveAddress}
              disabled={savingAddress}
              style={[styles.saveButton, savingAddress && styles.saveButtonDisabled]}
            >
              {savingAddress ? (
                <ActivityIndicator size="small" color="#374151" />
              ) : (
                <Text style={styles.saveButtonText}>✓ Save Address</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderItems}>
            {cart.map((item) => {
              const product = item.product || item;
              const price = product.price || product.finalPrice || 0;
              return (
                <View key={item._id || item.id} style={styles.orderItem}>
                  <Text style={styles.orderItemName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.orderItemQty}>Qty: {item.quantity}</Text>
                  <Text style={styles.orderItemPrice}>
                    ₹{(price * item.quantity).toLocaleString()}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ₹{getCartTotal().toLocaleString()}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValueFree}>Free</Text>
            </View>
            <View style={styles.summaryRowTotal}>
              <Text style={styles.summaryTotalLabel}>Total</Text>
              <Text style={styles.summaryTotalValue}>
                ₹{getCartTotal().toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'razorpay' && styles.paymentMethodActive,
              ]}
              onPress={() => setPaymentMethod('razorpay')}
            >
              <View style={styles.radio}>
                {paymentMethod === 'razorpay' && <View style={styles.radioSelected} />}
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>Online Payment</Text>
                <Text style={styles.paymentMethodSubtitle}>Cards, UPI, Wallets</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                paymentMethod === 'COD' && styles.paymentMethodActive,
              ]}
              onPress={() => setPaymentMethod('COD')}
            >
              <View style={styles.radio}>
                {paymentMethod === 'COD' && <View style={styles.radioSelected} />}
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={styles.paymentMethodTitle}>Cash on Delivery</Text>
                <Text style={styles.paymentMethodSubtitle}>Pay on delivery</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Button */}
        <TouchableOpacity
          onPress={handlePayment}
          disabled={loading || isProcessingOrder}
          style={[styles.paymentButton, (loading || isProcessingOrder) && styles.paymentButtonDisabled]}
        >
          {loading || isProcessingOrder ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.paymentButtonText}>
                {isProcessingOrder ? 'Placing Order...' : 'Processing...'}
              </Text>
            </View>
          ) : (
            <Text style={styles.paymentButtonText}>
              {paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By placing your order, you agree to our Terms & Conditions
        </Text>
      </ScrollView>
      <BottomNavBar />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButtonText: {
    fontSize: 24,
    color: '#111827',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 16,
    margin: 16,
    borderRadius: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  processingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  processingText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  stepsContainer: {
    width: '100%',
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorActive: {
    backgroundColor: '#10b981',
  },
  stepCheck: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    color: '#6b7280',
  },
  stepTextActive: {
    color: '#111827',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  savedBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  savedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10b981',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  orderItems: {
    gap: 12,
    marginBottom: 16,
  },
  orderItem: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  orderItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  orderItemQty: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  summary: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  summaryValueFree: {
    color: '#10b981',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  paymentMethods: {
    gap: 12,
    marginTop: 8,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    gap: 12,
  },
  paymentMethodActive: {
    borderColor: '#111827',
    backgroundColor: '#f9fafb',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111827',
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  paymentMethodSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  paymentButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 16,
  },
});

export default CheckoutScreen;
