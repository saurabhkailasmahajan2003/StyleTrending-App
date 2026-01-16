/**
 * ProductCard Component - Professional Design
 * Clean, modern product card matching the design specification
 */
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ProductCard = ({ product }) => {
  const navigation = useNavigation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { colors, isDark } = useTheme();
  
  const [isAdding, setIsAdding] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Safety check - return null if product is invalid
  if (!product || typeof product !== 'object') {
    return null;
  }

  // Data Normalization - Same as web
  let productImages = [];
  if (product.images) {
    if (Array.isArray(product.images)) {
      productImages = product.images.filter(img => img && img.trim() !== '');
    } else if (typeof product.images === 'object') {
      productImages = Object.values(product.images).filter(img => img && typeof img === 'string' && img.trim() !== '');
    }
  }
  
  if (productImages.length === 0) {
    const fallbackImage = product.image || product.thumbnail || product.images?.image1;
    if (fallbackImage) {
      productImages = [fallbackImage];
    }
  }
  
  const isWatch = (product.category || '').toLowerCase().includes('watch');
  const isLens = (product.category || '').toLowerCase().includes('lens');
  const sizes = isWatch ? [] : (product.sizes || ['S', 'M', 'L', 'XL']); 
  const finalPrice = product.finalPrice || product.price || product.mrp || 0;
  const originalPrice = product.originalPrice || product.mrp || product.price || 0;
  const hasDiscount = originalPrice > finalPrice && finalPrice > 0;
  const productId = product._id || product.id;
  
  let defaultImageIndex = 0;
  if (isLens && productImages.length > 1) {
    defaultImageIndex = 1;
  }
  
  let defaultImageSrc = 'https://via.placeholder.com/400x500?text=No+Image';
  if (productImages.length > 0) {
    defaultImageSrc = productImages[defaultImageIndex];
  }

  const handleAddClick = (e) => {
    if (e) e.stopPropagation();
    if (sizes.length > 0) {
      setShowSizes(true);
    } else {
      handleAddToCart(null);
    }
  };

  const handleAddToCart = async (selectedSize) => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    
    setIsAdding(true);
    try {
      await addToCart({ ...product, selectedSize });
      setTimeout(() => {
        setIsAdding(false);
        setShowSizes(false);
      }, 1000);
    } catch (err) {
      setIsAdding(false);
      if (err.message.includes('login')) {
        navigation.navigate('Login');
      }
    }
  };

  const handleProductPress = () => {
    navigation.navigate('ProductDetail', { productId });
  };

  // Format price with 2 decimals
  const formatPrice = (price) => {
    if (!price || price === 0) return 'Price N/A';
    return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <View style={{ width: '48%', marginBottom: 16 }}>
      <TouchableOpacity 
        onPress={handleProductPress} 
        activeOpacity={0.9}
        style={{ 
          backgroundColor: colors.card,
          borderRadius: 12,
          overflow: 'hidden',
          elevation: 3, 
          shadowColor: colors.shadow, 
          shadowOffset: { width: 0, height: 2 }, 
          shadowOpacity: isDark ? 0.3 : 0.12, 
          shadowRadius: 4 
        }}
      >
        {/* Image Container */}
        <View style={{ position: 'relative', width: '100%', backgroundColor: colors.backgroundTertiary, aspectRatio: 0.75 }}>
          {/* SALE Badge - Top Left */}
          {hasDiscount && (
            <View style={{ position: 'absolute', top: 8, left: 8, zIndex: 20, backgroundColor: colors.error, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>
                SALE
              </Text>
            </View>
          )}

          {/* Loading Indicator */}
          {!imageLoaded && (
            <View style={{ position: 'absolute', inset: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundTertiary }}>
              <ActivityIndicator size="small" color={colors.textSecondary} />
            </View>
          )}

          {/* Product Image */}
          <Image
            source={{ uri: defaultImageSrc }}
            style={{ width: '100%', height: '100%', opacity: imageLoaded ? 1 : 0 }}
            onLoad={() => setImageLoaded(true)}
            resizeMode="cover"
          />
        </View>

        {/* Product Info Section */}
        <View style={{ paddingHorizontal: 12, paddingVertical: 12, backgroundColor: colors.card }}>
          {/* Product Name */}
          <Text 
            style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4, lineHeight: 18, minHeight: 36 }}
            numberOfLines={2}
          >
            {product.name || 'Product Name'}
          </Text>
          
          {/* Category/Brand */}
          {product.category && (
            <Text style={{ fontSize: 12, color: colors.textTertiary, marginBottom: 8 }} numberOfLines={1}>
              {product.category}
            </Text>
          )}

          {/* Price and Add Button Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text, marginRight: 6 }}>
                  ₹{(finalPrice || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
                {hasDiscount && originalPrice > 0 && (
                  <Text style={{ fontSize: 12, color: colors.textTertiary, textDecorationLine: 'line-through' }}>
                    ₹{(originalPrice || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </Text>
                )}
              </View>
            </View>

            {/* Add to Cart Button */}
            <View>
              {!showSizes ? (
                <TouchableOpacity
                  onPress={handleAddClick}
                  style={{ width: 32, height: 32, backgroundColor: colors.primary, borderRadius: 9999, alignItems: 'center', justifyContent: 'center', elevation: 2 }}
                  disabled={isAdding}
                  activeOpacity={0.8}
                >
                  {isAdding ? (
                    <ActivityIndicator size="small" color={isDark ? '#000000' : '#FFFFFF'} />
                  ) : (
                    <Ionicons name="add" size={20} color={isDark ? '#000000' : '#FFFFFF'} />
                  )}
                </TouchableOpacity>
              ) : (
                <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 8, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 6, minWidth: 130 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 10, color: colors.text, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>Size</Text>
                    <TouchableOpacity onPress={() => setShowSizes(false)} style={{ padding: 2 }} activeOpacity={0.7}>
                      <Ionicons name="close" size={12} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -2 }}>
                    {sizes.slice(0, 4).map((size) => {
                      const sizeStr = String(size || '');
                      return (
                        <TouchableOpacity
                          key={sizeStr}
                          onPress={() => handleAddToCart(size)}
                          disabled={isAdding}
                          style={{
                            flex: 1,
                            minWidth: '20%',
                            height: 28,
                            borderWidth: 1,
                            borderRadius: 4,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: isAdding ? colors.backgroundTertiary : colors.card,
                            borderColor: isAdding ? colors.border : colors.border,
                            marginHorizontal: 2,
                            marginBottom: 4,
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: isAdding ? colors.textTertiary : colors.text,
                          }}>
                            {sizeStr}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ProductCard;
