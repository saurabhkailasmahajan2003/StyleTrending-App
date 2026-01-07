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

const ProductCard = ({ product }) => {
  const navigation = useNavigation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [isAdding, setIsAdding] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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
    <View className="w-[48%] mb-4">
      <TouchableOpacity 
        onPress={handleProductPress} 
        activeOpacity={0.9}
        className="bg-white rounded-xl overflow-hidden"
        style={{ 
          elevation: 3, 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 2 }, 
          shadowOpacity: 0.12, 
          shadowRadius: 4 
        }}
      >
        {/* Image Container */}
        <View className="relative w-full bg-gray-50" style={{ aspectRatio: 0.75 }}>
          {/* SALE Badge - Top Left */}
          {hasDiscount && (
            <View className="absolute top-2 left-2 z-20 bg-red-500 px-2.5 py-1 rounded-md">
              <Text className="text-white text-[9px] font-bold tracking-wide uppercase">
                SALE
              </Text>
            </View>
          )}

          {/* Loading Indicator */}
          {!imageLoaded && (
            <View className="absolute inset-0 justify-center items-center bg-gray-50">
              <ActivityIndicator size="small" color="#9ca3af" />
            </View>
          )}

          {/* Product Image */}
          <Image
            source={{ uri: defaultImageSrc }}
            className={`w-full h-full ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoaded(true)}
            resizeMode="cover"
          />
        </View>

        {/* Product Info Section */}
        <View className="px-3 py-3 bg-white">
          {/* Product Name */}
          <Text 
            className="text-sm font-semibold text-gray-900 mb-1" 
            numberOfLines={2}
            style={{ lineHeight: 18, minHeight: 36 }}
          >
            {product.name || 'Product Name'}
          </Text>
          
          {/* Category/Brand */}
          {product.category && (
            <Text className="text-xs text-gray-400 mb-2" numberOfLines={1}>
              {product.category}
            </Text>
          )}

          {/* Price and Add Button Row */}
          <View className="flex-row items-center justify-between mt-1">
            <View className="flex-1">
              <View className="flex-row items-baseline gap-1.5">
                <Text className="text-base font-bold text-gray-900">
                  ₹{(finalPrice || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </Text>
                {hasDiscount && originalPrice > 0 && (
                  <Text className="text-xs text-gray-400 line-through">
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
                  className="w-8 h-8 bg-gray-900 rounded-full items-center justify-center"
                  disabled={isAdding}
                  activeOpacity={0.8}
                  style={{ elevation: 2 }}
                >
                  {isAdding ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="add" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ) : (
                <View className="bg-white border border-gray-200 rounded-lg p-2 shadow-lg min-w-[130px]" style={{ elevation: 6 }}>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-[10px] text-gray-700 font-bold tracking-wider uppercase">Size</Text>
                    <TouchableOpacity onPress={() => setShowSizes(false)} className="p-0.5">
                      <Ionicons name="close" size={12} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row flex-wrap gap-1">
                    {sizes.slice(0, 4).map((size) => (
                      <TouchableOpacity
                        key={size}
                        onPress={() => handleAddToCart(size)}
                        disabled={isAdding}
                        className={`flex-1 min-w-[20%] h-7 border rounded justify-center items-center ${
                          isAdding 
                            ? 'bg-gray-50 border-gray-200' 
                            : 'bg-white border-gray-300'
                        }`}
                        activeOpacity={0.7}
                      >
                        <Text className={`text-[10px] font-bold ${
                          isAdding ? 'text-gray-300' : 'text-gray-900'
                        }`}>
                          {size}
                        </Text>
                      </TouchableOpacity>
                    ))}
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
