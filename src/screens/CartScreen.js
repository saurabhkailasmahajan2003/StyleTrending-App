/**
 * Cart Screen - React Native version with NativeWind
 * Converted from web Cart.jsx
 * Features: Context for cart, Same cart logic, Same backend API, Mobile-friendly layout
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/BottomNavBar';

const CartScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cart, removeFromCart, updateQuantity, getCartTotal, isLoading } = useCart();
  const { colors, isDark } = useTheme();
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const scrollViewRef = React.useRef(null);

  // Free Shipping Threshold logic (same as web)
  const cartTotal = getCartTotal();
  const freeShippingThreshold = 1000;
  const progress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShip = freeShippingThreshold - cartTotal;

  // Handle scroll to top when tab is pressed
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.scrollToTop && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
        // Clear the param to prevent scrolling on every focus
        navigation.setParams({ scrollToTop: undefined });
      }
    }, [route.params?.scrollToTop, navigation])
  );

  // Empty State
  if (!isLoading && cart.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
        <SafeAreaView style={{ backgroundColor: colors.background }} edges={['top']}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center' }}>Shopping Bag</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: 80, height: 80, backgroundColor: colors.card, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
            <Text style={{ fontSize: 40 }}>🛒</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Your shopping bag is empty</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 32, maxWidth: 300 }}>
            Add items to your bag to continue shopping.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
            activeOpacity={0.8}
          >
            <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleRemoveItem = (itemId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(itemId),
        },
      ]
    );
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }
    navigation.navigate('Checkout');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <SafeAreaView style={{ backgroundColor: colors.background }} edges={['top']}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center' }}>Shopping Bag</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundSecondary }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, fontSize: 14, color: colors.textSecondary }}>Loading cart...</Text>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Cart Info */}
          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Shopping Bag</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {/* Free Shipping Progress Bar */}
          <View style={{ 
            backgroundColor: colors.card, 
            padding: 20, 
            borderRadius: 16, 
            borderWidth: 1, 
            borderColor: colors.border, 
            marginBottom: 20,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                borderRadius: 20, 
                backgroundColor: remainingForFreeShip <= 0 ? colors.success + '20' : colors.primary + '20',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}>
                <Ionicons 
                  name={remainingForFreeShip <= 0 ? "checkmark-circle" : "truck-outline"} 
                  size={24} 
                  color={remainingForFreeShip <= 0 ? colors.success : colors.primary} 
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 }}>
                  {remainingForFreeShip > 0
                    ? `Add ₹${remainingForFreeShip.toLocaleString()} more for free shipping`
                    : 'Free shipping unlocked! 🎉'}
                </Text>
                {remainingForFreeShip > 0 && (
                  <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                    {Math.round(progress)}% complete
                  </Text>
                )}
              </View>
            </View>
            <View style={{ width: '100%', height: 10, backgroundColor: colors.backgroundTertiary, borderRadius: 5, overflow: 'hidden' }}>
              <View
                style={{
                  height: '100%',
                  borderRadius: 5,
                  width: `${progress}%`,
                  backgroundColor: remainingForFreeShip > 0 ? colors.primary : colors.success,
                }}
              />
            </View>
          </View>

          {/* Cart Items */}
          {cart.map((item, index) => {
            const product = item.product || item;
            const itemId = item._id || item.id;

            // Normalize image - handle both images array and single image
            let productImage = '';
            if (product.images && Array.isArray(product.images) && product.images.length > 0) {
              productImage = product.images[0]?.url || product.images[0] || '';
            } else if (typeof product.images === 'object' && product.images !== null) {
              productImage = product.images.image1 || product.images.url || Object.values(product.images)[0] || '';
            } else if (product.image) {
              productImage = product.image;
            } else if (product.thumbnail) {
              productImage = product.thumbnail;
            }

            // Normalize price
            const productPrice = product.finalPrice || product.price || product.mrp || 0;
            const originalPrice = product.originalPrice || product.mrp || 0;
            const hasDiscount = originalPrice > productPrice && productPrice > 0;
            const itemTotal = productPrice * item.quantity;

            return (
              <View 
                key={itemId} 
                style={{ 
                  backgroundColor: colors.card, 
                  borderRadius: 12, 
                  borderWidth: 1, 
                  borderColor: colors.border, 
                  marginBottom: 12, 
                  padding: 16,
                  shadowColor: colors.shadow,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <View style={{ flexDirection: 'row' }}>
                  {/* Product Image */}
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('ProductDetail', {
                        productId: itemId,
                        category: product.category || 'shop',
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <View style={{ width: 100, height: 100, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.backgroundTertiary, borderWidth: 1, borderColor: colors.border }}>
                      <Image
                        source={{ uri: productImage }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Product Info */}
                  <View style={{ flex: 1, marginLeft: 12, justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate('ProductDetail', {
                            productId: itemId,
                            category: product.category || 'shop',
                          })
                        }
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 }} numberOfLines={2}>
                          {product.name || 'Product'}
                        </Text>
                      </TouchableOpacity>
                      {product.brand && (
                        <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 6 }}>{product.brand}</Text>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
                          ₹{productPrice.toLocaleString()}
                        </Text>
                        {hasDiscount && originalPrice > 0 && (
                          <Text style={{ fontSize: 13, color: colors.textTertiary, textDecorationLine: 'line-through' }}>
                            ₹{originalPrice.toLocaleString()}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Quantity Controls & Actions */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      {/* Quantity Controls */}
                      <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.backgroundTertiary }}>
                        <TouchableOpacity
                          onPress={() => handleQuantityChange(itemId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          style={{ 
                            width: 36, 
                            height: 36, 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            backgroundColor: item.quantity <= 1 ? 'transparent' : colors.background,
                            opacity: item.quantity <= 1 ? 0.4 : 1 
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="remove" size={18} color={colors.text} />
                        </TouchableOpacity>
                        <View style={{ width: 40, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                            {item.quantity}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleQuantityChange(itemId, item.quantity + 1)}
                          style={{ 
                            width: 36, 
                            height: 36, 
                            justifyContent: 'center', 
                            alignItems: 'center',
                            backgroundColor: colors.background,
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="add" size={18} color={colors.text} />
                        </TouchableOpacity>
                      </View>

                      {/* Remove Button */}
                      <TouchableOpacity
                        onPress={() => handleRemoveItem(itemId)}
                        style={{ 
                          paddingHorizontal: 12, 
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: colors.error + '15',
                          borderWidth: 1,
                          borderColor: colors.error + '30',
                        }}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Item Total */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>Item Total</Text>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>
                    ₹{itemTotal.toLocaleString()}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Order Summary */}
          <View style={{ 
            backgroundColor: colors.card, 
            borderRadius: 16, 
            borderWidth: 1, 
            borderColor: colors.border, 
            padding: 20, 
            marginBottom: 16,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: colors.border }}>
              <Ionicons name="receipt-outline" size={24} color={colors.primary} style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
                Order Summary
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Subtotal</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                ₹{cartTotal.toLocaleString()}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>Shipping</Text>
                {remainingForFreeShip <= 0 && (
                  <Text style={{ fontSize: 14, color: colors.success }}>✓</Text>
                )}
              </View>
              <Text style={{ fontSize: 14, fontWeight: '500', color: remainingForFreeShip <= 0 ? colors.success : colors.text }}>
                {remainingForFreeShip <= 0 ? 'Free' : 'Calculated at checkout'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: 12 }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>Tax Estimate</Text>
              <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>₹0.00</Text>
            </View>

            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: 16, 
              marginBottom: 8,
              paddingTop: 16,
              paddingHorizontal: 12,
              paddingVertical: 12,
              backgroundColor: colors.backgroundTertiary,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: colors.primary,
            }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Total</Text>
              <Text style={{ fontSize: 24, fontWeight: '700', color: colors.primary }}>
                ₹{cartTotal.toLocaleString()}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 16, textAlign: 'center' }}>Including GST</Text>

            {/* Promo Code Section */}
            <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.borderLight }}>
              <TouchableOpacity
                onPress={() => setShowPromoInput(!showPromoInput)}
                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
                  Do you have a promo code?
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>{showPromoInput ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showPromoInput && (
                <View style={{ flexDirection: 'row', marginTop: 12, gap: 8 }}>
                  <TextInput
                    value={promoCode}
                    onChangeText={setPromoCode}
                    placeholder="Enter code"
                    style={{ flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text, backgroundColor: colors.card }}
                    placeholderTextColor={colors.textTertiary}
                  />
                  <TouchableOpacity style={{ backgroundColor: colors.backgroundTertiary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 }} activeOpacity={0.7}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text, textTransform: 'uppercase' }}>Apply</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Checkout Button */}
          <TouchableOpacity
            onPress={handleCheckout}
            style={{ 
              backgroundColor: colors.primary, 
              paddingVertical: 18, 
              borderRadius: 12, 
              alignItems: 'center', 
              marginBottom: 12,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 17, fontWeight: '700' }}>Proceed to Checkout</Text>
              <Ionicons name="arrow-forward" size={20} color={isDark ? '#000000' : '#FFFFFF'} />
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, gap: 6 }}>
            <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
            <Text style={{ fontSize: 12, color: colors.textSecondary, textAlign: 'center' }}>
              Free shipping on orders over ₹1,000 • Secure checkout
            </Text>
          </View>

          {/* Payment Icons */}
          <View style={{ 
            alignItems: 'center', 
            paddingTop: 20, 
            paddingBottom: 8,
            borderTopWidth: 1, 
            borderTopColor: colors.border 
          }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              Accepted Payment Methods
            </Text>
            <View style={{ flexDirection: 'row', gap: 20, alignItems: 'center' }}>
              <View style={{ width: 50, height: 30, backgroundColor: colors.backgroundTertiary, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20 }}>💳</Text>
              </View>
              <View style={{ width: 50, height: 30, backgroundColor: colors.backgroundTertiary, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20 }}>💳</Text>
              </View>
              <View style={{ width: 50, height: 30, backgroundColor: colors.backgroundTertiary, borderRadius: 6, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 20 }}>💳</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      )}
      <BottomNavBar />
    </View>
  );
};

export default CartScreen;
