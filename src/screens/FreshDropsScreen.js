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
import ProductCard from '../components/ProductCard';
import BottomNavBar from '../components/BottomNavBar';

const ITEMS_PER_PAGE = 20;

const FreshDropsScreen = () => {
  const navigation = useNavigation();
  
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
      
      // Filter out sarees
      const filteredProducts = allProductsList.filter(product => {
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
      <View className="py-5 items-center">
        <ActivityIndicator size="small" color="#000" />
        <Text className="mt-2 text-xs text-gray-500">Loading more...</Text>
      </View>
    );
  };

  // List Empty State
  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View className="py-15 items-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-base text-gray-500">Loading products...</Text>
        </View>
      );
    }

    return (
      <View className="py-15 items-center">
        <Ionicons name="sparkles-outline" size={64} color="#d1d5db" />
        <Text className="text-base text-gray-500 mb-2 mt-4">No fresh drops available</Text>
        <Text className="text-sm text-gray-400">Check back soon for new arrivals!</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <SafeAreaView className="bg-white" edges={['top']}>
        {/* Header */}
        <View className="flex-row items-center justify-between py-3 bg-white border-b border-gray-200" style={{ paddingHorizontal: 16 }}>
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 justify-center items-center">
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="flex-1 text-lg font-bold text-gray-900 mx-3" numberOfLines={1}>Fresh Drops</Text>
          <View className="w-10" />
        </View>

        {/* Product Count */}
        {!isLoading && allProducts.length > 0 && (
          <View className="py-2 bg-white" style={{ paddingHorizontal: 16 }}>
            <Text className="text-sm text-gray-500">
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

