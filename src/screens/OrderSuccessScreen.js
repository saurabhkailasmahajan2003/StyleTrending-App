/**
 * Order Success Screen - React Native version
 * Converted from web OrderSuccess.jsx
 * Features: Order confirmation, timeline, invoice
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { orderAPI } from '../services/api';
import { storage } from '../utils/storage';
import BottomNavBar from '../components/BottomNavBar';

const OrderSuccessScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { notifyOrderPlaced } = useNotifications();
  
  const paymentMethod = route.params?.method || 'COD';
  const orderId = route.params?.orderId || '';
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderTotal, setOrderTotal] = useState(0);

  // Generate order number
  const orderNumber = orderId ? orderId.slice(-8).toUpperCase() : `ORD${Date.now().toString().slice(-8)}`;
  
  // Estimated delivery (5-7 days)
  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 3) + 5);

  // Fetch order details
  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        setLoadingOrder(true);
        try {
          const response = await orderAPI.getOrder(orderId);
          if (response.success) {
            setOrder(response.data.order);
            // Trigger notification for order placed
            notifyOrderPlaced(response.data.order);
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        } finally {
          setLoadingOrder(false);
        }
      };
      fetchOrder();
    }
  }, [orderId]);

  // Get order total from storage
  useEffect(() => {
    const getStoredTotal = async () => {
      const stored = await storage.getItem('lastOrderTotal');
      if (stored) {
        setOrderTotal(parseFloat(stored));
        await storage.removeItem('lastOrderTotal');
      }
    };
    getStoredTotal();
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigation.navigate('Profile', { tab: 'orders' });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigation]);

  const handleGoToOrders = () => {
    navigation.navigate('Profile', { tab: 'orders' });
  };

  const handleContinueShopping = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: 20, paddingTop: 24, alignItems: 'center', justifyContent: 'center', minHeight: 600 }}>
        {/* Success Icon */}
        <View style={{
          width: 96,
          height: 96,
          backgroundColor: '#dcfce7',
          borderRadius: 48,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Text style={{ fontSize: 48 }}>✓</Text>
        </View>

        {/* Success Message */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#111', marginBottom: 12, textAlign: 'center' }}>
          Order Placed Successfully! 🎉
        </Text>

        {/* Order Number */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: '#f3f4f6',
          borderRadius: 8,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#666', marginRight: 8 }}>Order Number:</Text>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#111' }}>#{orderNumber}</Text>
        </View>

        <Text style={{ color: '#666', fontSize: 16, marginBottom: 24, textAlign: 'center' }}>
          Your order has been confirmed and will be processed shortly.
        </Text>

        {/* Order Details Cards */}
        <View style={{ width: '100%', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            {/* Estimated Delivery */}
            <View style={{
              flex: 1,
              backgroundColor: '#dbeafe',
              borderWidth: 1,
              borderColor: '#93c5fd',
              borderRadius: 12,
              padding: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>📅</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#1e3a8a', textTransform: 'uppercase' }}>
                  Estimated Delivery
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e40af' }}>
                {estimatedDelivery.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
              <Text style={{ fontSize: 12, color: '#1e40af', marginTop: 4 }}>5-7 business days</Text>
            </View>

            {/* Payment Method */}
            <View style={{
              flex: 1,
              backgroundColor: '#f3e8ff',
              borderWidth: 1,
              borderColor: '#c084fc',
              borderRadius: 12,
              padding: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>💳</Text>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#6b21a8', textTransform: 'uppercase' }}>
                  Payment Method
                </Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#7c3aed' }}>
                {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
              </Text>
              {paymentMethod === 'COD' && (
                <Text style={{ fontSize: 12, color: '#7c3aed', marginTop: 4 }}>Pay on delivery</Text>
              )}
            </View>
          </View>

          {/* Order Summary */}
          {orderTotal > 0 && (
            <View style={{
              backgroundColor: '#f9fafb',
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 12,
              padding: 16,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>📋</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111' }}>Order Summary</Text>
              </View>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: '#666' }}>Order Total</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#111' }}>
                    ₹{orderTotal.toLocaleString()}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: '#666' }}>Payment Method</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#111' }}>
                    {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, color: '#666' }}>Order Date</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: '#111' }}>
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Order Timeline */}
        <View style={{
          width: '100%',
          backgroundColor: '#f9fafb',
          borderWidth: 1,
          borderColor: '#e5e7eb',
          borderRadius: 12,
          padding: 16,
          marginBottom: 24,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
            <Text style={{ fontSize: 20, marginRight: 12 }}>🚚</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 12 }}>
                Order Timeline
              </Text>
              <View style={{ gap: 12 }}>
                {[
                  { status: 'Order confirmed', time: 'Just now' },
                  { status: 'Processing', time: 'Within 24hrs' },
                  { status: 'Shipped', time: '2-3 days' },
                  { status: 'Delivered', time: estimatedDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
                ].map((item, index) => (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: index === 0 ? '#22c55e' : '#d1d5db',
                      marginRight: 12,
                    }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, color: index === 0 ? '#111' : '#666' }}>
                        {item.status}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 12, color: '#999' }}>{item.time}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Countdown */}
        <View style={{ width: '100%', marginBottom: 24, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: '#22c55e',
              marginRight: 8,
            }} />
            <Text style={{ fontSize: 12, color: '#666' }}>
              Redirecting to orders page in{' '}
              <Text style={{ fontWeight: 'bold', color: '#111' }}>{countdown}</Text>
              {' '}second{countdown !== 1 ? 's' : ''}...
            </Text>
          </View>
          <View style={{ width: '100%', height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
            <View style={{
              height: '100%',
              backgroundColor: '#22c55e',
              width: `${((10 - countdown) / 10) * 100}%`,
            }} />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ width: '100%', gap: 12 }}>
          <TouchableOpacity
            onPress={() => setShowInvoice(true)}
            style={{
              backgroundColor: '#2563eb',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>View Invoice</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleGoToOrders}
            style={{
              backgroundColor: '#000',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>View My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleContinueShopping}
            style={{
              backgroundColor: '#fff',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#d1d5db',
            }}
          >
            <Text style={{ color: '#111', fontSize: 16, fontWeight: '600' }}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Invoice Modal */}
      <Modal
        visible={showInvoice}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInvoice(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Invoice</Text>
            <TouchableOpacity onPress={() => setShowInvoice(false)}>
              <Text style={{ fontSize: 24 }}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {loadingOrder ? (
              <View style={{ alignItems: 'center', padding: 40 }}>
                <ActivityIndicator size="large" color="#000" />
                <Text style={{ marginTop: 16, color: '#666' }}>Loading invoice...</Text>
              </View>
            ) : order ? (
              <View>
                <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16 }}>Order Details</Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                  Order ID: {order._id}
                </Text>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                  Total: ₹{order.totalAmount?.toLocaleString()}
                </Text>
                {/* Add more invoice details as needed */}
              </View>
            ) : (
              <Text style={{ color: '#666', textAlign: 'center', padding: 40 }}>
                Invoice details not available
              </Text>
            )}
          </ScrollView>
        </View>
      </Modal>
      </ScrollView>
      <BottomNavBar />
    </View>
  );
};

export default OrderSuccessScreen;

