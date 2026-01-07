/**
 * Category Screen - React Native version with NativeWind
 * Converted from web CategoryPage.jsx
 * Features: FlatList, Infinite Scroll, Same API calls, Performance optimized
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import BottomNavBar from '../components/BottomNavBar';

const ITEMS_PER_PAGE = 20; // Items to load per infinite scroll batch

const CategoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Get params from navigation
  const { category, subcategory, title, gender } = route.params || {};
  
  // State for Data
  const [allProducts, setAllProducts] = useState([]); // Raw Data from API
  const [filteredList, setFilteredList] = useState([]); // Data after Filters apply
  const [displayedProducts, setDisplayedProducts] = useState([]); // Products currently displayed (for infinite scroll)
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pageTitle, setPageTitle] = useState(title || 'Products');
  const [hasMore, setHasMore] = useState(true);
  
  // State for Filters
  const [filters, setFilters] = useState({
    priceRange: null,
    brands: [],
    sizes: [],
    sortBy: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Determine category type from route
  const categoryType = category || 'all';
  const activeGender = gender || (categoryType === 'men' ? 'men' : categoryType === 'women' ? 'women' : null);
  const activeCategory = subcategory || null;

  // 1. Initial Data Fetch (Preserved from web)
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      let response = null;
      const fetchLimit = 1000; // Fetch all products, filter client-side

      // Determine which API to call based on category (same logic as web)
      if (categoryType === 'watches') {
        const params = { ...(activeGender ? { gender: activeGender } : {}), limit: fetchLimit };
        response = await productAPI.getWatches(params);
        setPageTitle(activeGender ? `${activeGender.charAt(0).toUpperCase() + activeGender.slice(1)}'s Watches` : 'Watches');
      } else if (categoryType === 'lenses') {
        const params = { ...(activeGender ? { gender: activeGender } : {}), limit: fetchLimit };
        response = await productAPI.getLenses(params);
        setPageTitle(activeGender ? `${activeGender.charAt(0).toUpperCase() + activeGender.slice(1)}'s Lenses` : 'Lenses & Spectacles');
      } else if (categoryType === 'accessories') {
        const params = { ...(activeGender ? { gender: activeGender } : {}), limit: fetchLimit };
        response = await productAPI.getAccessories(params);
        setPageTitle(activeGender ? `${activeGender.charAt(0).toUpperCase() + activeGender.slice(1)}'s Accessories` : 'Accessories');
      } else if (categoryType === 'men') {
        response = await productAPI.getMenItems({ limit: fetchLimit });
        setPageTitle("Men's Collection");
      } else if (categoryType === 'women') {
        response = await productAPI.getWomenItems({ limit: fetchLimit });
        setPageTitle("Women's Collection");
      } else if (activeGender && activeCategory) {
        const categoryMap = {
          'shirt': { subCategory: 'shirt', displayName: 'Shirt' },
          'tshirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
          't-shirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
          'jeans': { subCategory: 'jeans', displayName: 'Jeans' },
          'trousers': { subCategory: 'trousers', displayName: 'Trousers' },
          'shoes': { subCategory: 'shoes', displayName: 'Shoes' },
          'shoe': { subCategory: 'shoes', displayName: 'Shoes' },
          'saree': { subCategory: 'saree', displayName: 'Saree' },
          'sari': { subCategory: 'saree', displayName: 'Saree' },
          'accessories': { subCategory: 'accessories', displayName: 'Accessories' },
        };

        const categoryInfo = categoryMap[activeCategory.toLowerCase()];
        
        if (categoryInfo) {
          const fetcher = activeGender === 'women' ? productAPI.getWomenItems : productAPI.getMenItems;
          response = await fetcher({ subCategory: categoryInfo.subCategory, limit: fetchLimit });
          
          if (response && response.success && response.data.products) {
            const filteredProducts = response.data.products.filter(product => {
              const productSubCategory = (product.subCategory || '').toLowerCase().trim().replace(/-/g, '');
              const expectedSubCategory = categoryInfo.subCategory.toLowerCase().trim().replace(/-/g, '');
              return productSubCategory === expectedSubCategory;
            });
            response.data.products = filteredProducts;
          }
          
          const genderDisplay = activeGender.charAt(0).toUpperCase() + activeGender.slice(1);
          setPageTitle(`${genderDisplay}'s ${categoryInfo.displayName}`);
        } else {
          setPageTitle('Category Not Found');
          setAllProducts([]);
          setIsLoading(false);
          return;
        }
      } else {
        response = await productAPI.getAllProducts({ limit: fetchLimit });
        setPageTitle('All Products');
      }

      if (response && response.success) {
        setAllProducts(response.data.products || []);
      } else {
        setAllProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setAllProducts([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [categoryType, activeGender, activeCategory]);

  useEffect(() => {
    fetchProducts();
    // Reset filters when category changes
    setFilters({
      priceRange: null,
      brands: [],
      sizes: [],
      sortBy: null,
    });
    setDisplayedProducts([]);
    setHasMore(true);
  }, [categoryType, activeGender, activeCategory]);

  // 2. Filter Logic (Preserved from web)
  useEffect(() => {
    let filtered = [...allProducts];

    // Subcategory Filtering
    if (activeGender && activeCategory) {
      const categoryMap = {
        'shirt': { subCategory: 'shirt', displayName: 'Shirt' },
        'tshirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
        't-shirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
        'jeans': { subCategory: 'jeans', displayName: 'Jeans' },
        'trousers': { subCategory: 'trousers', displayName: 'Trousers' },
        'shoes': { subCategory: 'shoes', displayName: 'Shoes' },
        'shoe': { subCategory: 'shoes', displayName: 'Shoes' },
        'saree': { subCategory: 'saree', displayName: 'Saree' },
        'sari': { subCategory: 'saree', displayName: 'Saree' },
        'accessories': { subCategory: 'accessories', displayName: 'Accessories' },
      };
      const categoryInfo = categoryMap[activeCategory.toLowerCase()];
      
      if (categoryInfo) {
        filtered = filtered.filter(product => {
          const productSubCategory = (product.subCategory || '').toLowerCase().trim().replace(/-/g, '');
          const expectedSubCategory = categoryInfo.subCategory.toLowerCase().trim().replace(/-/g, '');
          return productSubCategory === expectedSubCategory;
        });
      }
    }

    // Price Filter
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = product.finalPrice || product.price;
        const { min, max } = filters.priceRange;
        return price >= min && (max === Infinity || price <= max);
      });
    }

    // Brand Filter
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands.includes(product.brand)
      );
    }

    // Size Filter
    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.sizes || !Array.isArray(product.sizes)) return false;
        return filters.sizes.some(size => product.sizes.includes(size));
      });
    }

    // Sort Logic (Preserved from web)
    if (filters.sortBy) {
      if (filters.sortBy === 'price-low-high') {
        filtered.sort((a, b) => {
          const priceA = a.finalPrice || a.price || 0;
          const priceB = b.finalPrice || b.price || 0;
          return priceA - priceB;
        });
      } else if (filters.sortBy === 'price-high-low') {
        filtered.sort((a, b) => {
          const priceA = a.finalPrice || a.price || 0;
          const priceB = b.finalPrice || b.price || 0;
          return priceB - priceA;
        });
      } else if (filters.sortBy === 'newest') {
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.dateAdded || 0);
          const dateB = new Date(b.createdAt || b.dateAdded || 0);
          return dateB - dateA;
        });
      }
    }

    setFilteredList(filtered);
    setDisplayedProducts(filtered.slice(0, ITEMS_PER_PAGE));
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [allProducts, filters, activeGender, activeCategory]);

  // 3. Infinite Scroll Logic
  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    setTimeout(() => {
      const currentLength = displayedProducts.length;
      const nextBatch = filteredList.slice(currentLength, currentLength + ITEMS_PER_PAGE);
      
      if (nextBatch.length > 0) {
        setDisplayedProducts(prev => [...prev, ...nextBatch]);
        setHasMore(currentLength + nextBatch.length < filteredList.length);
      } else {
        setHasMore(false);
      }
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMore, displayedProducts.length, filteredList]);

  // Pull to Refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  // Normalize product (preserved from web)
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

  // Extract brands and sizes (preserved from web)
  const brands = useMemo(() => {
    const brandSet = new Set();
    allProducts.forEach(product => {
      if (product.brand) brandSet.add(product.brand);
    });
    return Array.from(brandSet).sort();
  }, [allProducts]);

  const sizes = useMemo(() => {
    const sizeSet = new Set();
    allProducts.forEach(product => {
      if (product.sizes && Array.isArray(product.sizes)) {
        product.sizes.forEach(size => sizeSet.add(size));
      }
    });
    return Array.from(sizeSet).sort();
  }, [allProducts]);

  // Filter handlers
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      priceRange: null,
      brands: [],
      sizes: [],
      sortBy: null,
    });
  };

  // Render Product Item (Optimized for FlatList)
  const renderProduct = useCallback(({ item }) => {
    const normalizedProduct = normalizeProduct(item);
    return <ProductCard product={normalizedProduct} />;
  }, [normalizeProduct]);

  // Key extractor for FlatList
  const keyExtractor = useCallback((item) => {
    return item._id || item.id || Math.random().toString();
  }, []);

  // List Footer - Loading indicator
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
        <Text className="text-base text-gray-500 mb-4">No products found</Text>
        {(filters.priceRange || filters.brands?.length > 0 || filters.sizes?.length > 0) && (
          <TouchableOpacity onPress={handleClearFilters} className="px-5 py-2.5 bg-gray-900 rounded-lg">
            <Text className="text-white text-sm font-semibold">Clear filters</Text>
          </TouchableOpacity>
        )}
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
        <Text className="flex-1 text-lg font-bold text-gray-900 mx-3" numberOfLines={1}>{pageTitle}</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)} className="px-3 py-1.5">
          <Text className="text-sm font-semibold text-gray-900">Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Product Count */}
      {!isLoading && filteredList.length > 0 && (
        <View className="py-2 bg-white" style={{ paddingHorizontal: 16 }}>
          <Text className="text-sm text-gray-500">
            {filteredList.length} {filteredList.length === 1 ? 'product' : 'products'}
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
          const itemHeight = 320; // Approximate item height
          const rowIndex = Math.floor(index / 2);
          return {
            length: itemHeight,
            offset: itemHeight * rowIndex,
            index,
          };
        }}
      />

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        brands={brands}
        sizes={sizes}
      />
      <BottomNavBar />
    </View>
  );
};

