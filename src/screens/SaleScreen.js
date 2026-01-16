/**
 * Sale Screen - Shows all products on sale
 * Similar to CategoryScreen but specifically for sale items
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import BottomNavBar from '../components/BottomNavBar';
import { useTheme } from '../context/ThemeContext';

const ITEMS_PER_PAGE = 20;

const SaleScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch all sale products
  const fetchSaleProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('🛍️ Fetching sale products...');
      
      // Fetch all products from all categories
      const response = await productAPI.getAllProducts({ limit: 1000 });
      
      if (response && response.success) {
        const allProductsData = response.data.products || [];
        
        // Filter products that are on sale (client-side filtering)
        const saleProducts = allProductsData.filter(product => {
          const finalPrice = product.finalPrice || product.price || 0;
          const originalPrice = product.originalPrice || product.mrp || product.price || 0;
          const hasDiscount = originalPrice > finalPrice;
          const discountPercent = product.discountPercent || (hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0);
          
          // Product is on sale if:
          // 1. onSale flag is true
          // 2. Has discount (originalPrice > finalPrice)
          // 3. discountPercent > 0
          return product.onSale === true || hasDiscount || discountPercent > 0;
        });
        
        // Sort by discount percentage (highest first)
        saleProducts.sort((a, b) => {
          const discountA = a.discountPercent || (a.originalPrice && a.finalPrice ? Math.round(((a.originalPrice - a.finalPrice) / a.originalPrice) * 100) : 0);
          const discountB = b.discountPercent || (b.originalPrice && b.finalPrice ? Math.round(((b.originalPrice - b.finalPrice) / b.originalPrice) * 100) : 0);
          return discountB - discountA;
        });
        
        console.log(`✅ Found ${saleProducts.length} sale products out of ${allProductsData.length} total products`);
        setAllProducts(saleProducts);
      } else {
        console.warn('⚠️ Failed to fetch products:', response?.message);
        setAllProducts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching sale products:', error);
      setAllProducts([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSaleProducts();
    setDisplayedProducts([]);
    setHasMore(true);
  }, []);

  // Initialize displayed products
  useEffect(() => {
    setDisplayedProducts(allProducts.slice(0, ITEMS_PER_PAGE));
    setHasMore(allProducts.length > ITEMS_PER_PAGE);
  }, [allProducts]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayedProducts.length;
      const nextBatch = allProducts.slice(currentLength, currentLength + ITEMS_PER_PAGE);
      
      if (nextBatch.length > 0) {
        setDisplayedProducts(prev => [...prev, ...nextBatch]);
        setHasMore(currentLength + nextBatch.length < allProducts.length);
      } else {
        setHasMore(false);
      }
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMore, displayedProducts.length, allProducts]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSaleProducts();
  }, [fetchSaleProducts]);

  // Normalize product
  const normalizeProduct = useCallback((product) => {
    return {
      ...product,
      id: product._id || product.id,
      images: product.images || [product.image || product.thumbnail],
      image: product.images?.[0] || product.image || product.thumbnail,
      price: product.finalPrice || product.price,
      originalPrice: product.originalPrice || product.mrp || product.price,
      rating: product.rating || 0,
      reviews: product.reviewsCount || product.reviews || 0,
      category: product.category,
    };
  }, []);

  // Render Product Item
  const renderProduct = useCallback(({ item }) => {
    const normalizedProduct = normalizeProduct(item);
    return <ProductCard product={normalizedProduct} />;
  }, [normalizeProduct]);

  // Key extractor
  const keyExtractor = useCallback((item) => {
    return item._id || item.id || Math.random().toString();
  }, []);

  // List Footer
  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={{ marginTop: 8, fontSize: 12, color: colors.textSecondary }}>Loading more...</Text>
      </View>
    );
  };

  // List Empty State
  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={{ paddingVertical: 60, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ fontSize: 16, color: colors.textSecondary, marginTop: 16 }}>Loading products...</Text>
        </View>
      );
    }

    return (
      <View style={{ paddingVertical: 60, alignItems: 'center' }}>
        <Ionicons name="pricetag-outline" size={64} color={colors.textTertiary} />
        <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 8, marginTop: 16 }}>No sale products found</Text>
        <Text style={{ fontSize: 14, color: colors.textTertiary }}>Check back later for amazing deals!</Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}>
      <SafeAreaView style={{ backgroundColor: colors.background }} edges={['top']}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: colors.text, marginHorizontal: 12 }} numberOfLines={1}>On Sale</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Product Count */}
        {!isLoading && allProducts.length > 0 && (
          <View style={{ paddingVertical: 8, backgroundColor: colors.background, paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              {allProducts.length} {allProducts.length === 1 ? 'product' : 'products'} on sale
            </Text>
          </View>
        )}
      </SafeAreaView>

      {/* Products FlatList */}
      <FlatList
        data={displayedProducts}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 100 }}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 4 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        getItemLayout={(data, index) => {
          const itemHeight = 320;
          const rowIndex = Math.floor(index / 2);
          return {
            length: itemHeight,
            offset: itemHeight * rowIndex,
            index,
          };
        }}
      />
      <BottomNavBar />
    </View>
  );
};

export default SaleScreen;

