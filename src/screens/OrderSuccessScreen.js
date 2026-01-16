import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/BottomNavBar';

const OrderSuccessScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  
  const { orderId, method, orderTotal } = route.params || {};

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Success Icon */}
          <View style={{ alignItems: 'center', paddingTop: 60, paddingBottom: 40 }}>
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.success + '20',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success} />
            </View>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 12 }}>
              Order Placed Successfully!
            </Text>
            <Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 }}>
              Thank you for your order. We'll send you a confirmation email shortly.
            </Text>
          </View>

          {/* Order Details Card */}
          <View style={{
            backgroundColor: colors.card,
            marginHorizontal: 16,
            borderRadius: 16,
            padding: 24,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <Ionicons name="receipt-outline" size={24} color={colors.primary} />
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginLeft: 12 }}>
                Order Details
              </Text>
            </View>

            {orderId && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>
                  Order ID
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                  #{orderId.slice(-8).toUpperCase()}
                </Text>
              </View>
            )}

            {method && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, textTransform: 'uppercase' }}>
                  Payment Method
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="cash-outline" size={18} color={colors.primary} />
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginLeft: 8 }}>
                    Cash on Delivery
                  </Text>
                </View>
              </View>
            )}

            {orderTotal && (
              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Total Amount</Text>
                  <Text style={{ fontSize: 24, fontWeight: '800', color: colors.primary }}>
                    ₹{orderTotal.toLocaleString()}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Info Card */}
          <View style={{
            backgroundColor: colors.card,
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
              <Ionicons name="information-circle-outline" size={20} color={colors.primary} style={{ marginTop: 2 }} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 8 }}>
                  What's Next?
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
                  Your order will be processed and shipped soon. You'll receive updates via email and SMS.
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ marginHorizontal: 16, marginTop: 32 }}>
            <TouchableOpacity
              onPress={() => navigation.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              })}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                marginBottom: 12,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                Continue Shopping
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              style={{
                backgroundColor: colors.backgroundTertiary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: colors.border,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>
                View Orders
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      <BottomNavBar />
    </View>
  );
};

export default OrderSuccessScreen;
