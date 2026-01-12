/**
 * Category Screen - React Native version with NativeWind
 * Converted from web CategoryPage.jsx
 * Features: FlatList, Infinite Scroll, Same API calls, Performance optimized
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import BottomNavBar from '../components/BottomNavBar';

const ITEMS_PER_PAGE = 20; // Items to load per infinite scroll batch

// Categories data (same as DrawerContent)
const categories = [
  { 
    id: 'men', 
    label: 'Men', 
    subItems: [
      { name: 'Shirts', path: 'shirt' },
      { name: 'T-Shirts', path: 'tshirt' },
      { name: 'Jeans', path: 'jeans' },
      { name: 'Trousers', path: 'trousers' },
      { name: 'Shoes', path: 'shoes' }
    ] 
  },
  { 
    id: 'women', 
    label: 'Women', 
    subItems: [
      { name: 'Shirts', path: 'shirt' },
      { name: 'T-Shirts', path: 'tshirt' },
      { name: 'Jeans', path: 'jeans' },
      { name: 'Trousers', path: 'trousers' },
      { name: 'Saree', path: 'saree' }
    ] 
  },
  { 
    id: 'watches', 
    label: 'Watches', 
    subItems: [
      { name: "Men's Watches", path: 'watches', params: { gender: 'men' } },
      { name: "Women's Watches", path: 'watches', params: { gender: 'women' } },
      { name: 'Smart Watches', path: 'watches', params: { type: 'smart' } }
    ] 
  },
  { 
    id: 'eyewear', 
    label: 'Eyewear', 
    subItems: [
      { name: "Men's Eyewear", path: 'lenses', params: { gender: 'men' } },
      { name: "Women's Eyewear", path: 'lenses', params: { gender: 'women' } },
      { name: 'Sunglasses', path: 'lenses', params: { type: 'sun' } }
    ] 
  },
  { 
    id: 'accessories', 
    label: 'Accessories', 
    subItems: [
      { name: "Men's Accessories", path: 'accessories', params: { gender: 'men' } },
      { name: "Women's Accessories", path: 'accessories', params: { gender: 'women' } },
      { name: 'Wallets & Belts', path: 'accessories', params: { type: 'general' } }
    ] 
  }
];

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
  
  // State for category dropdown
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categoryLayouts, setCategoryLayouts] = useState({});
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const isAnimating = useRef(false);
  
  // Animation values for dropdown
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const dropdownScale = useRef(new Animated.Value(0.95)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

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
      } else if (categoryType === 'lenses' || categoryType === 'eyewear') {
        // Handle both 'lenses' and 'eyewear' category types
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
          'shirts': { subCategory: 'shirt', displayName: 'Shirt' },
          'tshirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
          't-shirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
          'tshirts': { subCategory: 'tshirt', displayName: 'T-Shirt' },
          't-shirts': { subCategory: 'tshirt', displayName: 'T-Shirt' },
          'jeans': { subCategory: 'jeans', displayName: 'Jeans' },
          'trousers': { subCategory: 'trousers', displayName: 'Trousers' },
          'trouser': { subCategory: 'trousers', displayName: 'Trousers' },
          'shoes': { subCategory: 'shoes', displayName: 'Shoes' },
          'shoe': { subCategory: 'shoes', displayName: 'Shoes' },
          'saree': { subCategory: 'saree', displayName: 'Saree' },
          'sari': { subCategory: 'saree', displayName: 'Saree' },
          'accessories': { subCategory: 'accessories', displayName: 'Accessories' },
        };

        const categoryInfo = categoryMap[activeCategory.toLowerCase()];
        
        if (categoryInfo) {
          const fetcher = activeGender === 'women' ? productAPI.getWomenItems : productAPI.getMenItems;
          // Use 'category' parameter (as used in HomeScreen) instead of 'subCategory'
          response = await fetcher({ category: categoryInfo.subCategory, limit: fetchLimit });
          
          // If no products found with category filter, try fetching all and filtering client-side
          let needsClientSideFilter = false;
          if (!response || !response.success || !response.data?.products || response.data.products.length === 0) {
            console.log(`[${categoryInfo.subCategory}] No products found with category filter, trying to fetch all and filter...`);
            const allResponse = await fetcher({ limit: fetchLimit });
            if (allResponse && allResponse.success && allResponse.data?.products) {
              response = allResponse;
              needsClientSideFilter = true; // Mark that we need to filter client-side
            }
          }
          
          if (response && response.success && response.data.products) {
            const originalCount = response.data.products.length;
            
            // Only apply strict filtering if we fetched all products (client-side filtering needed)
            // If API returned products with category parameter, trust them (they're already filtered by API)
            if (needsClientSideFilter) {
              // Additional filtering to ensure we only get the correct subcategory
              const filteredProducts = response.data.products.filter(product => {
                if (!product) return false;
                
                const productSubCategory = (product.subCategory || '').toLowerCase().trim().replace(/-/g, '');
                const productCategory = (product.category || '').toLowerCase().trim().replace(/-/g, '');
                const productName = (product.name || '').toLowerCase().trim();
                const expectedSubCategory = categoryInfo.subCategory.toLowerCase().trim().replace(/-/g, '');
                
                // Priority 1: Exact match in subCategory (most reliable)
                if (productSubCategory === expectedSubCategory) {
                  return true;
                }
                
                // Priority 2: Exact match in category
                if (productCategory === expectedSubCategory) {
                  return true;
                }
                
                // Priority 3: For jeans specifically, check for jeans/denim keywords
                if (expectedSubCategory === 'jeans') {
                  // Must have jeans/denim in subCategory, category, or name
                  const hasJeansKeyword = productSubCategory.includes('jean') || 
                                         productCategory.includes('jean') ||
                                         productName.includes('jean') || 
                                         productName.includes('denim') ||
                                         productSubCategory.includes('denim') ||
                                         productCategory.includes('denim');
                  
                  // Exclude other categories explicitly
                  const isOtherCategory = productSubCategory === 'shirt' || productSubCategory === 'tshirt' ||
                                         productSubCategory === 'trouser' || productSubCategory === 'shoe' ||
                                         productSubCategory === 'saree' ||
                                         productCategory === 'shirt' || productCategory === 'tshirt' ||
                                         productCategory === 'trouser' || productCategory === 'shoe' ||
                                         productCategory === 'saree';
                  
                  return hasJeansKeyword && !isOtherCategory;
                }
                
                // Priority 4: For shoes specifically, check for shoe/shoes keywords
                if (expectedSubCategory === 'shoes') {
                  // Must have shoe/shoes in subCategory, category, or name
                  const hasShoeKeyword = productSubCategory.includes('shoe') || 
                                        productCategory.includes('shoe') ||
                                        productName.includes('shoe') || 
                                        productName.includes('sneaker') ||
                                        productName.includes('footwear');
                  
                  // Exclude other categories explicitly
                  const isOtherCategory = productSubCategory === 'shirt' || productSubCategory === 'tshirt' ||
                                         productSubCategory === 'trouser' || productSubCategory === 'jean' ||
                                         productSubCategory === 'saree' ||
                                         productCategory === 'shirt' || productCategory === 'tshirt' ||
                                         productCategory === 'trouser' || productCategory === 'jean' ||
                                         productCategory === 'saree';
                  
                  return hasShoeKeyword && !isOtherCategory;
                }
                
                // For other categories, use strict matching with fallback to includes
                const matchesSubCategory = productSubCategory === expectedSubCategory || productSubCategory.includes(expectedSubCategory);
                const matchesCategory = productCategory === expectedSubCategory || productCategory.includes(expectedSubCategory);
                
                return matchesSubCategory || matchesCategory;
              });
              
              response.data.products = filteredProducts.length > 0 ? filteredProducts : [];
              console.log(`[${categoryInfo.subCategory}] Client-side filtered: ${filteredProducts.length} products from ${originalCount} total`);
            } else {
              // API already filtered by category, but do a light validation to ensure quality
              // Only filter out obvious mismatches, but trust the API results
              const validatedProducts = response.data.products.filter(product => {
                if (!product) return false;
                
                const productSubCategory = (product.subCategory || product.category || '').toLowerCase().trim().replace(/-/g, '');
                const expectedSubCategory = categoryInfo.subCategory.toLowerCase().trim().replace(/-/g, '');
                
                // For jeans and shoes, do a light check to exclude obvious wrong categories
                if (expectedSubCategory === 'jeans') {
                  const isOtherCategory = productSubCategory === 'shirt' || productSubCategory === 'tshirt' ||
                                         productSubCategory === 'trouser' || productSubCategory === 'shoe' ||
                                         productSubCategory === 'saree';
                  return !isOtherCategory; // Exclude obvious wrong categories
                }
                
                if (expectedSubCategory === 'shoes') {
                  const isOtherCategory = productSubCategory === 'shirt' || productSubCategory === 'tshirt' ||
                                         productSubCategory === 'trouser' || productSubCategory === 'jean' ||
                                         productSubCategory === 'saree';
                  return !isOtherCategory; // Exclude obvious wrong categories
                }
                
                return true; // Trust API for other categories
              });
              
              response.data.products = validatedProducts;
              console.log(`[${categoryInfo.subCategory}] API filtered: ${validatedProducts.length} products (trusting API)`);
            }
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
        // Handle different response structures
        let products = [];
        if (Array.isArray(response.data)) {
          products = response.data;
        } else if (response.data?.products && Array.isArray(response.data.products)) {
          products = response.data.products;
        } else if (response.data && Array.isArray(response.data)) {
          products = response.data;
        } else if (Array.isArray(response)) {
          products = response;
        }
        
        console.log(`[Fetch] Setting ${products.length} products to allProducts`);
        console.log(`[Fetch] Response structure:`, {
          hasData: !!response.data,
          dataIsArray: Array.isArray(response.data),
          hasProducts: !!response.data?.products,
          productsIsArray: Array.isArray(response.data?.products)
        });
        setAllProducts(products);
      } else {
        console.log('[Fetch] No response or response not successful', {
          hasResponse: !!response,
          isSuccess: response?.success
        });
        setAllProducts([]);
      }
    } catch (error) {
      console.error('[Fetch] Error fetching products:', error);
      setAllProducts([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [categoryType, activeGender, activeCategory]);

  useEffect(() => {
    // Reset state when category changes
    setDisplayedProducts([]);
    setFilteredList([]);
    setHasMore(true);
    setFilters({
      priceRange: null,
      brands: [],
      sizes: [],
      sortBy: null,
    });
    // Close dropdown when category changes
    setExpandedCategory(null);
    // Fetch products
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryType, activeGender, activeCategory]);

  // 2. Filter Logic (Preserved from web)
  useEffect(() => {
    // Don't filter if still loading
    if (isLoading) {
      console.log('[Client Filter] Skipping filter - still loading');
      return;
    }
    
    let filtered = [...allProducts];
    console.log(`[Client Filter] Starting with ${allProducts.length} products for ${activeGender}/${activeCategory}`);

    // Subcategory Filtering
    if (activeGender && activeCategory) {
      const categoryMap = {
        'shirt': { subCategory: 'shirt', displayName: 'Shirt' },
        'shirts': { subCategory: 'shirt', displayName: 'Shirt' },
        'tshirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
        't-shirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
        'tshirts': { subCategory: 'tshirt', displayName: 'T-Shirt' },
        't-shirts': { subCategory: 'tshirt', displayName: 'T-Shirt' },
        'jeans': { subCategory: 'jeans', displayName: 'Jeans' },
        'trousers': { subCategory: 'trousers', displayName: 'Trousers' },
        'trouser': { subCategory: 'trousers', displayName: 'Trousers' },
        'shoes': { subCategory: 'shoes', displayName: 'Shoes' },
        'shoe': { subCategory: 'shoes', displayName: 'Shoes' },
        'saree': { subCategory: 'saree', displayName: 'Saree' },
        'sari': { subCategory: 'saree', displayName: 'Saree' },
        'accessories': { subCategory: 'accessories', displayName: 'Accessories' },
      };
      const categoryInfo = categoryMap[activeCategory.toLowerCase()];
      
      if (categoryInfo) {
        const expectedSubCategory = categoryInfo.subCategory.toLowerCase().trim().replace(/-/g, '');
        
        // Debug: Log sample products to understand structure (only for jeans/shoes)
        if (filtered.length > 0 && (expectedSubCategory === 'jeans' || expectedSubCategory === 'shoes')) {
          const sampleProducts = filtered.slice(0, 10);
          console.log(`[Client Filter] Sample products for ${expectedSubCategory}:`, sampleProducts.map(p => ({
            name: p.name,
            category: p.category,
            subCategory: p.subCategory,
            subcategory: p.subcategory, // Check alternative field name
            gender: p.gender,
            type: p.type,
            productType: p.productType
          })));
        }
        
        filtered = filtered.filter(product => {
          if (!product) return false;
          
          // Check multiple possible field names
          const productSubCategory = (product.subCategory || product.subcategory || product.type || '').toLowerCase().trim().replace(/-/g, '');
          const productCategory = (product.category || product.productCategory || '').toLowerCase().trim().replace(/-/g, '');
          const productName = (product.name || product.title || product.productName || '').toLowerCase().trim();
          
          // Priority 1: Exact match in subCategory (most reliable)
          if (productSubCategory === expectedSubCategory) {
            return true;
          }
          
          // Priority 2: Exact match in category
          if (productCategory === expectedSubCategory) {
            return true;
          }
          
          // Priority 3: For jeans specifically, check for jeans/denim keywords
          if (expectedSubCategory === 'jeans') {
            // Must have jeans/denim in subCategory, category, or name
            const hasJeansKeyword = productSubCategory.includes('jean') || 
                                   productCategory.includes('jean') ||
                                   productName.includes('jean') || 
                                   productName.includes('denim') ||
                                   productSubCategory.includes('denim') ||
                                   productCategory.includes('denim');
            
            // Only exclude if it's clearly another category (not just missing jeans keyword)
            const isClearlyOtherCategory = (productSubCategory === 'shirt' || productSubCategory === 'tshirt' ||
                                   productSubCategory === 'trouser' || productSubCategory === 'shoe' ||
                                   productSubCategory === 'saree') &&
                                   !productSubCategory.includes('jean') && !productSubCategory.includes('denim');
            
            const isClearlyOtherCategoryInCategory = (productCategory === 'shirt' || productCategory === 'tshirt' ||
                                   productCategory === 'trouser' || productCategory === 'shoe' ||
                                   productCategory === 'saree') &&
                                   !productCategory.includes('jean') && !productCategory.includes('denim');
            
            // If it has jeans keyword, include it
            if (hasJeansKeyword && !isClearlyOtherCategory && !isClearlyOtherCategoryInCategory) {
              return true;
            }
            
            // If no clear match and no clear exclusion, be more lenient - check if name suggests jeans
            if (!isClearlyOtherCategory && !isClearlyOtherCategoryInCategory) {
              // If name has jeans/denim, include it
              if (productName.includes('jean') || productName.includes('denim')) {
                return true;
              }
            }
            
            // Otherwise exclude
            return false;
          }
          
          // Priority 4: For shoes specifically, check for shoe/shoes keywords
          if (expectedSubCategory === 'shoes') {
            // Must have shoe/shoes in subCategory, category, or name
            const hasShoeKeyword = productSubCategory.includes('shoe') || 
                                  productCategory.includes('shoe') ||
                                  productName.includes('shoe') || 
                                  productName.includes('sneaker') ||
                                  productName.includes('footwear');
            
            // Exclude other categories explicitly
            const isOtherCategory = productSubCategory === 'shirt' || productSubCategory === 'tshirt' ||
                                   productSubCategory === 'trouser' || productSubCategory === 'jean' ||
                                   productSubCategory === 'saree' ||
                                   productCategory === 'shirt' || productCategory === 'tshirt' ||
                                   productCategory === 'trouser' || productCategory === 'jean' ||
                                   productCategory === 'saree';
            
            return hasShoeKeyword && !isOtherCategory;
          }
          
          // For other categories, use strict matching with fallback to includes
          const matchesSubCategory = productSubCategory === expectedSubCategory || productSubCategory.includes(expectedSubCategory);
          const matchesCategory = productCategory === expectedSubCategory || productCategory.includes(expectedSubCategory);
          
          return matchesSubCategory || matchesCategory;
        });
        console.log(`[Client Filter] After subcategory filter: ${filtered.length} products`);
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

    console.log(`[Client Filter] Final filtered count: ${filtered.length} products`);
    setFilteredList(filtered);
    const initialDisplay = filtered.slice(0, ITEMS_PER_PAGE);
    setDisplayedProducts(initialDisplay);
    setHasMore(filtered.length > ITEMS_PER_PAGE);
    console.log(`[Client Filter] Displaying ${initialDisplay.length} products initially, hasMore: ${filtered.length > ITEMS_PER_PAGE}`);
  }, [allProducts, filters, activeGender, activeCategory, isLoading]);

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

  // Key extractor for FlatList - ensures unique keys
  const keyExtractor = useCallback((item, index) => {
    const id = item._id || item.id;
    if (id) {
      return `product-${id}`;
    }
    // Fallback: use index with prefix to ensure uniqueness
    return `product-${index}-${Date.now()}`;
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

  // Animate dropdown when opening/closing
  useEffect(() => {
    // Stop any ongoing animations
    dropdownOpacity.stopAnimation();
    dropdownScale.stopAnimation();
    overlayOpacity.stopAnimation();
    
    if (expandedCategory) {
      // Opening: Set visible first, reset animation values, then animate
      isAnimating.current = true;
      setIsDropdownVisible(true);
      
      // Reset animation values to starting position
      dropdownOpacity.setValue(0);
      dropdownScale.setValue(0.95);
      overlayOpacity.setValue(0);
      
      // Small delay to ensure render, then animate
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(dropdownOpacity, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(dropdownScale, {
            toValue: 1,
            tension: 68,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(overlayOpacity, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]).start(() => {
          isAnimating.current = false;
        });
      });
    } else if (isDropdownVisible) {
      // Closing: Animate out first, then hide
      isAnimating.current = true;
      Animated.parallel([
        Animated.timing(dropdownOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(dropdownScale, {
          toValue: 0.95,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Hide dropdown after animation completes
        setIsDropdownVisible(false);
        isAnimating.current = false;
      });
    }
  }, [expandedCategory]);

  // Handle category navigation
  const handleCategoryPress = (cat) => {
    // Prevent interaction while animating
    if (isAnimating.current) return;
    
    if (cat.subItems && cat.subItems.length > 0) {
      // Toggle dropdown
      if (expandedCategory === cat.id) {
        setExpandedCategory(null);
      } else {
        setExpandedCategory(cat.id);
      }
    } else {
      // Navigate to category - close dropdown first if open
      if (expandedCategory) {
        setExpandedCategory(null);
        // Wait for close animation before navigating
        setTimeout(() => {
          navigation.navigate('Category', { category: cat.id });
        }, 200);
      } else {
        navigation.navigate('Category', { category: cat.id });
      }
    }
  };

  // Handle subcategory navigation
  const handleSubcategoryPress = (cat, subItem) => {
    setExpandedCategory(null);
    if (subItem.params) {
      navigation.navigate('Category', { category: subItem.path, ...subItem.params });
    } else {
      navigation.navigate('Category', { category: cat.id, subcategory: subItem.path });
    }
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

      {/* Category Filter Bar */}
      <View className="bg-white border-b border-gray-200" style={{ position: 'relative', zIndex: 100 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12, gap: 8 }}
          style={{ position: 'relative' }}
          nestedScrollEnabled={true}
        >
          {categories.map((cat) => {
            const isActive = categoryType === cat.id;
            const isExpanded = expandedCategory === cat.id;
            const hasSubItems = cat.subItems && cat.subItems.length > 0;
            
            return (
              <View 
                key={cat.id} 
                onLayout={(event) => {
                  const { x, y, width, height } = event.nativeEvent.layout;
                  setCategoryLayouts(prev => ({
                    ...prev,
                    [cat.id]: { x, y, width, height }
                  }));
                }}
              >
                <TouchableOpacity
                  onPress={() => handleCategoryPress(cat)}
                  className={`flex-row items-center px-4 py-2 rounded-full border ${
                    isActive 
                      ? 'bg-black border-black' 
                      : 'bg-white border-gray-300'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className={`text-sm font-semibold ${
                    isActive ? 'text-white' : 'text-gray-900'
                  }`}>
                    {cat.label}
                  </Text>
                  {hasSubItems && (
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color={isActive ? "#fff" : "#6b7280"}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
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
      
      {/* Dropdown Menu - Rendered outside SafeAreaView for proper visibility */}
      {isDropdownVisible && (() => {
        const cat = categories.find(c => c.id === expandedCategory);
        if (!cat || !cat.subItems || cat.subItems.length === 0) return null;
        
        return (
          <Animated.View
            style={{
              position: 'absolute',
              top: 110, // Position below header (approx 60px) + category bar (approx 50px)
              left: 12,
              right: 12,
              zIndex: 1000,
              backgroundColor: 'transparent',
              pointerEvents: 'box-none',
              opacity: dropdownOpacity,
              transform: [{ scale: dropdownScale }],
            }}
          >
            <View
              style={{
                backgroundColor: 'white',
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 20,
                minWidth: 180,
                maxWidth: 220,
                alignSelf: 'flex-start',
              }}
              onStartShouldSetResponder={() => true}
            >
              <TouchableOpacity
                onPress={() => {
                  // Map 'eyewear' to 'lenses' for API compatibility
                  const categoryPath = cat.id === 'eyewear' ? 'lenses' : cat.id;
                  navigation.navigate('Category', { category: categoryPath });
                  setExpandedCategory(null);
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#f3f4f6',
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>
                  Shop All {cat.label}
                </Text>
              </TouchableOpacity>
              {cat.subItems.map((subItem, idx) => (
                <TouchableOpacity
                  key={`${cat.id}-${subItem.path}-${idx}`}
                  onPress={() => handleSubcategoryPress(cat, subItem)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: idx < cat.subItems.length - 1 ? 1 : 0,
                    borderBottomColor: '#f3f4f6',
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 14, color: '#374151' }}>{subItem.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );
      })()}
      
      {/* Overlay to close dropdown when clicking outside - with animation */}
      {isDropdownVisible && (
        <Animated.View
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            zIndex: 999,
            opacity: overlayOpacity,
          }}
          pointerEvents={expandedCategory ? 'auto' : 'none'}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setExpandedCategory(null)}
            style={{ flex: 1 }}
          />
        </Animated.View>
      )}

      {/* Products FlatList */}
      <FlatList
        key={`${categoryType}-${activeGender}-${activeCategory}`}
        data={displayedProducts}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 100 }}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 4 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        onScrollBeginDrag={() => expandedCategory && setExpandedCategory(null)}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        extraData={displayedProducts.length}
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
