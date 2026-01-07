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
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import BottomNavBar from '../components/BottomNavBar';

const CartScreen = () => {
  const navigation = useNavigation();
  const { cart, removeFromCart, updateQuantity, getCartTotal, isLoading } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);

  // Free Shipping Threshold logic (same as web)
  const cartTotal = getCartTotal();
  const freeShippingThreshold = 1000;
  const progress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShip = freeShippingThreshold - cartTotal;

  // Empty State
  if (!isLoading && cart.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <SafeAreaView className="bg-white" edges={['top']}>
          {/* Header */}
          <View className="flex-row items-center justify-between py-3 bg-white border-b border-gray-200" style={{ paddingHorizontal: 16 }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 justify-center items-center"
            >
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text className="flex-1 text-base font-semibold text-gray-900 text-center">Shopping Bag</Text>
            <View className="w-10" />
          </View>
        </SafeAreaView>
        <View className="flex-1 justify-center items-center p-5">
          <View className="w-20 h-20 bg-white rounded-full justify-center items-center mb-6 shadow-sm">
            <Text className="text-4xl">🛒</Text>
          </View>
          <Text className="text-2xl font-semibold text-gray-900 mb-2">Your shopping bag is empty</Text>
          <Text className="text-sm text-gray-500 text-center mb-8 max-w-[300px]">
            Add items to your bag to continue shopping.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            className="bg-gray-900 px-6 py-3 rounded-lg"
          >
            <Text className="text-white text-sm font-semibold">Continue Shopping</Text>
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
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="bg-white" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between py-3 bg-white border-b border-gray-200" style={{ paddingHorizontal: 16 }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 justify-center items-center"
          >
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="flex-1 text-base font-semibold text-gray-900 text-center">Shopping Bag</Text>
          <View className="w-10" />
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View className="flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#000" />
          <Text className="mt-3 text-sm text-gray-500">Loading cart...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 bg-gray-50"
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Cart Info */}
          <View className="mb-4">
            <Text className="text-2xl font-semibold text-gray-900 mb-1">Shopping Bag</Text>
            <Text className="text-sm text-gray-500">
              {cart.length} {cart.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {/* Free Shipping Progress Bar */}
          <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-medium text-gray-700 flex-1">
                {remainingForFreeShip > 0
                  ? `Add ₹${remainingForFreeShip.toLocaleString()} more for free shipping`
                  : '✓ Free shipping unlocked'}
              </Text>
              {remainingForFreeShip > 0 && (
                <Text className="text-xs font-semibold text-gray-500">
                  {Math.round(progress)}%
                </Text>
              )}
            </View>
            <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: remainingForFreeShip > 0 ? '#374151' : '#10b981',
                }}
              />
            </View>
          </View>

          {/* Cart Items */}
          <View className="bg-white rounded-lg border border-gray-200 mb-4 shadow-sm">
            {cart.map((item) => {
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
              const itemTotal = productPrice * item.quantity;

              return (
                <View key={itemId} className="flex-row p-4 border-b border-gray-100">
                  {/* Product Image */}
                  <View className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 mr-3">
                    <Image
                      source={{ uri: productImage }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>

                  {/* Product Info */}
                  <View className="flex-1 justify-between">
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('ProductDetail', {
                          productId: itemId,
                          category: product.category || 'shop',
                        })
                      }
                    >
                      <Text className="text-sm font-medium text-gray-900 mb-1" numberOfLines={2}>
                        {product.name || 'Product'}
                      </Text>
                    </TouchableOpacity>
                    {product.brand && (
                      <Text className="text-xs text-gray-500 mb-1">{product.brand}</Text>
                    )}
                    <Text className="text-sm font-semibold text-gray-900 mb-2">
                      ₹{productPrice.toLocaleString()}
                    </Text>

                    {/* Quantity Controls */}
                    <View className="flex-row items-center border border-gray-300 rounded-md w-[100px] h-8">
                      <TouchableOpacity
                        onPress={() => handleQuantityChange(itemId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className={`w-8 h-8 justify-center items-center border-r border-gray-300 ${item.quantity <= 1 ? 'opacity-40' : ''}`}
                      >
                        <Text className={`text-lg text-gray-700 font-medium ${item.quantity <= 1 ? 'text-gray-400' : ''}`}>
                          −
                        </Text>
                      </TouchableOpacity>
                      <Text className="flex-1 text-center text-sm font-semibold text-gray-900">
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleQuantityChange(itemId, item.quantity + 1)}
                        className="w-8 h-8 justify-center items-center border-l border-gray-300"
                      >
                        <Text className="text-lg text-gray-700 font-medium">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Item Total & Remove */}
                  <View className="items-end justify-between ml-3">
                    <Text className="text-base font-semibold text-gray-900 mb-2">
                      ₹{itemTotal.toLocaleString()}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveItem(itemId)}
                      className="py-1"
                    >
                      <Text className="text-xs text-red-600 font-medium">Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Order Summary */}
          <View className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b border-gray-200">
              Order Summary
            </Text>

            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm text-gray-500">Subtotal</Text>
              <Text className="text-sm font-medium text-gray-900">
                ₹{cartTotal.toLocaleString()}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center gap-1">
                <Text className="text-sm text-gray-500">Shipping</Text>
                {remainingForFreeShip <= 0 && (
                  <Text className="text-sm text-green-600">✓</Text>
                )}
              </View>
              <Text className={`text-sm font-medium ${remainingForFreeShip <= 0 ? 'text-green-600' : 'text-gray-900'}`}>
                {remainingForFreeShip <= 0 ? 'Free' : 'Calculated at checkout'}
              </Text>
            </View>

            <View className="flex-row justify-between items-center pb-3 border-b border-gray-200 mb-3">
              <Text className="text-sm text-gray-500">Tax Estimate</Text>
              <Text className="text-sm font-medium text-gray-900">₹0.00</Text>
            </View>

            <View className="flex-row justify-between items-center mt-2 mb-1">
              <Text className="text-base font-semibold text-gray-900">Total</Text>
              <Text className="text-xl font-semibold text-gray-900">
                ₹{cartTotal.toLocaleString()}
              </Text>
            </View>
            <Text className="text-xs text-gray-500 mb-4">Including GST</Text>

            {/* Promo Code Section */}
            <View className="mt-4 pt-4 border-t border-gray-100">
              <TouchableOpacity
                onPress={() => setShowPromoInput(!showPromoInput)}
                className="flex-row justify-between items-center"
              >
                <Text className="text-sm font-medium text-gray-900">
                  Do you have a promo code?
                </Text>
                <Text className="text-xs text-gray-500">{showPromoInput ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {showPromoInput && (
                <View className="flex-row mt-3 gap-2">
                  <TextInput
                    value={promoCode}
                    onChangeText={setPromoCode}
                    placeholder="Enter code"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900"
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity className="bg-gray-100 px-4 py-2.5 rounded-lg">
                    <Text className="text-xs font-bold text-gray-900 uppercase">Apply</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Checkout Button */}
          <TouchableOpacity
            onPress={handleCheckout}
            className="bg-gray-900 py-4 rounded-lg items-center mb-2"
          >
            <Text className="text-white text-base font-semibold">Proceed to Checkout</Text>
          </TouchableOpacity>
          <Text className="text-xs text-gray-500 text-center mb-4">
            Free shipping on orders over ₹1,000
          </Text>

          {/* Payment Icons */}
          <View className="items-center pt-4 border-t border-gray-200">
            <Text className="text-xs font-medium text-gray-500 mb-3">Secure Payment</Text>
            <View className="flex-row gap-4">
              <Text className="text-2xl">💳</Text>
              <Text className="text-2xl">💳</Text>
            </View>
          </View>
        </ScrollView>
      )}
      <BottomNavBar />
    </View>
  );
};

export default CartScreen;