// Filter Modal Component
const FilterModal = ({ visible, onClose, filters, onFilterChange, onClearFilters, brands, sizes }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const toggleBrand = (brand) => {
    setLocalFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const toggleSize = (size) => {
    setLocalFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const setSortBy = (sortBy) => {
    setLocalFilters(prev => ({ ...prev, sortBy }));
  };

  const setPriceRange = (range) => {
    setLocalFilters(prev => ({ ...prev, priceRange: range }));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-[20px] max-h-[80%]">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
            {/* Sort By */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">Sort By</Text>
              {['default', 'price-low-high', 'price-high-low', 'newest'].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSortBy(option)}
                  className={`py-3 px-4 rounded-lg mb-2 border ${
                    localFilters.sortBy === option
                      ? 'bg-gray-900 border-gray-900'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className={`text-sm ${localFilters.sortBy === option ? 'text-white font-semibold' : 'text-gray-700'}`}>
                    {option === 'default' ? 'Price: Low to High' :
                     option === 'price-low-high' ? 'Price: Low to High' :
                     option === 'price-high-low' ? 'Price: High to Low' :
                     'Newest First'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Range */}
            <View className="mb-6">
              <Text className="text-base font-semibold text-gray-900 mb-3">Price Range</Text>
              {[
                { label: 'Under ₹1,000', min: 0, max: 1000 },
                { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
                { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
                { label: 'Over ₹10,000', min: 10000, max: Infinity },
              ].map((range) => (
                <TouchableOpacity
                  key={range.label}
                  onPress={() => setPriceRange(localFilters.priceRange?.min === range.min ? null : range)}
                  className={`py-3 px-4 rounded-lg mb-2 border ${
                    localFilters.priceRange?.min === range.min
                      ? 'bg-gray-900 border-gray-900'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className={`text-sm ${localFilters.priceRange?.min === range.min ? 'text-white font-semibold' : 'text-gray-700'}`}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Brands */}
            {brands.length > 0 && (
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">Brands</Text>
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    onPress={() => toggleBrand(brand)}
                    className={`py-3 px-4 rounded-lg mb-2 border ${
                      localFilters.brands.includes(brand)
                        ? 'bg-gray-900 border-gray-900'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <Text className={`text-sm ${localFilters.brands.includes(brand) ? 'text-white font-semibold' : 'text-gray-700'}`}>
                      {brand}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-3">Sizes</Text>
                <View className="flex-row flex-wrap gap-2">
                  {sizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      onPress={() => toggleSize(size)}
                      className={`w-[60px] h-10 justify-center items-center rounded-lg border ${
                        localFilters.sizes.includes(size)
                          ? 'bg-gray-900 border-gray-900'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text className={`text-sm font-semibold ${localFilters.sizes.includes(size) ? 'text-white' : 'text-gray-700'}`}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View className="flex-row p-4 border-t border-gray-200 gap-3">
            <TouchableOpacity onPress={onClearFilters} className="flex-1 py-3.5 bg-gray-100 rounded-lg items-center">
              <Text className="text-gray-700 text-base font-semibold">Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleApply} className="flex-1 py-3.5 bg-gray-900 rounded-lg items-center">
              <Text className="text-white text-base font-semibold">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CategoryScreen;
