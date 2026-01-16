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
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/BottomNavBar';

const ITEMS_PER_PAGE = 20; // Items to load per infinite scroll batch

// Categories data (same as DrawerContent)
const categories = [
  { 
    id: 'men', 
    label: 'Men', 
    subItems: [
      { name: 'Shirts', path: 'shirt' },
      { name: 'Trousers', path: 'trousers' }
    ] 
  },
  { 
    id: 'women', 
    label: 'Women', 
    subItems: [
      { name: 'Saree', path: 'saree' }
    ] 
  },
  { 
    id: 'watches', 
    label: 'Watches'
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
      { name: "Women's Accessories", path: 'accessories', params: { gender: 'women' } }
    ] 
  }
];

const CategoryScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  
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
  const flatListRef = useRef(null);
  
  // Animation values for dropdown
  const dropdownOpacity = useRef(new Animated.Value(0)).current;
  const dropdownScale = useRef(new Animated.Value(0.95)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  // Scroll position tracking for "Go to Top" button
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const scrollToTopOpacity = useRef(new Animated.Value(0)).current;
  const scrollToTopScale = useRef(new Animated.Value(0.8)).current;
  const showScrollToTopRef = useRef(false);
  
  // Bottom bar visibility based on scroll direction
  const [isBottomBarVisible, setIsBottomBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  
  // Handle scroll event for FlatList
  const isBottomBarVisibleRef = useRef(true);
  const handleScroll = useCallback((event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const threshold = 200; // Show button after scrolling 200px
    const scrollDelta = scrollY - lastScrollY.current;
    
    // Quick response: hide/show immediately based on scroll direction
    if (scrollDelta > 5 && scrollY > 10) {
      // Scrolling down - hide bottom bar immediately
      if (isBottomBarVisibleRef.current) {
        isBottomBarVisibleRef.current = false;
        setIsBottomBarVisible(false);
      }
    } else if (scrollDelta < -5) {
      // Scrolling up - show bottom bar immediately
      if (!isBottomBarVisibleRef.current) {
        isBottomBarVisibleRef.current = true;
        setIsBottomBarVisible(true);
      }
    }
    lastScrollY.current = scrollY;
    
    // Handle "Go to Top" button visibility
    if (scrollY > threshold) {
      if (!showScrollToTopRef.current) {
        showScrollToTopRef.current = true;
        setShowScrollToTop(true);
        Animated.parallel([
          Animated.timing(scrollToTopOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scrollToTopScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else {
      if (showScrollToTopRef.current) {
        showScrollToTopRef.current = false;
        setShowScrollToTop(false);
        Animated.parallel([
          Animated.timing(scrollToTopOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scrollToTopScale, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [scrollToTopOpacity, scrollToTopScale]);

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
        // If subcategory is specified, filter by it
        if (activeCategory) {
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
          };
          const categoryInfo = categoryMap[activeCategory.toLowerCase()];
          if (categoryInfo) {
            response = await productAPI.getMenItems({ category: categoryInfo.subCategory, limit: fetchLimit });
            
            // If no products found with category filter, try fetching all and filtering client-side
            if (!response || !response.success || !response.data?.products || response.data.products.length === 0) {
              console.log(`[Men ${categoryInfo.subCategory}] No products found with category filter, trying to fetch all and filter...`);
              const allResponse = await productAPI.getMenItems({ limit: fetchLimit });
              if (allResponse && allResponse.success && allResponse.data?.products) {
                response = allResponse;
                // Mark for client-side filtering - we'll handle this in the filterProducts function
                response._needsClientSideFilter = true;
                response._expectedSubCategory = categoryInfo.subCategory;
              }
            }
            setPageTitle(`Men's ${categoryInfo.displayName}s`);
          } else {
            // Only show shirts when no subcategory is specified
            response = await productAPI.getMenItems({ category: 'shirt', limit: fetchLimit });
            if (!response || !response.success || !response.data?.products || response.data.products.length === 0) {
              // Try with subCategory parameter
              response = await productAPI.getMenItems({ subCategory: 'shirt', limit: fetchLimit });
            }
            setPageTitle("Men's Shirts");
          }
        } else {
          // Only show shirts when no subcategory is specified
          response = await productAPI.getMenItems({ category: 'shirt', limit: fetchLimit });
          if (!response || !response.success || !response.data?.products || response.data.products.length === 0) {
            // Try with subCategory parameter
            response = await productAPI.getMenItems({ subCategory: 'shirt', limit: fetchLimit });
          }
          setPageTitle("Men's Shirts");
        }
      } else if (categoryType === 'women') {
        // If subcategory is specified, filter by it
        if (activeCategory) {
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
          };
          const categoryInfo = categoryMap[activeCategory.toLowerCase()];
          if (categoryInfo) {
            response = await productAPI.getWomenItems({ category: categoryInfo.subCategory, limit: fetchLimit });
            
            // If no products found with category filter, try fetching all and filtering client-side
            if (!response || !response.success || !response.data?.products || response.data.products.length === 0) {
              console.log(`[Women ${categoryInfo.subCategory}] No products found with category filter, trying to fetch all and filter...`);
              const allResponse = await productAPI.getWomenItems({ limit: fetchLimit });
              if (allResponse && allResponse.success && allResponse.data?.products) {
                response = allResponse;
                // Mark for client-side filtering - we'll handle this in the filterProducts function
                response._needsClientSideFilter = true;
                response._expectedSubCategory = categoryInfo.subCategory;
              }
            }
            setPageTitle(`Women's ${categoryInfo.displayName}s`);
          } else {
            // Only show sarees when no subcategory is specified
            response = await productAPI.getWomenItems({ category: 'saree', limit: fetchLimit });
            if (!response || !response.success || !response.data?.products || response.data.products.length === 0) {
              // Try with subCategory parameter
              response = await productAPI.getWomenItems({ subCategory: 'saree', limit: fetchLimit });
            }
            setPageTitle("Women's Sarees");
          }
        } else {
          // Only show sarees when no subcategory is specified
          response = await productAPI.getWomenItems({ category: 'saree', limit: fetchLimit });
          if (!response || !response.success || !response.data?.products || response.data.products.length === 0) {
            // Try with subCategory parameter
            response = await productAPI.getWomenItems({ subCategory: 'saree', limit: fetchLimit });
          }
          setPageTitle("Women's Sarees");
        }
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
        
        console.log(`[Fetch] Category: ${categoryType}, Setting ${products.length} products to allProducts`);
        console.log(`[Fetch] Response structure:`, {
          categoryType,
          activeGender,
          activeCategory,
          hasData: !!response.data,
          dataIsArray: Array.isArray(response.data),
          hasProducts: !!response.data?.products,
          productsIsArray: Array.isArray(response.data?.products),
          productsLength: products.length,
          firstProduct: products[0] ? { name: products[0].name, category: products[0].category, gender: products[0].gender } : null
        });
        setAllProducts(products);
      } else {
        console.log('[Fetch] No response or response not successful', {
          categoryType,
          activeGender,
          activeCategory,
          hasResponse: !!response,
          isSuccess: response?.success,
          responseData: response?.data
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

  // Handle scroll to top when tab is pressed
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.scrollToTop && flatListRef.current) {
        flatListRef.current.scrollToOffset({ offset: 0, animated: true });
        // Clear the param to prevent scrolling on every focus
        navigation.setParams({ scrollToTop: undefined });
      }
    }, [route.params?.scrollToTop, navigation])
  );

  // 2. Filter Logic (Preserved from web)
  useEffect(() => {
    // Don't filter if still loading or no products
    if (isLoading) {
      console.log('[Client Filter] Skipping filter - still loading');
      return;
    }
    
    // If no products, clear everything
    if (!allProducts || allProducts.length === 0) {
      console.log('[Client Filter] No products to filter');
      setFilteredList([]);
      setDisplayedProducts([]);
      setHasMore(false);
      return;
    }
    
    let filtered = [...allProducts];
    console.log(`[Client Filter] Starting with ${allProducts.length} products for categoryType: ${categoryType}, activeGender: ${activeGender}, activeCategory: ${activeCategory}`);
    
    // Debug: Log first few products to see their structure
    if (filtered.length > 0 && categoryType === 'women') {
      console.log(`[Client Filter] Sample women products:`, filtered.slice(0, 3).map(p => ({
        name: p.name,
        category: p.category,
        subCategory: p.subCategory,
        gender: p.gender,
        id: p._id || p.id
      })));
    }

    // Subcategory Filtering - only apply when both gender and subcategory are specified
    // When viewing main category (e.g., just "women" without subcategory), show only sarees
    // When viewing main category (e.g., just "men" without subcategory), show only shirts
    console.log(`[Client Filter] Starting filter - activeGender: ${activeGender}, activeCategory: ${activeCategory}, categoryType: ${categoryType}, filtered.length: ${filtered.length}`);
    // For men category without subcategory, filter to show only shirts
    if (categoryType === 'men' && !activeCategory) {
      // Helper function to normalize product category
      const normalizeProductCategory = (product) => {
        const categoryValue = product.subCategory || product.subcategory || product.productType || product.type;
        if (!categoryValue) return '';
        return String(categoryValue).toLowerCase().trim().replace(/-/g, '');
      };
      
      filtered = filtered.filter(product => {
        if (!product) return false;
        const productSubCategory = normalizeProductCategory(product);
        const productName = (product.name || product.title || product.productName || '').toLowerCase().trim();
        const productCategory = (product.category || product.productCategory || '').toLowerCase().trim().replace(/-/g, '');
        
        // Check if it's a shirt (exclude t-shirts, jeans, shoes, trousers)
        const isShirt = (productSubCategory === 'shirt' || productSubCategory === 'shirts') &&
                       !productSubCategory.includes('tshirt') && !productSubCategory.includes('t-shirt') &&
                       !productName.includes('tshirt') && !productName.includes('t-shirt') && !productName.includes('tee') &&
                       productSubCategory !== 'jeans' && productSubCategory !== 'jean' &&
                       productSubCategory !== 'shoe' && productSubCategory !== 'shoes' &&
                       productSubCategory !== 'trouser' && productSubCategory !== 'trousers' &&
                       productCategory !== 'jeans' && productCategory !== 'jean' &&
                       productCategory !== 'shoe' && productCategory !== 'shoes' &&
                       productCategory !== 'trouser' && productCategory !== 'trousers' &&
                       !productName.includes('jean') && !productName.includes('shoe') && 
                       !productName.includes('trouser') && !productName.includes('pant');
        
        return isShirt;
      });
      console.log(`[Client Filter] After filtering for shirts only: ${filtered.length} products`);
    } else if (categoryType === 'women' && !activeCategory) {
      // Helper function to normalize product category
      const normalizeProductCategory = (product) => {
        const categoryValue = product.subCategory || product.subcategory || product.productType || product.type;
        if (!categoryValue) return '';
        return String(categoryValue).toLowerCase().trim().replace(/-/g, '');
      };
      
      filtered = filtered.filter(product => {
        if (!product) return false;
        const productSubCategory = normalizeProductCategory(product);
        const productName = (product.name || product.title || product.productName || '').toLowerCase().trim();
        const productCategory = (product.category || product.productCategory || '').toLowerCase().trim().replace(/-/g, '');
        
        // Check if it's a saree
        const isSaree = productSubCategory === 'saree' || productSubCategory === 'sari' ||
                        productCategory === 'saree' || productCategory === 'sari' ||
                        productName.includes('saree') || productName.includes('sari');
        
        return isSaree;
      });
      console.log(`[Client Filter] After filtering for sarees only: ${filtered.length} products`);
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
        const expectedSubCategory = categoryInfo.subCategory.toLowerCase().trim().replace(/-/g, '');
        
        /**
         * Normalizes product category fields by checking multiple possible field names
         * in priority order: subCategory > subcategory > productType > type
         * Returns normalized, lowercase string with hyphens removed for consistent matching
         */
        const normalizeProductCategory = (product) => {
          // Check fields in priority order - stop at first non-empty value
          const categoryValue = product.subCategory || product.subcategory || product.productType || product.type;
          if (!categoryValue) return '';
          
          // Normalize: lowercase, trim, remove hyphens for consistent matching
          return String(categoryValue).toLowerCase().trim().replace(/-/g, '');
        };
        
        /**
         * Detects t-shirts from product name when category fields are missing
         * Used as fallback when normalizeProductCategory returns empty
         */
        const isTshirtByName = (productName) => {
          if (!productName) return false;
          const normalizedName = productName.toLowerCase().trim();
          // Match common t-shirt indicators in product names
          return normalizedName.includes('tshirt') || 
                 normalizedName.includes('t-shirt') || 
                 normalizedName.includes('tee') ||
                 (normalizedName.includes('shirt') && !normalizedName.includes('dress shirt'));
        };
        
        // Debug: Log sample products to understand structure (for jeans/shoes/shirt/tshirt)
        if (filtered.length > 0 && (expectedSubCategory === 'jeans' || expectedSubCategory === 'shoes' || expectedSubCategory === 'shirt' || expectedSubCategory === 'tshirt')) {
          const sampleProducts = filtered.slice(0, 10);
          console.log(`[Client Filter] Sample products for ${expectedSubCategory}:`, sampleProducts.map(p => ({
            name: p.name,
            category: p.category,
            subCategory: p.subCategory,
            subcategory: p.subcategory,
            productType: p.productType,
            type: p.type,
            normalized: normalizeProductCategory(p),
            gender: p.gender
          })));
          console.log(`[Client Filter] Filtering ${filtered.length} products for expectedSubCategory: ${expectedSubCategory}, activeGender: ${activeGender}, activeCategory: ${activeCategory}`);
        }
        
        filtered = filtered.filter(product => {
          if (!product) return false;
          
          // Normalize category fields using priority order
          const productSubCategory = normalizeProductCategory(product);
          const productCategory = (product.category || product.productCategory || '').toLowerCase().trim().replace(/-/g, '');
          const productName = (product.name || product.title || product.productName || '').toLowerCase().trim();
          
          // Priority 1: Exact match in normalized subCategory (most reliable)
          if (productSubCategory && productSubCategory === expectedSubCategory) {
            return true;
          }
          
          // Priority 2: Exact match in category (but only if category is not 'women' or 'men')
          // For women/men products, category is always 'women'/'men', so we should check subCategory
          if (productCategory && productCategory === expectedSubCategory && productCategory !== 'women' && productCategory !== 'men') {
            return true;
          }
          
          // Priority 3: For t-shirts specifically, prioritize product name over subCategory
          // This handles backend inconsistency where T-shirts may have wrong subCategory (e.g., "saree")
          if (expectedSubCategory === 'tshirt') {
            // PRIORITY 1: Check product name FIRST - name is most reliable indicator
            // If name clearly indicates T-shirt, include it (even if subCategory is wrong)
            if (isTshirtByName(productName)) {
              // Only exclude if name ALSO clearly indicates a conflicting category
              const hasConflictingName = productName.includes('saree') || 
                                        productName.includes('jean') || 
                                        productName.includes('trouser') || 
                                        productName.includes('shoe') ||
                                        (productName.includes('shirt') && productName.includes('dress'));
              // If name indicates T-shirt AND no conflicting category in name, include it
              if (!hasConflictingName) {
                return true;
              }
            }
            
            // PRIORITY 2: Exclude if name clearly indicates non-t-shirt category
            // This prevents false positives (e.g., "Saree T-Shirt" would be excluded here)
            const isNonTshirtName = productName.includes('saree') || 
                                    productName.includes('jean') || 
                                    productName.includes('trouser') || 
                                    productName.includes('shoe') ||
                                    (productName.includes('shirt') && productName.includes('dress'));
            if (isNonTshirtName) {
              return false;
            }
            
            // PRIORITY 3: Check subCategory as secondary validation
            // If normalized category matches, include it
            if (productSubCategory === 'tshirt' || productSubCategory === 'tshirts') {
              return true;
            }
            // If normalized category includes 'tshirt', include it (handles variations)
            if (productSubCategory && productSubCategory.includes('tshirt')) {
              return true;
            }
            
            // PRIORITY 4: If name suggests T-shirt but subCategory is empty/missing, include it
            // This handles cases where category fields are completely missing
            if (!productSubCategory && isTshirtByName(productName)) {
              return true;
            }
            
            // Exclude only if subCategory is explicitly a different category AND name doesn't indicate T-shirt
            if (productSubCategory) {
              const isOtherCategory = productSubCategory === 'jeans' || 
                                     productSubCategory === 'trousers' || 
                                     productSubCategory === 'shoes' || 
                                     productSubCategory === 'saree';
              // Only exclude if name doesn't indicate T-shirt (name takes priority)
              if (isOtherCategory && !isTshirtByName(productName)) {
                return false;
              }
            }
            
            // Final check: if name suggests T-shirt, include it regardless of subCategory
            if (isTshirtByName(productName)) {
              return true;
            }
            
            return false;
          }
          
          // Priority 4: For jeans specifically, check for jeans/denim keywords
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
          
          // Priority 5: For shoes specifically, check for shoe/shoes keywords
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
          
          // Priority 6: For other categories, use lenient matching
          // For women/men products, category is always 'women'/'men', so check subCategory
          if (productCategory === 'women' || productCategory === 'men') {
            // Use includes for partial matches (handles variations like 'tshirt' vs 'tshirts')
            if (productSubCategory) {
              return productSubCategory === expectedSubCategory || productSubCategory.includes(expectedSubCategory) || expectedSubCategory.includes(productSubCategory);
            }
            return false;
          }
          
          // For other product types, check both category and subCategory with lenient matching
          if (productSubCategory) {
            const matchesSubCategory = productSubCategory === expectedSubCategory || 
                                      productSubCategory.includes(expectedSubCategory) || 
                                      expectedSubCategory.includes(productSubCategory);
            if (matchesSubCategory) return true;
          }
          
          if (productCategory) {
            const matchesCategory = productCategory === expectedSubCategory || 
                                   productCategory.includes(expectedSubCategory) || 
                                   expectedSubCategory.includes(productCategory);
            if (matchesCategory) return true;
          }
          
          return false;
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
    console.log(`[Client Filter] Setting filteredList and displayedProducts`);
    setFilteredList(filtered);
    const initialDisplay = filtered.slice(0, ITEMS_PER_PAGE);
    console.log(`[Client Filter] Initial display: ${initialDisplay.length} products`);
    setDisplayedProducts(initialDisplay);
    setHasMore(filtered.length > ITEMS_PER_PAGE);
    console.log(`[Client Filter] Displaying ${initialDisplay.length} products initially, hasMore: ${filtered.length > ITEMS_PER_PAGE}`);
    console.log(`[Client Filter] Sample product:`, initialDisplay[0] ? { name: initialDisplay[0].name, id: initialDisplay[0]._id || initialDisplay[0].id } : 'none');
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
        <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 16 }}>No products found</Text>
        {(filters.priceRange || filters.brands?.length > 0 || filters.sizes?.length > 0) && (
          <TouchableOpacity onPress={handleClearFilters} style={{ paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.primary, borderRadius: 8 }} activeOpacity={0.8}>
            <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Clear filters</Text>
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ backgroundColor: colors.background }} edges={['top']}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: colors.text, marginHorizontal: 12 }} numberOfLines={1}>{pageTitle}</Text>
        <TouchableOpacity onPress={() => setShowFilters(true)} style={{ paddingHorizontal: 12, paddingVertical: 6 }} activeOpacity={0.7}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Category Filter Bar */}
      <View style={{ backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 14 }}
          nestedScrollEnabled={true}
        >
          {categories.map((cat) => {
            const isActive = categoryType === cat.id;
            const isExpanded = expandedCategory === cat.id;
            const hasSubItems = cat.subItems && cat.subItems.length > 0;
            
            return (
              <View 
                key={cat.id} 
                style={{ marginRight: 10 }}
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
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 24,
                    borderWidth: 2,
                    borderColor: isActive ? colors.primary : colors.border,
                    backgroundColor: isActive ? colors.primary : colors.backgroundTertiary,
                    shadowColor: isActive ? colors.primary : 'transparent',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isActive ? 0.2 : 0,
                    shadowRadius: 4,
                    elevation: isActive ? 3 : 0,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: isActive ? '700' : '600',
                    color: isActive ? (isDark ? '#000000' : '#FFFFFF') : colors.text,
                    letterSpacing: 0.3,
                  }}>
                    {cat.label}
                  </Text>
                  {hasSubItems && (
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={16} 
                      color={isActive ? (isDark ? '#000000' : '#FFFFFF') : colors.textSecondary}
                      style={{ marginLeft: 6 }}
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
        <View style={{ paddingVertical: 10, backgroundColor: colors.background, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
          <Text style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '500' }}>
            {filteredList.length} {filteredList.length === 1 ? 'product' : 'products'} found
          </Text>
        </View>
      )}
      
      {/* Go to Top Button - Positioned in middle under category bar, shows only when scrolled down */}
      {showScrollToTop && (
        <Animated.View style={{ 
          position: 'absolute', 
          top: 160, 
          left: 0, 
          right: 0, 
          alignItems: 'center', 
          zIndex: 49,
          pointerEvents: 'box-none',
          opacity: scrollToTopOpacity,
          transform: [{ scale: scrollToTopScale }],
        }}>
          <TouchableOpacity
            onPress={() => {
              if (flatListRef.current) {
                flatListRef.current.scrollToOffset({ offset: 0, animated: true });
              }
            }}
            activeOpacity={0.8}
            style={{
              backgroundColor: colors.primary,
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.25,
              shadowRadius: 5,
              elevation: 6,
              borderWidth: 2,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.3)',
            }}
          >
            <Ionicons name="arrow-up" size={18} color={isDark ? '#000000' : '#FFFFFF'} />
          </TouchableOpacity>
        </Animated.View>
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
                backgroundColor: colors.card,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                shadowColor: colors.shadow,
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
                  borderBottomColor: colors.borderLight,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>
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
                    borderBottomColor: colors.borderLight,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 14, color: colors.text }}>{subItem.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        );
      })()}
      
      {/* Products FlatList */}
      <FlatList
        ref={flatListRef}
        key={`${categoryType}-${activeGender}-${activeCategory}-${displayedProducts.length}`}
        data={displayedProducts}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        numColumns={2}
        contentContainerStyle={{ 
          paddingHorizontal: 16, 
          paddingTop: 16, 
          paddingBottom: 120, 
          backgroundColor: colors.background,
          flexGrow: 1,
        }}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        style={{ flex: 1, backgroundColor: colors.background, zIndex: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={8}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        onScrollBeginDrag={() => expandedCategory && setExpandedCategory(null)}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        extraData={displayedProducts}
        showsVerticalScrollIndicator={false}
      />

      {/* Overlay to close dropdown when clicking outside - with animation */}
      {isDropdownVisible && expandedCategory && (
        <Animated.View
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.overlay || 'rgba(0, 0, 0, 0.3)',
            zIndex: 998,
            opacity: overlayOpacity,
          }}
          pointerEvents="auto"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setExpandedCategory(null)}
            style={{ flex: 1 }}
          />
        </Animated.View>
      )}

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
      <BottomNavBar isVisible={isBottomBarVisible} />
    </View>
  );
};

// Filter Modal Component
const FilterModal = React.memo(({ visible, onClose, filters, onFilterChange, onClearFilters, brands, sizes }) => {
  const { colors, isDark } = useTheme();
  const [localFilters, setLocalFilters] = useState(filters);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    if (visible) {
      // Fast open animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 200, // Reduced from default 300ms
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150, // Fast fade
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Fast close animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 150, // Fast close
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 100, // Very fast fade out
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

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

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  return (
    <Modal 
      visible={visible} 
      animationType="none" 
      transparent
      onRequestClose={onClose}
      hardwareAccelerated={true}
    >
      <TouchableOpacity 
        activeOpacity={1} 
        onPress={onClose}
        style={{ flex: 1 }}
      >
        <Animated.View 
          style={{ 
            flex: 1, 
            backgroundColor: colors.overlay || 'rgba(0, 0, 0, 0.5)', 
            justifyContent: 'flex-end',
            opacity: opacityAnim,
          }}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <Animated.View 
              style={{ 
                backgroundColor: colors.card, 
                borderTopLeftRadius: 20, 
                borderTopRightRadius: 20, 
                maxHeight: '80%',
                transform: [{ translateY }],
              }}
            >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Filters</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
            {/* Sort By */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>Sort By</Text>
              {['default', 'price-low-high', 'price-high-low', 'newest'].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSortBy(option)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: localFilters.sortBy === option ? colors.primary : colors.border,
                    backgroundColor: localFilters.sortBy === option ? colors.primary : colors.backgroundTertiary,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    fontSize: 14,
                    color: localFilters.sortBy === option ? (isDark ? '#000000' : '#FFFFFF') : colors.text,
                    fontWeight: localFilters.sortBy === option ? '600' : '400',
                  }}>
                    {option === 'default' ? 'Price: Low to High' :
                     option === 'price-low-high' ? 'Price: Low to High' :
                     option === 'price-high-low' ? 'Price: High to Low' :
                     'Newest First'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Range */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>Price Range</Text>
              {[
                { label: 'Under ₹1,000', min: 0, max: 1000 },
                { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
                { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
                { label: 'Over ₹10,000', min: 10000, max: Infinity },
              ].map((range) => (
                <TouchableOpacity
                  key={range.label}
                  onPress={() => setPriceRange(localFilters.priceRange?.min === range.min ? null : range)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: localFilters.priceRange?.min === range.min ? colors.primary : colors.border,
                    backgroundColor: localFilters.priceRange?.min === range.min ? colors.primary : colors.backgroundTertiary,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    fontSize: 14,
                    color: localFilters.priceRange?.min === range.min ? (isDark ? '#000000' : '#FFFFFF') : colors.text,
                    fontWeight: localFilters.priceRange?.min === range.min ? '600' : '400',
                  }}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Brands */}
            {brands.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>Brands</Text>
                {brands.map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    onPress={() => toggleBrand(brand)}
                    style={{
                      paddingVertical: 12,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: localFilters.brands.includes(brand) ? colors.primary : colors.border,
                      backgroundColor: localFilters.brands.includes(brand) ? colors.primary : colors.backgroundTertiary,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      fontSize: 14,
                      color: localFilters.brands.includes(brand) ? (isDark ? '#000000' : '#FFFFFF') : colors.text,
                      fontWeight: localFilters.brands.includes(brand) ? '600' : '400',
                    }}>
                      {brand}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>Sizes</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                  {sizes.map((size) => (
                    <TouchableOpacity
                      key={size}
                      onPress={() => toggleSize(size)}
                      style={{
                        width: 60,
                        height: 40,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: localFilters.sizes.includes(size) ? colors.primary : colors.border,
                        backgroundColor: localFilters.sizes.includes(size) ? colors.primary : colors.card,
                        marginRight: 8,
                        marginBottom: 8,
                      }}
                      activeOpacity={0.7}
                    >
                      <Text style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: localFilters.sizes.includes(size) ? (isDark ? '#000000' : '#FFFFFF') : colors.text,
                      }}>
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={{ flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
            <TouchableOpacity onPress={onClearFilters} style={{ flex: 1, paddingVertical: 14, backgroundColor: colors.backgroundTertiary, borderRadius: 8, alignItems: 'center', marginRight: 12 }} activeOpacity={0.7}>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleApply} style={{ flex: 1, paddingVertical: 14, backgroundColor: colors.primary, borderRadius: 8, alignItems: 'center' }} activeOpacity={0.7}>
              <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
});

export default CategoryScreen;
