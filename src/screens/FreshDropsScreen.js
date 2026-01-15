/**
 * Fresh Drops Screen - Shows fresh/new products
 * Similar to CategoryScreen but specifically for fresh drops
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
import { useTheme } from '../context/ThemeContext';
import ProductCard from '../components/ProductCard';
import BottomNavBar from '../components/BottomNavBar';

const ITEMS_PER_PAGE = 20;

const FreshDropsScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch fresh drops products (same logic as HomeScreen)
  const fetchFreshDrops = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch diverse products from different categories
      const [
        menShirts,
        menTshirts,
        womenTshirts,
        menTrousers,
        womenJeans,
        accessories,
        watches,
        lenses
      ] = await Promise.all([
        productAPI.getMenItems({ limit: 50, category: 'shirt' }),
        productAPI.getMenItems({ limit: 50, category: 'tshirt' }),
        productAPI.getWomenItems({ limit: 50, category: 'tshirt' }),
        productAPI.getMenItems({ limit: 50, category: 'trousers' }),
        productAPI.getWomenItems({ limit: 50, category: 'jeans' }),
        productAPI.getAccessories({ limit: 50 }),
        productAPI.getWatches({ limit: 50 }),
        productAPI.getLenses({ limit: 50 })
      ]);
      
      let allProductsList = [];
      
      // Add products from different categories for variety
      if (menShirts?.success && menShirts.data?.products) {
        allProductsList = [...allProductsList, ...menShirts.data.products];
      }
      
      if (menTshirts?.success && menTshirts.data?.products) {
        allProductsList = [...allProductsList, ...menTshirts.data.products];
      }
      
      if (womenTshirts?.success && womenTshirts.data?.products) {
        allProductsList = [...allProductsList, ...womenTshirts.data.products];
      }
      
      if (menTrousers?.success && menTrousers.data?.products) {
        allProductsList = [...allProductsList, ...menTrousers.data.products];
      }
      
      if (womenJeans?.success && womenJeans.data?.products) {
        allProductsList = [...allProductsList, ...womenJeans.data.products];
      }
      
      if (accessories?.success && accessories.data?.products) {
        allProductsList = [...allProductsList, ...accessories.data.products];
      }
      
      if (watches?.success && watches.data?.products) {
        allProductsList = [...allProductsList, ...watches.data.products];
      }
      
      if (lenses?.success && lenses.data?.products) {
        allProductsList = [...allProductsList, ...lenses.data.products];
      }
      
      // Remove duplicate products based on product ID
      const uniqueProductsMap = new Map();
      allProductsList.forEach(product => {
        if (product) {
          const productId = product._id || product.id;
          if (productId && !uniqueProductsMap.has(productId)) {
            uniqueProductsMap.set(productId, product);
          }
        }
      });
      const uniqueProducts = Array.from(uniqueProductsMap.values());
      
      // Filter out sarees
      const filteredProducts = uniqueProducts.filter(product => {
        if (!product) return false;
        
        const subCategory = (product.subCategory || '').toLowerCase().trim();
        const category = (product.category || '').toLowerCase().trim();
        const name = (product.name || '').toLowerCase().trim();
        
        // Exclude sarees
        const isSaree = subCategory === 'saree' || subCategory === 'sari' || 
                       category === 'saree' || category === 'sari' ||
                       /\bsaree\b/.test(name) || /\bsari\b/.test(name);
        
        return !isSaree;
      });
      
      // Shuffle products to show different order
      const shuffled = filteredProducts.sort(() => Math.random() - 0.5);
      
      setAllProducts(shuffled);
    } catch (error) {
      console.error('Error fetching fresh drops:', error);
      setAllProducts([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFreshDrops();
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
    fetchFreshDrops();
  }, [fetchFreshDrops]);

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
        <Ionicons name="sparkles-outline" size={64} color={colors.textTertiary} />
        <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 8, marginTop: 16 }}>No fresh drops available</Text>
        <Text style={{ fontSize: 14, color: colors.textTertiary }}>Check back soon for new arrivals!</Text>
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
          <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: colors.text, marginHorizontal: 12 }} numberOfLines={1}>Fresh Drops</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Product Count */}
        {!isLoading && allProducts.length > 0 && (
          <View style={{ paddingVertical: 8, backgroundColor: colors.background, paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              {allProducts.length} {allProducts.length === 1 ? 'product' : 'products'} available
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

export default FreshDropsScreen;

