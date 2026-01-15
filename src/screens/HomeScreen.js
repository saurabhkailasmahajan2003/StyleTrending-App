/**
 * Home Screen - React Native Version
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { productAPI, searchAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import HomeHeader from '../components/HomeHeader';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/BottomNavBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// --- ICONS (Using Expo Vector Icons) ---
const IconChevronLeft = ({ color = '#1f2937', size = 24 }) => (
  <Ionicons name="chevron-back" size={size} color={color} />
);
const IconChevronRight = ({ color = '#1f2937', size = 24 }) => (
  <Ionicons name="chevron-forward" size={size} color={color} />
);
const IconClose = ({ color = '#fff', size = 24 }) => (
  <Ionicons name="close" size={size} color={color} />
);

// --- API FETCH FUNCTIONS (Preserved exactly as provided) ---
const fetchFreshDrops = async () => {
  try {
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
      productAPI.getMenItems({ limit: 3, category: 'shirt' }),
      productAPI.getMenItems({ limit: 3, category: 'tshirt' }),
      productAPI.getWomenItems({ limit: 3, category: 'tshirt' }),
      productAPI.getMenItems({ limit: 3, category: 'trousers' }),
      productAPI.getWomenItems({ limit: 3, category: 'jeans' }),
      productAPI.getAccessories({ limit: 3 }),
      productAPI.getWatches({ limit: 3 }),
      productAPI.getLenses({ limit: 3 })
    ]);
    
    let allProducts = [];
    
    // Add products from different categories for variety
    if (menShirts?.success && menShirts.data?.products) {
      allProducts = [...allProducts, ...menShirts.data.products.slice(0, 2)];
    }
    
    if (menTshirts?.success && menTshirts.data?.products) {
      allProducts = [...allProducts, ...menTshirts.data.products.slice(0, 2)];
    }
    
    if (womenTshirts?.success && womenTshirts.data?.products) {
      allProducts = [...allProducts, ...womenTshirts.data.products.slice(0, 2)];
    }
    
    if (menTrousers?.success && menTrousers.data?.products) {
      allProducts = [...allProducts, ...menTrousers.data.products.slice(0, 2)];
    }
    
    if (womenJeans?.success && womenJeans.data?.products) {
      allProducts = [...allProducts, ...womenJeans.data.products.slice(0, 2)];
    }
    
    if (accessories?.success && accessories.data?.products) {
      allProducts = [...allProducts, ...accessories.data.products.slice(0, 2)];
    }
    
    if (watches?.success && watches.data?.products) {
      allProducts = [...allProducts, ...watches.data.products.slice(0, 2)];
    }
    
    if (lenses?.success && lenses.data?.products) {
      allProducts = [...allProducts, ...lenses.data.products.slice(0, 2)];
    }
    
    // Remove duplicate products based on product ID
    const uniqueProductsMap = new Map();
    allProducts.forEach(product => {
      if (product) {
        const productId = product._id || product.id;
        if (productId && !uniqueProductsMap.has(productId)) {
          uniqueProductsMap.set(productId, product);
        }
      }
    });
    const uniqueProducts = Array.from(uniqueProductsMap.values());
    
    // Filter out sarees from all products
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
    
    // Shuffle products to show different order each time
    const shuffled = filteredProducts.sort(() => Math.random() - 0.5);
    
    // Return first 4 products for display
    return shuffled.slice(0, 4);
  } catch (error) {
    console.error("Error fetching fresh drops:", error);
    return [];
  }
};

const fetchSaleItems = async () => {
  const res = await productAPI.getAllProducts({ limit: 30, onSale: true, sort: 'discountPercent', order: 'desc' });
  return res?.success ? res.data.products : [];
};

const fetchMen = async () => {
  try {
    const res = await productAPI.getMenItems({ limit: 4, category: 'shirt' });
    console.log('fetchMen API response:', res);
    if (res?.success && res.data?.products) {
      console.log('fetchMen - Products found:', res.data.products.length);
      return res.data.products.slice(0, 4);
    }
    console.log('fetchMen - No products found or API error');
    return [];
  } catch (error) {
    console.error('fetchMen error:', error);
    return [];
  }
};

const fetchWomen = async () => {
  try {
    // Try to fetch t-shirts specifically first
    let res = await productAPI.getWomenItems({ limit: 20, subCategory: 'tshirt' });
    
    // If no results with subCategory filter, try with category filter
    if (!res?.success || !res.data?.products || res.data.products.length === 0) {
      res = await productAPI.getWomenItems({ limit: 20, category: 'tshirt' });
    }
    
    // If still no results, fetch all and filter
    if (!res?.success || !res.data?.products || res.data.products.length === 0) {
      res = await productAPI.getWomenItems({ limit: 50 });
    }
    
    console.log('🔍 fetchWomen API response:', res);
    console.log('🔍 fetchWomen - Response structure:', {
      hasSuccess: !!res?.success,
      hasData: !!res?.data,
      hasProducts: !!res?.data?.products,
      productsLength: res?.data?.products?.length || 0,
      firstProduct: res?.data?.products?.[0]
    });
    
    if (res?.success && res.data?.products && Array.isArray(res.data.products)) {
      console.log('✅ fetchWomen - Products found:', res.data.products.length);
      console.log('📦 fetchWomen - Sample products:', res.data.products.slice(0, 3).map(p => ({
        name: p.name,
        category: p.category,
        subCategory: p.subCategory,
        _id: p._id
      })));
      
      // Filter to show ONLY t-shirts (exclude sarees, shoes, and other items)
      let filtered = res.data.products.filter(product => {
        if (!product) return false;
        
        const subCategory = (product.subCategory || '').toLowerCase().trim();
        const category = (product.category || '').toLowerCase().trim();
        const name = (product.name || '').toLowerCase().trim();
        
        // Check if it's a t-shirt
        const isTshirt = subCategory.includes('tshirt') || subCategory.includes('t-shirt') || 
                        subCategory.includes('tee') ||
                        category.includes('tshirt') || category.includes('t-shirt') ||
                        category.includes('tee') ||
                        /\btshirt\b/.test(name) || /\bt-shirt\b/.test(name) || 
                        /\btee\b/.test(name) || /\btees\b/.test(name);
        
        // Exclude sarees and shoes
        const isSaree = subCategory === 'saree' || subCategory === 'sari' || 
                       category === 'saree' || category === 'sari' ||
                       /\bsaree\b/.test(name) || /\bsari\b/.test(name);
        const isShoe = subCategory === 'shoe' || subCategory === 'shoes' || 
                      category === 'shoe' || category === 'shoes' ||
                      /\bshoe\b/.test(name) || /\bshoes\b/.test(name);
        
        const shouldInclude = isTshirt && !isSaree && !isShoe;
        
        if (!shouldInclude) {
          console.log('🚫 Filtered out product:', product.name, { 
            subCategory, 
            category, 
            name, 
            isTshirt,
            isSaree, 
            isShoe 
          });
        } else {
          console.log('✅ Including t-shirt:', product.name);
        }
        
        return shouldInclude;
      });
      
      // If no t-shirts found, return empty array (don't show other products)
      if (filtered.length === 0) {
        console.log('⚠️ No women t-shirts found');
        return [];
      }
      
      console.log('✅ fetchWomen - After filtering for t-shirts:', filtered.length, 'products');
      if (filtered.length > 0) {
        console.log('📦 fetchWomen - Final t-shirts to display:', filtered.slice(0, 4).map(p => ({
          name: p.name,
          category: p.category,
          subCategory: p.subCategory
        })));
      }
      
      return filtered.slice(0, 4);
    }
    console.log('❌ fetchWomen - No products found or API error');
    return [];
  } catch (error) {
    console.error('❌ fetchWomen error:', error);
    console.error('❌ fetchWomen error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response
    });
    return [];
  }
};

const fetchWatches = async () => {
  const res = await productAPI.getWatches({ limit: 4 });
  return res?.success ? res.data.products.slice(0, 4) : [];
};

const fetchAccessories = async () => {
  try {
    console.log('🔍 fetchAccessories - Starting fetch...');
    const [lenses, acc] = await Promise.all([
      productAPI.getLenses({ limit: 8 }),
      productAPI.getAccessories({ limit: 8 })
    ]);
    
    console.log('🔍 fetchAccessories - Lenses response:', {
      success: lenses?.success,
      count: lenses?.data?.products?.length || 0
    });
    console.log('🔍 fetchAccessories - Accessories response:', {
      success: acc?.success,
      count: acc?.data?.products?.length || 0
    });
    
    let combined = [];
    if (lenses?.success && lenses.data?.products) {
      combined = [...combined, ...lenses.data.products];
      console.log('✅ Added lenses:', lenses.data.products.length);
    }
    if (acc?.success && acc.data?.products) {
      combined = [...combined, ...acc.data.products];
      console.log('✅ Added accessories:', acc.data.products.length);
    }
    
    console.log('✅ fetchAccessories - Total combined:', combined.length);
    return combined.slice(0, 8);
  } catch (error) {
    console.error("❌ Error fetching accessories:", error);
    return [];
  }
};

// --- NEWS TICKER COMPONENT (Converted to Animated.View) ---
const NewsTicker = () => {
  const { colors, isDark } = useTheme();
  const marqueeContent = "FREE SHIPPING ON ALL ORDERS OVER ₹1,000   •   NEW SEASON STYLES ADDED DAILY   •   LIMITED TIME DISCOUNTS ON WATCHES   •   JOIN OUR LOYALTY PROGRAM   •   ";
  const translateX = useRef(new Animated.Value(0)).current;
  // Calculate approximate content width (text width is dynamic, so we estimate)
  const estimatedContentWidth = SCREEN_WIDTH * 1.5; // Adjust based on actual content length

  useEffect(() => {
    const animate = () => {
      translateX.setValue(0);
      Animated.loop(
        Animated.timing(translateX, {
          toValue: -estimatedContentWidth, 
          duration: 20000,
          useNativeDriver: true,
        })
      ).start();
    };
    animate();
  }, [estimatedContentWidth, translateX]);

  return (
    <View style={{ backgroundColor: colors.primary, paddingVertical: 12, overflow: 'hidden' }}>
      <Animated.View
        style={{ 
          flexDirection: 'row',
          transform: [{ translateX }] 
        }}
      >
        {/* Render content twice for seamless infinite scroll */}
        <Text 
          style={{ 
            color: isDark ? colors.primary : '#FFFFFF', 
            fontSize: 12, 
            fontWeight: '500', 
            letterSpacing: 1, 
            textTransform: 'uppercase',
            flexShrink: 0, 
            marginRight: 50 
          }}
          numberOfLines={1}
        >
          {marqueeContent}
        </Text>
        <Text 
          style={{ 
            color: isDark ? colors.primary : '#FFFFFF', 
            fontSize: 12, 
            fontWeight: '500', 
            letterSpacing: 1, 
            textTransform: 'uppercase',
            flexShrink: 0 
          }}
          numberOfLines={1}
        >
          {marqueeContent}
        </Text>
      </Animated.View>
    </View>
  );
};

