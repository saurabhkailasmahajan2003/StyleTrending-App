/**
 * Track Order Screen - React Native version
 * Converted from web TrackOrder.jsx
 * Features: Order tracking, timeline, same API calls
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { trackingAPI } from '../services/api';
import BottomNavBar from '../components/BottomNavBar';

const TrackOrderScreen = () => {
  const navigation = useNavigation();
  const { isAuthenticated } = useAuth();
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    setError('');
    setTrackingData(null);
    
    if (!orderId.trim()) {
      setError('Please enter an order ID');
      return;
    }

    setLoading(true);
    try {
      const response = await trackingAPI.trackOrder(orderId.trim());
      if (response.success) {
        setTrackingData(response.data);
      } else {
        const errorMsg = response.message || 'Order not found';
        setError(errorMsg);
        Alert.alert('Error', errorMsg);
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to track order. Please try again.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'delivered') {
      return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
    } else if (statusLower === 'shipped' || statusLower === 'in transit') {
      return { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' };
    } else if (statusLower === 'out for delivery') {
      return { bg: '#fef3c7', text: '#92400e', border: '#fde047' };
    }
    return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f9fafb' }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16, paddingTop: 24 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
          >
            <Text style={{ fontSize: 20, marginRight: 8 }}>←</Text>
            <Text style={{ color: '#666', fontSize: 14 }}>Back</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#111', marginBottom: 8 }}>
            Track Your Order
          </Text>
          <Text style={{ color: '#666', fontSize: 16 }}>
            Enter your order ID or tracking number to check the status of your order.
          </Text>
        </View>

        {/* Track Order Form */}
        <View style={{ 
          backgroundColor: '#fff', 
          borderRadius: 12, 
          padding: 16, 
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <TextInput
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: '#d1d5db',
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontSize: 16,
              }}
              placeholder="Enter Order ID or Tracking Number"
              value={orderId}
              onChangeText={setOrderId}
              onSubmitEditing={handleTrack}
            />
            <TouchableOpacity
              onPress={handleTrack}
              disabled={loading}
              style={{
                backgroundColor: loading ? '#9ca3af' : '#000',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
                justifyContent: 'center',
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontWeight: '600' }}>Track</Text>
              )}
            </TouchableOpacity>
          </View>
          {error && (
            <Text style={{ color: '#dc2626', fontSize: 14, marginTop: 8 }}>{error}</Text>
          )}
        </View>

        {/* View Orders if Logged In */}
        {isAuthenticated && (
          <View style={{
            backgroundColor: '#dbeafe',
            borderWidth: 1,
            borderColor: '#93c5fd',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>ℹ️</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600', color: '#1e3a8a', marginBottom: 4 }}>
                  View All Orders
                </Text>
                <Text style={{ fontSize: 14, color: '#1e40af', marginBottom: 12 }}>
                  You can view and track all your orders from your account dashboard.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Profile', { tab: 'orders' })}
                >
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#1e3a8a', textDecorationLine: 'underline' }}>
                    Go to My Orders →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Tracking Results */}
        {trackingData && (
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}>
            <View style={{ marginBottom: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 24, fontWeight: '600', color: '#111', marginBottom: 8 }}>
                    Order #{trackingData.orderId}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#666' }}>
                    Tracking Number: {trackingData.trackingNumber}
                  </Text>
                </View>
                <View style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: getStatusColor(trackingData.status).bg,
                  borderWidth: 1,
                  borderColor: getStatusColor(trackingData.status).border,
                }}>
                  <Text style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: getStatusColor(trackingData.status).text,
                    textTransform: 'capitalize',
                  }}>
                    {trackingData.status}
                  </Text>
                </View>
              </View>
              <View style={{ backgroundColor: '#f9fafb', borderRadius: 8, padding: 12 }}>
                <Text style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Estimated Delivery</Text>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#111' }}>
                  {new Date(trackingData.estimatedDelivery).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            {/* Timeline */}
            <View>
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#111', marginBottom: 16 }}>
                Order Timeline
              </Text>
              {trackingData.timeline?.map((event, index) => (
                <View key={index} style={{ flexDirection: 'row', marginBottom: 24 }}>
                  <View style={{ marginRight: 16, alignItems: 'center' }}>
                    <View style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: index === trackingData.timeline.length - 1 ? '#000' : '#d1d5db',
                    }} />
                    {index < trackingData.timeline.length - 1 && (
                      <View style={{
                        width: 2,
                        height: 40,
                        backgroundColor: '#d1d5db',
                        marginTop: 4,
                      }} />
                    )}
                  </View>
                  <View style={{ flex: 1, paddingBottom: index < trackingData.timeline.length - 1 ? 0 : 0 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontWeight: '600', color: '#111', fontSize: 16 }}>
                        {event.status}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <Text style={{ fontSize: 12, color: '#666' }}>{event.date}</Text>
                        <Text style={{ fontSize: 12, color: '#666' }}>{event.time}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 14, color: '#666' }}>{event.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Help Section */}
        {!trackingData && (
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 16,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: '#111', marginBottom: 8 }}>
              Can't Find Your Order?
            </Text>
            <Text style={{ color: '#666', marginBottom: 16, textAlign: 'center' }}>
              If you're having trouble tracking your order, please contact our customer service team.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('ContactUs')}
              style={{
                backgroundColor: '#000',
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        )}
        </View>
      </ScrollView>
      <BottomNavBar />
    </View>
  );
};

export default TrackOrderScreen;

