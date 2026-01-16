import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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
  const scrollViewRef = useRef(null);

  const cartTotal = getCartTotal();
  const freeShippingThreshold = 1000;
  const progress = Math.min(Math.max((cartTotal / freeShippingThreshold) * 100, 0), 100);
  const remainingForFreeShip = freeShippingThreshold - cartTotal;

  useFocusEffect(
    useCallback(() => {
      if (route.params?.scrollToTop && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
        navigation.setParams({ scrollToTop: undefined });
      }
    }, [route.params?.scrollToTop, navigation])
  );

  const getProductImage = (product) => {
    if (!product) return 'https://via.placeholder.com/150';
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0]?.url || product.images[0] || '';
    }
    if (typeof product.images === 'object' && product.images !== null) {
      return product.images.image1 || product.images.url || Object.values(product.images)[0] || '';
    }
    return product.image || product.thumbnail || 'https://via.placeholder.com/150';
  };

  const handleRemoveItem = (itemId) => {
    Alert.alert('Remove Item', 'Remove this item from cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(itemId) },
    ]);
  };


  if (!isLoading && cart.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <SafeAreaView style={{ backgroundColor: colors.background }} edges={['top']}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Bag</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 24, fontWeight: '600', color: colors.text }}>Your bag is empty</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            style={[styles.primaryButton, { backgroundColor: colors.primary, marginTop: 20 }]}
          >
            <Text style={{ color: isDark ? '#000' : '#FFF', fontWeight: '600' }}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
        <BottomNavBar />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <SafeAreaView style={{ backgroundColor: colors.background }} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Shopping Bag</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent}>
            
            {/* Shipping Progress */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
               <Text style={{ color: colors.text, marginBottom: 8 }}>
                 {remainingForFreeShip > 0 ? `Add ₹${remainingForFreeShip} for free shipping` : 'Free Shipping Unlocked!'}
               </Text>
               <View style={{ height: 6, backgroundColor: colors.backgroundTertiary, borderRadius: 3 }}>
                 <View style={{ width: `${progress}%`, height: '100%', backgroundColor: colors.primary, borderRadius: 3 }} />
               </View>
            </View>

            {/* Cart Items */}
            {cart.map((item, index) => {
              const product = item.product || item;
              // Fallback to index if IDs are missing to prevent crash
              const itemId = item._id || item.id || `temp-${index}`; 
              const image = getProductImage(product);
              const price = product.finalPrice || product.price || 0;

              return (
                <View key={itemId} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={{ uri: image }} style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#eee' }} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>{product.name || 'Unknown Item'}</Text>
                      <Text style={{ fontSize: 14, color: colors.text, marginTop: 4 }}>₹{price.toLocaleString()}</Text>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                        <TouchableOpacity onPress={() => updateQuantity(itemId, item.quantity - 1)} style={styles.qtyBtn}>
                          <Ionicons name="remove" size={16} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={{ marginHorizontal: 12, color: colors.text }}>{item.quantity}</Text>
                        <TouchableOpacity onPress={() => updateQuantity(itemId, item.quantity + 1)} style={styles.qtyBtn}>
                          <Ionicons name="add" size={16} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleRemoveItem(itemId)} style={{ marginLeft: 'auto' }}>
                          <Ionicons name="trash-outline" size={20} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Summary */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>Summary</Text>
              <View style={styles.row}>
                <Text style={{ color: colors.textSecondary }}>Subtotal</Text>
                <Text style={{ color: colors.text }}>₹{cartTotal.toLocaleString()}</Text>
              </View>
              <View style={[styles.row, { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }]}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text }}>Total</Text>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.primary }}>₹{cartTotal.toLocaleString()}</Text>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              onPress={() => {
                if (cart.length === 0) {
                  Alert.alert('Empty Cart', 'Please add items before checkout.');
                  return;
                }
                try {
                  console.log('🛒 Navigating to Checkout screen...');
                  navigation.navigate('Checkout');
                  console.log('✅ Navigation to Checkout initiated');
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  Alert.alert('Error', 'Failed to navigate to checkout. Please try again.');
                }
              }}
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: isDark ? '#000' : '#FFF', fontSize: 16, fontWeight: '700', marginRight: 8 }}>Proceed to Checkout</Text>
                <Ionicons name="arrow-forward" size={20} color={isDark ? '#000' : '#FFF'} />
              </View>
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      )}
      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  backBtn: { padding: 4 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  qtyBtn: { padding: 4, borderWidth: 1, borderColor: '#ccc', borderRadius: 4 },
  primaryButton: { padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
});

export default CartScreen;