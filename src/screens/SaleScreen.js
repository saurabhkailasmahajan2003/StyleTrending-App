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

const ITEMS_PER_PAGE = 20;

const SaleScreen = () => {
  const navigation = useNavigation();
  
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
      const response = await productAPI.getAllProducts({ 
        limit: 1000, 
        onSale: true, 
        sort: 'discountPercent', 
        order: 'desc' 
      });
      
      if (response && response.success) {
        setAllProducts(response.data.products || []);
      } else {
        setAllProducts([]);
      }
    } catch (error) {
      console.error('Error fetching sale products:', error);
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
        <Ionicons name="pricetag-outline" size={64} color="#d1d5db" />
        <Text className="text-base text-gray-500 mb-2 mt-4">No sale products found</Text>
        <Text className="text-sm text-gray-400">Check back later for amazing deals!</Text>
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
          <Text className="flex-1 text-lg font-bold text-gray-900 mx-3" numberOfLines={1}>On Sale</Text>
          <View className="w-10" />
        </View>

        {/* Product Count */}
        {!isLoading && allProducts.length > 0 && (
          <View className="py-2 bg-white" style={{ paddingHorizontal: 16 }}>
            <Text className="text-sm text-gray-500">
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