// --- SKELETON COMPONENT ---
const SkeletonCard = () => (
  <View className="w-[48%] mb-4">
    <View className="bg-gray-200 rounded-xl h-64 w-full animate-pulse" />
  </View>
);

// --- PRODUCT SECTION COMPONENT ---
const ProductSection = ({ title, subtitle, products, viewAllLink, bgColor = 'bg-white', isLoading, navigation }) => {
  const { colors, isDark } = useTheme();
  const handleViewAll = () => {
    if (title === 'On Sale') {
      navigation.navigate('Sale');
    } else if (title === 'Fresh Drops') {
      navigation.navigate('FreshDrops');
    } else if (viewAllLink) {
      navigation.navigate('Category', { category: viewAllLink.replace('/', '') });
    }
  };

  const backgroundColor = bgColor === 'bg-white' ? colors.card : colors.backgroundSecondary;

  return (
    <View style={{ paddingVertical: 24, paddingHorizontal: 16, backgroundColor }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{title}</Text>
          {subtitle && <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{subtitle}</Text>}
        </View>
        {(viewAllLink || title === 'On Sale' || title === 'Fresh Drops') && (
          <TouchableOpacity
            onPress={handleViewAll}
            style={{ backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginLeft: 12, borderWidth: 1, borderColor: colors.border }}
            activeOpacity={0.8}
          >
            <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 12, fontWeight: '700' }}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {isLoading ? (
          [1, 2, 3, 4].map(i => (
            <View key={`${title}-skeleton-${i}`} style={{ width: '48%', marginBottom: 16 }}>
              <View style={{ backgroundColor: colors.backgroundTertiary, borderRadius: 12, aspectRatio: 0.75 }} />
              <View style={{ paddingHorizontal: 12, paddingVertical: 12 }}>
                <View style={{ height: 16, backgroundColor: colors.backgroundTertiary, borderRadius: 4, marginBottom: 8 }} />
                <View style={{ height: 12, backgroundColor: colors.backgroundTertiary, borderRadius: 4, width: 80 }} />
              </View>
            </View>
          ))
        ) : (
          products && products.length > 0 ? (
            products.slice(0, 4).map((product, index) => (
              <ProductCard key={`${title}-${product._id || product.id || index}`} product={product} />
            ))
          ) : (
            <View style={{ width: '100%', paddingVertical: 40, alignItems: 'center' }}>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>No products found.</Text>
            </View>
          )
        )}
      </View>
    </View>
  );
};

// --- MAIN HOME SCREEN ---
const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const scrollViewRef = useRef(null);

  // --- UI STATE ---
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [heroImageError, setHeroImageError] = useState(false);
  const [bannerImageError, setBannerImageError] = useState(false);

  // --- DATA STATE ---
  const [freshDrops, setFreshDrops] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [menItems, setMenItems] = useState([]);
  const [womenItems, setWomenItems] = useState([]);
  const [watches, setWatches] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [freshDropsData, saleData, menData, womenData, watchesData, accessoriesData] = await Promise.all([
          fetchFreshDrops(), fetchSaleItems(), fetchMen(), fetchWomen(), fetchWatches(), fetchAccessories()
        ]);
        console.log('HomeScreen - Men items:', menData?.length || 0, menData);
        console.log('HomeScreen - Women items:', womenData?.length || 0, womenData);
        
        // Collect all product IDs that are already displayed in other sections
        const displayedProductIds = new Set();
        
        // Add IDs from Fresh Drops
        (freshDropsData || []).forEach(product => {
          const id = product._id || product.id;
          if (id) displayedProductIds.add(id);
        });
        
        // Add IDs from Men items
        (menData || []).forEach(product => {
          const id = product._id || product.id;
          if (id) displayedProductIds.add(id);
        });
        
        // Add IDs from Women items
        (womenData || []).forEach(product => {
          const id = product._id || product.id;
          if (id) displayedProductIds.add(id);
        });
        
        // Add IDs from Watches
        (watchesData || []).forEach(product => {
          const id = product._id || product.id;
          if (id) displayedProductIds.add(id);
        });
        
        // Add IDs from Accessories
        (accessoriesData || []).forEach(product => {
          const id = product._id || product.id;
          if (id) displayedProductIds.add(id);
        });
        
        // Filter sale items to exclude products already displayed
        const filteredSaleItems = (saleData || []).filter(product => {
          const id = product._id || product.id;
          return id && !displayedProductIds.has(id);
        }).slice(0, 4); // Take first 4 unique sale items
        
        setFreshDrops(freshDropsData || []);
        setSaleItems(filteredSaleItems);
        setMenItems(menData || []);
        setWomenItems(womenData || []);
        setWatches(watchesData || []);
        setAccessories(accessoriesData || []);
      } catch (error) {
        console.error("Error loading home page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);

  // Handle scroll to top when tab is pressed
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.scrollToTop && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
        // Clear the param to prevent scrolling on every focus
        navigation.setParams({ scrollToTop: undefined });
      }
    }, [route.params?.scrollToTop, navigation])
  );

  const stories = [
    { hashtag: 'Xmas', icon: 'snow', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741928/IMG_20251123_161820_skzchs.png' },
    { hashtag: 'Desi', icon: 'sunny', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741995/image-104_iuyyuw.png' },
    { hashtag: 'Street', icon: 'flame', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742092/ZfLAMkmNsf2sHkoW_DELHI-FACES-1_fjnvcb.avif' },
    { hashtag: 'FitCheck', icon: 'star', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742199/0d37737c8c2c7536422e411fb68eeeb3_ylhf3n.jpg' },
    { hashtag: 'Tees', icon: 'shirt', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742259/0424-TSHIRT-06_1_7c30d8ed-155d-47a6-a52f-52858221a302_fjdfpo.webp' },
    { hashtag: 'Denim', icon: 'shirt-outline', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742467/GettyImages-2175843730_q21gse.jpg' },
    { hashtag: 'Scarf', icon: 'color-palette', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742548/NECK_20SCARF_20TREND_20190625_20GettyImages-1490484490_ccdwdy.webp' }
  ];


  // Categories for sticky bar
  const categories = [
    { id: 'men', label: 'Men', icon: 'man-outline' },
    { id: 'women', label: 'Women', icon: 'woman-outline' },
    { id: 'watches', label: 'Watches', icon: 'watch-outline' },
    { id: 'accessories', label: 'Accessories', icon: 'bag-outline' },
    { id: 'lenses', label: 'Eyewear', icon: 'glasses-outline' },
    { id: 'sale', label: 'Sale', icon: 'pricetag-outline' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <SafeAreaView style={{ backgroundColor: colors.background }} edges={['top']}>
        <HomeHeader />
      </SafeAreaView>
      
      {/* --- STICKY CATEGORIES BAR --- */}
      <View style={{ backgroundColor: colors.background, zIndex: 10 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => {
                if (category.id === 'sale') {
                  navigation.navigate('Sale');
                } else {
                  navigation.navigate('Category', { category: category.id });
                }
              }}
              style={{
                marginRight: 12,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: colors.backgroundTertiary,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              activeOpacity={0.7}
            >
              <Ionicons name={category.icon} size={16} color={colors.text} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* --- SEARCH BAR --- */}
        <View style={{ backgroundColor: colors.background, paddingHorizontal: 16, paddingVertical: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundTertiary, borderRadius: 8, paddingHorizontal: 12, height: 40 }}>
            <Ionicons name="search" size={18} color={colors.textSecondary} />
            <TextInput
              style={{ marginLeft: 8, color: colors.text, fontSize: 14, flex: 1, height: 40, paddingVertical: 0 }}
              placeholder="Search for products..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={{ marginLeft: 8 }}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* --- SEARCH RESULTS --- */}
        {searchQuery.trim().length > 0 ? (
          <View style={{ backgroundColor: colors.background, paddingHorizontal: 16, paddingVertical: 16 }}>
            {isSearching ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 12, fontSize: 14, color: colors.textSecondary }}>Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <>
                <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 16 }}>
                  Search Results ({searchResults.length})
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {searchResults.slice(0, 8).map((product, index) => (
                    <View key={`search-${product._id || product.id || index}`} style={{ width: '48%', marginBottom: 16 }}>
                      <ProductCard product={product} />
                    </View>
                  ))}
                </View>
                {searchResults.length > 8 ? (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Search', { query: searchQuery })}
                    style={{ marginTop: 16, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 8, alignItems: 'center' }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: isDark ? colors.primary : '#FFFFFF', fontWeight: '600' }}>View All {searchResults.length} Results</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            ) : (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Ionicons name="search-outline" size={48} color={colors.textTertiary} />
                <Text style={{ marginTop: 16, fontSize: 16, fontWeight: '600', color: colors.text }}>No products found</Text>
                <Text style={{ marginTop: 8, fontSize: 14, color: colors.textSecondary, textAlign: 'center' }}>
                  Try searching with different keywords
                </Text>
              </View>
            )}
          </View>
        ) : null}
        
         {/* --- HERO SECTION --- */}
         {searchQuery.trim().length === 0 ? (
           <>
         <View style={{ backgroundColor: colors.background }}>
            <TouchableOpacity 
               activeOpacity={0.9}
               onPress={() => navigation.navigate('Category', { category: 'watches' })}
               style={{ width: '100%' }}
             >
               {!heroImageError ? (
                 <Image
                   source={{ uri: 'https://res.cloudinary.com/de1bg8ivx/image/upload/f_png/v1765137539/Black_Elegant_Watch_Special_Offer_Instagram_Post_1_xjcbva.svg' }}
                   style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH}}
                   resizeMode="cover"
                   onError={() => {
                     console.log('Hero image failed to load, trying fallback...');
                     setHeroImageError(true);
                   }}
                 />
               ) : (
                 <Image
                   source={{ uri: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1765186209/83d30f87-eb70-4315-8291-e1880c206991.png' }}
                   style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH * 0.5 }}
                   resizeMode="cover"
                   onError={() => {
                     console.log('Fallback hero image also failed');
                   }}
                 />
               )}
            </TouchableOpacity>
        </View>

       

        {/* --- STORIES SECTION --- */}
        <View style={{ paddingTop: 30, paddingBottom: 24, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.borderLight, paddingHorizontal: 16 }}>
          <Text style={{ textAlign: 'center', fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2, color: colors.textSecondary, marginBottom: 16 }}>
            Stories By StyleTrending
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 0 }}>
            {stories.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => { setActiveStoryIndex(index); setIsStoryViewerOpen(true); }}
                style={{ alignItems: 'center', marginRight: 20 }}
                activeOpacity={0.7}
              >
                <View style={{ padding: 2, borderRadius: 9999, borderWidth: 2, borderColor: '#EC4899', marginBottom: 4 }}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 64, height: 64, borderRadius: 9999, borderWidth: 2, borderColor: colors.card }}
                  />
                </View>
                <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>#{item.hashtag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- BROWSE BY CATEGORY --- */}
        <View style={{ paddingVertical: 40, backgroundColor: colors.backgroundSecondary, paddingHorizontal: 16 }}>
           <View style={{ marginBottom: 32, alignItems: 'center' }}>
             <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>Curated Collections</Text>
             <Text style={{ fontSize: 30, fontWeight: '800', color: colors.text, marginBottom: 4 }}>Shop By Category</Text>
             <View style={{ width: 64, height: 4, backgroundColor: '#F59E0B', borderRadius: 9999 }} />
           </View>
           
           <View className="flex-row flex-wrap justify-between gap-3">
             {[
               { id: 'men', label: 'MEN', desc: 'Sharp tailoring', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1765192028/1_08426779-951c-47b7-9feb-ef29ca85b27c_frapuz.webp' },
               { id: 'women', label: 'WOMEN', desc: 'Modern silhouettes', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1765191722/c037121844264e7d40ffc2bb11335a21_vadndt.jpg' },
               { id: 'watches', label: 'WATCHES', desc: 'Precision crafted', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1765191651/photo-1524592094714-0f0654e20314_dv6fdz.avif' },
               { id: 'accessories', label: 'ACCESSORIES', desc: 'Final touches', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1765191618/photo-1515562141207-7a88fb7ce338_k4onlv.avif' }
             ].map((cat) => (
                <TouchableOpacity 
                  key={cat.id}
                  onPress={() => navigation.navigate('Category', { category: cat.id })}
                  className="w-[48%] h-44 rounded-2xl overflow-hidden relative"
                  activeOpacity={0.85}
                  style={{
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  }}
                >
                  <Image 
                    source={{ uri: cat.image }} 
                    className="w-full h-full" 
                    resizeMode="cover"
                  />
                  {/* Gradient Overlay - Darker at bottom for better text readability */}
                  <View className="absolute inset-0">
                    <View 
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        height: '70%',
                        backgroundColor: 'rgba(0, 0, 0, 0.55)',
                      }}
                    />
                    <View 
                      className="absolute bottom-0 left-0 right-0"
                      style={{
                        height: '40%',
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      }}
                    />
                  </View>
                  
                  {/* Content */}
                  <View className="absolute bottom-0 left-0 right-0 p-4">
                    <Text className="text-white text-lg font-extrabold tracking-wider mb-1" style={{ textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}>
                      {cat.label}
                    </Text>
                    <Text className="text-white text-xs font-medium mb-3" style={{ textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 }}>
                      {cat.desc}
                    </Text>
                    {/* Shop Now Button */}
                    <View className="flex-row items-center">
                      <View className="bg-white/25 px-3 py-1.5 rounded-full flex-row items-center border border-white/30">
                        <Text className="text-white text-[10px] font-bold mr-1.5">SHOP NOW</Text>
                        <Ionicons name="arrow-forward" size={12} color="#fff" />
                      </View>
                    </View>
                  </View>
                  
                  {/* Decorative corner accent */}
                  <View className="absolute top-3 right-3 w-10 h-10 bg-white/20 rounded-full items-center justify-center border border-white/30">
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </View>
                </TouchableOpacity>
             ))}
           </View>
        </View>

         {/* --- PROMO BANNER 1 --- */}
         

         {/* --- FRESH DROPS --- */}
         <ProductSection
           title="Fresh Drops"
           subtitle="Be the first to wear the trend"
           products={freshDrops.slice(0, 4)}
           isLoading={isLoading}
           navigation={navigation}
         />

         {/* --- SALE ITEMS --- */}
         <ProductSection
           title="On Sale"
           subtitle="Limited time offers"
           products={saleItems.slice(0, 4)}
           isLoading={isLoading}
           navigation={navigation}
         />

         {/* --- BLACK FRIDAY BANNER --- */}
         <View style={{ paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.background }}>
           <TouchableOpacity 
             activeOpacity={0.8}
             onPress={() => {
               console.log('Banner clicked - navigating to Sale');
               navigation.navigate('Sale');
             }}
             style={{ width: '100%', borderRadius: 12, overflow: 'hidden', backgroundColor: colors.card }}
           >
             {!bannerImageError ? (
               <Image
                 source={{ uri: 'https://res.cloudinary.com/dvkxgrcbv/image/upload/f_auto,q_auto,w_800/v1768385932/Red_and_Black_Modern_Black_Friday_Sale_Instagram_Post_1080_x_1080_px_itx0dc.svg' }}
                 style={{ width: '100%', height: SCREEN_WIDTH * 0.8, borderRadius: 12 }}
                 resizeMode="cover"
                 pointerEvents="none"
                 onError={(error) => {
                   console.log('Banner image error:', error);
                   setBannerImageError(true);
                 }}
                 onLoad={() => {
                   console.log('Banner image loaded successfully');
                 }}
               />
             ) : (
               <View style={{ width: '100%', height: SCREEN_WIDTH * 0.8, backgroundColor: '#DC2626', borderRadius: 12, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                 <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>BLACK FRIDAY SALE</Text>
                 <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>Limited Time Offers</Text>
               </View>
             )}
           </TouchableOpacity>
         </View>

         {/* --- WATCHES --- */}
         <ProductSection
           title="Watches"
           subtitle="Timepieces collection"
           products={watches.slice(0, 4)}
           viewAllLink="watches"
           isLoading={isLoading}
           navigation={navigation}
         />

         {/* --- ACCESSORIES --- */}
         <ProductSection
           title="Accessories"
           subtitle="Complete your look with style"
           products={accessories.slice(0, 4)}
           viewAllLink="accessories"
           isLoading={isLoading}
           navigation={navigation}
           bgColor="bg-white"
         />

        {/* --- MEN & WOMEN GRID --- */}
        <View style={{ paddingVertical: 32, backgroundColor: colors.backgroundSecondary, paddingHorizontal: 16 }}>
          <View style={{ marginBottom: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 }}>Shop By Gender</Text>
            <View style={{ width: 48, height: 4, backgroundColor: colors.primary, borderRadius: 9999 }} />
          </View>
          
          {/* For Him Section */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 }}>
              <View>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>For Him</Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>Sharp tailoring & modern fits</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Category', { category: 'men' })}
                style={{ flexDirection: 'row', alignItems: 'center' }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginRight: 4 }}>View All</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {isLoading ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {[1, 2, 3, 4].map(i => (
                  <View key={`men-skeleton-${i}`} style={{ width: '48%', marginBottom: 16 }}>
                    <View style={{ backgroundColor: colors.backgroundTertiary, borderRadius: 12, aspectRatio: 0.75 }} />
                    <View style={{ paddingHorizontal: 8, paddingVertical: 12 }}>
                      <View style={{ height: 16, backgroundColor: colors.backgroundTertiary, borderRadius: 4, marginBottom: 8 }} />
                      <View style={{ height: 12, backgroundColor: colors.backgroundTertiary, borderRadius: 4, width: 80 }} />
                    </View>
                  </View>
                ))}
              </View>
            ) : menItems && menItems.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {menItems.slice(0, 4).map((p, i) => (
                  <ProductCard
                    key={`men-${p._id || p.id || `item-${i}`}`}
                    product={p}
                  />
                ))}
              </View>
            ) : (
              <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                <View style={{ width: 64, height: 64, backgroundColor: colors.backgroundTertiary, borderRadius: 9999, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Ionicons name="shirt-outline" size={32} color={colors.textTertiary} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 }}>No products</Text>
                <Text style={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center' }}>Check back soon</Text>
              </View>
            )}
          </View>

          {/* For Her Section */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 }}>
              <View>
                <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text }}>For Her</Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>Modern silhouettes & elegant styles</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Category', { category: 'women' })}
                style={{ flexDirection: 'row', alignItems: 'center' }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginRight: 4 }}>View All</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            {isLoading ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {[1, 2, 3, 4].map(i => (
                  <View key={`women-skeleton-${i}`} style={{ width: '48%', marginBottom: 16 }}>
                    <View style={{ backgroundColor: colors.backgroundTertiary, borderRadius: 12, aspectRatio: 0.75 }} />
                    <View style={{ paddingHorizontal: 8, paddingVertical: 12 }}>
                      <View style={{ height: 16, backgroundColor: colors.backgroundTertiary, borderRadius: 4, marginBottom: 8 }} />
                      <View style={{ height: 12, backgroundColor: colors.backgroundTertiary, borderRadius: 4, width: 80 }} />
                    </View>
                  </View>
                ))}
              </View>
            ) : womenItems && womenItems.length > 0 ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {womenItems.slice(0, 4).map((p, i) => (
                  <ProductCard
                    key={`women-${p._id || p.id || `item-${i}`}`}
                    product={p}
                  />
                ))}
              </View>
            ) : (
              <View style={{ backgroundColor: colors.card, borderRadius: 12, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                <View style={{ width: 64, height: 64, backgroundColor: colors.backgroundTertiary, borderRadius: 9999, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Ionicons name="shirt-outline" size={32} color={colors.textTertiary} />
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary, marginBottom: 4 }}>No products</Text>
                <Text style={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center' }}>Check back soon</Text>
              </View>
            )}
          </View>
        </View>

        {/* --- FEATURED COLLECTIONS --- */}
        <View style={{ paddingBottom: 48, paddingHorizontal: 16 }}>
           <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text }}>Featured Collections</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Essential styles for him and her.</Text>
           </View>
           <View style={{ flexDirection: 'column', gap: 16 }}>
              <TouchableOpacity onPress={() => navigation.navigate('Category', { category: 'women', subcategory: 'shirt' })} activeOpacity={0.9}>
                 <Image 
                    source={{ uri: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1763492921/Black_and_White_Modern_New_Arrivals_Blog_Banner_4_x9v1lw.png' }}
                    style={{ width: '100%', height: 192, borderRadius: 12 }}
                    resizeMode="cover"
                 />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Category', { category: 'men', subcategory: 'shirt' })} activeOpacity={0.9}>
                 <Image 
                    source={{ uri: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1763493394/5ad7474b-2e60-47c5-b993-cdc9c1449c08.png' }}
                    style={{ width: '100%', height: 192, borderRadius: 12 }}
                    resizeMode="cover"
                 />
              </TouchableOpacity>
           </View>
        </View>

        {/* --- STORY VIEWER MODAL --- */}
        <Modal
          visible={isStoryViewerOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsStoryViewerOpen(false)}
        >
          <View className="flex-1 bg-black/95 justify-center items-center relative">
            <StatusBar hidden />
            
            {/* Close Button */}
            <TouchableOpacity 
              onPress={() => setIsStoryViewerOpen(false)}
              className="absolute top-10 right-6 z-30 p-2 bg-white/20 rounded-full"
            >
              <IconClose />
            </TouchableOpacity>

            {/* Navigation Buttons */}
            {activeStoryIndex > 0 ? (
              <TouchableOpacity 
                onPress={() => setActiveStoryIndex(activeStoryIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 rounded-full"
              >
                <IconChevronLeft />
              </TouchableOpacity>
            ) : null}
            
            {activeStoryIndex !== null && activeStoryIndex < stories.length - 1 ? (
              <TouchableOpacity 
                onPress={() => setActiveStoryIndex(activeStoryIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 rounded-full"
              >
                <IconChevronRight />
              </TouchableOpacity>
            ) : null}

            {/* Content */}
            {activeStoryIndex !== null && (
              <View className="w-full h-full justify-center items-center">
                {/* Progress Bars */}
                <View className="absolute top-12 left-4 right-4 flex-row gap-1 z-20">
                  {stories.map((_, index) => (
                    <View 
                      key={index} 
                      className={`h-1 flex-1 rounded-full ${index <= activeStoryIndex ? 'bg-white' : 'bg-white/30'}`} 
                    />
                  ))}
                </View>

                <Image 
                  source={{ uri: stories[activeStoryIndex].image }}
                  className="w-[90%] h-[80%]"
                  resizeMode="contain"
                />
                
                <View className="absolute bottom-20 bg-black/50 px-6 py-2 rounded-full flex-row items-center gap-2">
                  <Ionicons name={stories[activeStoryIndex].icon} size={20} color="#fff" />
                  <Text className="text-xl font-bold text-white">
                    #{stories[activeStoryIndex].hashtag}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Modal>
        </>
        ) : null}

      </ScrollView>
      <BottomNavBar />
    </View>
  );
};

export default HomeScreen;