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
import { useNavigation } from '@react-navigation/native';
import { productAPI, searchAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import HomeHeader from '../components/HomeHeader';
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
    const [menShoes, womenShoes, accessories, watches, lenses, mensLenses, menItems, womenItems] = await Promise.all([
      productAPI.getMenItems({ limit: 4, category: 'shoes' }),
      productAPI.getWomenItems({ limit: 4, category: 'shoes' }),
      productAPI.getAccessories({ limit: 4 }),
      productAPI.getWatches({ limit: 4 }),
      productAPI.getLenses({ limit: 4 }),
      productAPI.getLenses({ limit: 4, gender: 'men' }),
      productAPI.getMenItems({ limit: 4 }),
      productAPI.getWomenItems({ limit: 4 })
    ]);
    
    let allProducts = [];
    
    // 4 from men shoes
    if (menShoes?.success && menShoes.data?.products) {
      allProducts = [...allProducts, ...menShoes.data.products.slice(0, 4)];
    }
    
    // 4 from women shoes
    if (womenShoes?.success && womenShoes.data?.products) {
      allProducts = [...allProducts, ...womenShoes.data.products.slice(0, 4)];
    }
    
    // 4 from accessories
    if (accessories?.success && accessories.data?.products) {
      allProducts = [...allProducts, ...accessories.data.products.slice(0, 4)];
    }
    
    // 4 from watches
    if (watches?.success && watches.data?.products) {
      allProducts = [...allProducts, ...watches.data.products.slice(0, 4)];
    }
    
    // 4 from lenses
    if (lenses?.success && lenses.data?.products) {
      allProducts = [...allProducts, ...lenses.data.products.slice(0, 4)];
    }
    
    // 4 from men lenses
    if (mensLenses?.success && mensLenses.data?.products) {
      allProducts = [...allProducts, ...mensLenses.data.products.slice(0, 4)];
    }
    
    // 4 from men items
    if (menItems?.success && menItems.data?.products) {
      allProducts = [...allProducts, ...menItems.data.products.slice(0, 4)];
    }
    
    // 4 from women items
    if (womenItems?.success && womenItems.data?.products) {
      allProducts = [...allProducts, ...womenItems.data.products.slice(0, 4)];
    }
    
    // Ensure at least 15 products
    return allProducts.slice(0, Math.max(15, allProducts.length));
  } catch (error) {
    console.error("Error fetching fresh drops:", error);
    return [];
  }
};

const fetchSaleItems = async () => {
  const res = await productAPI.getAllProducts({ limit: 4, onSale: true, sort: 'discountPercent', order: 'desc' });
  return res?.success ? res.data.products.slice(0, 4) : [];
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
    <View className="bg-black py-3 overflow-hidden">
      <Animated.View
        style={{ 
          flexDirection: 'row',
          transform: [{ translateX }] 
        }}
      >
        {/* Render content twice for seamless infinite scroll */}
        <Text 
          className="text-white text-xs font-medium tracking-wider uppercase"
          numberOfLines={1}
          style={{ flexShrink: 0, marginRight: 50 }}
        >
          {marqueeContent}
        </Text>
        <Text 
          className="text-white text-xs font-medium tracking-wider uppercase"
          numberOfLines={1}
          style={{ flexShrink: 0 }}
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
  return (
    <View className={`py-6 px-4 ${bgColor}`} style={{ paddingHorizontal: 16 }}>
      <View className="flex-row justify-between items-center mb-5">
        <View className="flex-1">
          <Text className="text-xl font-bold text-gray-900">{title}</Text>
          {subtitle && <Text className="text-gray-500 text-xs mt-1">{subtitle}</Text>}
        </View>
        {viewAllLink && (
          <TouchableOpacity
            onPress={() => navigation.navigate('Category', { category: viewAllLink.replace('/', '') })}
            className="bg-gray-900 px-4 py-2 rounded-full ml-3"
          >
            <Text className="text-white text-xs font-bold">View All</Text>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-row flex-wrap justify-between">
        {isLoading ? (
          [1, 2, 3, 4].map(i => (
            <View key={i} className="w-[48%] mb-4">
              <View className="bg-gray-200 rounded-xl" style={{ aspectRatio: 0.75 }} />
              <View className="px-3 py-3">
                <View className="h-4 bg-gray-200 rounded mb-2" />
                <View className="h-3 bg-gray-200 rounded w-20" />
              </View>
            </View>
          ))
        ) : (
          products && products.length > 0 ? (
            products.slice(0, 4).map((product, index) => (
              <ProductCard key={product._id || index} product={product} />
            ))
          ) : (
            <View className="w-full py-10 items-center">
              <Text className="text-gray-500 text-sm">No products found.</Text>
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

  // --- UI STATE ---
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [heroImageError, setHeroImageError] = useState(false);

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
        setFreshDrops(freshDropsData || []);
        setSaleItems(saleData || []);
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

  const stories = [
    { hashtag: 'Xmas', icon: 'snow', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741928/IMG_20251123_161820_skzchs.png' },
    { hashtag: 'Desi', icon: 'sunny', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741995/image-104_iuyyuw.png' },
    { hashtag: 'Street', icon: 'flame', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742092/ZfLAMkmNsf2sHkoW_DELHI-FACES-1_fjnvcb.avif' },
    { hashtag: 'FitCheck', icon: 'star', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742199/0d37737c8c2c7536422e411fb68eeeb3_ylhf3n.jpg' },
    { hashtag: 'Tees', icon: 'shirt', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742259/0424-TSHIRT-06_1_7c30d8ed-155d-47a6-a52f-52858221a302_fjdfpo.webp' },
    { hashtag: 'Denim', icon: 'shirt-outline', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742467/GettyImages-2175843730_q21gse.jpg' },
    { hashtag: 'Scarf', icon: 'color-palette', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742548/NECK_20SCARF_20TREND_20190625_20GettyImages-1490484490_ccdwdy.webp' }
  ];


  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      <SafeAreaView className="bg-white" edges={['top']}>
        <HomeHeader />
      </SafeAreaView>
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* --- SEARCH BAR --- */}
        <View className="bg-white px-4 py-2 border-b border-gray-100" style={{ paddingHorizontal: 16 }}>
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3" style={{ height: 40 }}>
            <Ionicons name="search" size={18} color="#6b7280" />
            <TextInput
              className="ml-2 text-gray-900 text-sm flex-1"
              style={{ height: 40, paddingVertical: 0 }}
              placeholder="Search for products..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                className="ml-2"
              >
                <Ionicons name="close-circle" size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* --- SEARCH RESULTS --- */}
        {searchQuery.trim().length > 0 && (
          <View className="bg-white" style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
            {isSearching ? (
              <View className="py-8 items-center">
                <ActivityIndicator size="large" color="#000" />
                <Text className="mt-3 text-sm text-gray-500">Searching...</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <>
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Search Results ({searchResults.length})
                </Text>
                <View className="flex-row flex-wrap justify-between">
                  {searchResults.slice(0, 8).map((product, index) => (
                    <View key={product._id || product.id || index} className="w-[48%] mb-4">
                      <ProductCard product={product} />
                    </View>
                  ))}
                </View>
                {searchResults.length > 8 && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Search', { query: searchQuery })}
                    className="mt-4 py-3 bg-gray-900 rounded-lg items-center"
                  >
                    <Text className="text-white font-semibold">View All {searchResults.length} Results</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <View className="py-8 items-center">
                <Ionicons name="search-outline" size={48} color="#9ca3af" />
                <Text className="mt-4 text-base font-semibold text-gray-900">No products found</Text>
                <Text className="mt-2 text-sm text-gray-500 text-center">
                  Try searching with different keywords
                </Text>
              </View>
            )}
          </View>
        )}
        
         {/* --- HERO SECTION --- */}
         {searchQuery.trim().length === 0 && (
           <>
         <View className="relative w-full bg-gray-100" style={{ width: SCREEN_WIDTH }}>
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

        {/* --- NEWS TICKER --- */}
        <NewsTicker />

        {/* --- STORIES SECTION --- */}
        <View className="py-6 bg-white border-b border-gray-100" style={{ paddingHorizontal: 16 }}>
          <Text className="text-center text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
            Stories By StyleTrending
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 0 }}>
            {stories.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => { setActiveStoryIndex(index); setIsStoryViewerOpen(true); }}
                className="items-center mr-5"
              >
                <View className="p-[2px] rounded-full border-2 border-pink-500 mb-1">
                  <Image
                    source={{ uri: item.image }}
                    className="w-16 h-16 rounded-full border border-white"
                  />
                </View>
                <Text className="text-xs font-semibold text-gray-700">#{item.hashtag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* --- BROWSE BY CATEGORY --- */}
        <View className="py-10 bg-gray-50" style={{ paddingHorizontal: 16 }}>
           <View className="mb-8 items-center">
             <Text className="text-amber-600 text-[11px] font-bold tracking-[3px] uppercase mb-2">Curated Collections</Text>
             <Text className="text-3xl font-extrabold text-gray-900 mb-1">Shop By Category</Text>
             <View className="w-16 h-1 bg-amber-600 rounded-full" />
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
           viewAllLink="men/shoes"
           isLoading={isLoading}
           navigation={navigation}
         />

         {/* --- SALE ITEMS --- */}
         <ProductSection
           title="On Sale"
           subtitle="Limited time offers"
           products={saleItems.slice(0, 4)}
           viewAllLink="sale"
           isLoading={isLoading}
           navigation={navigation}
         />

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
        <View className="py-8 bg-gray-50" style={{ paddingHorizontal: 16 }}>
          <View className="mb-6 items-center">
            <Text className="text-2xl font-extrabold text-gray-900 mb-1">Shop By Gender</Text>
            <View className="w-12 h-1 bg-gray-900 rounded-full" />
          </View>
          
          {/* For Him Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4 px-1">
              <View>
                <Text className="text-2xl font-bold text-gray-900">For Him</Text>
                <Text className="text-sm text-gray-500 mt-0.5">Sharp tailoring & modern fits</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Category', { category: 'men' })}
                className="flex-row items-center"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-semibold text-gray-900 mr-1">View All</Text>
                <Ionicons name="chevron-forward" size={18} color="#111827" />
              </TouchableOpacity>
            </View>
            
            {isLoading ? (
              <View className="flex-row flex-wrap justify-between">
                {[1, 2, 3, 4].map(i => (
                  <View key={`men-skeleton-${i}`} className="w-[48%] mb-4">
                    <View className="bg-gray-200 rounded-xl" style={{ aspectRatio: 0.75 }} />
                    <View className="px-2 py-3">
                      <View className="h-4 bg-gray-200 rounded mb-2" />
                      <View className="h-3 bg-gray-200 rounded w-20" />
                    </View>
                  </View>
                ))}
              </View>
            ) : menItems && menItems.length > 0 ? (
              <View className="flex-row flex-wrap justify-between">
                {menItems.slice(0, 4).map((p, i) => (
                  <ProductCard
                    key={`men-${p._id || p.id || `item-${i}`}`}
                    product={p}
                  />
                ))}
              </View>
            ) : (
              <View className="bg-white rounded-xl p-8 items-center border border-gray-200">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="shirt-outline" size={32} color="#9CA3AF" />
                </View>
                <Text className="text-sm font-semibold text-gray-600 mb-1">No products</Text>
                <Text className="text-xs text-gray-400 text-center">Check back soon</Text>
              </View>
            )}
          </View>

          {/* For Her Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4 px-1">
              <View>
                <Text className="text-2xl font-bold text-gray-900">For Her</Text>
                <Text className="text-sm text-gray-500 mt-0.5">Modern silhouettes & elegant styles</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Category', { category: 'women' })}
                className="flex-row items-center"
                activeOpacity={0.7}
              >
                <Text className="text-sm font-semibold text-gray-900 mr-1">View All</Text>
                <Ionicons name="chevron-forward" size={18} color="#111827" />
              </TouchableOpacity>
            </View>
            
            {isLoading ? (
              <View className="flex-row flex-wrap justify-between">
                {[1, 2, 3, 4].map(i => (
                  <View key={`women-skeleton-${i}`} className="w-[48%] mb-4">
                    <View className="bg-gray-200 rounded-xl" style={{ aspectRatio: 0.75 }} />
                    <View className="px-2 py-3">
                      <View className="h-4 bg-gray-200 rounded mb-2" />
                      <View className="h-3 bg-gray-200 rounded w-20" />
                    </View>
                  </View>
                ))}
              </View>
            ) : womenItems && womenItems.length > 0 ? (
              <View className="flex-row flex-wrap justify-between">
                {womenItems.slice(0, 4).map((p, i) => (
                  <ProductCard
                    key={`women-${p._id || p.id || `item-${i}`}`}
                    product={p}
                  />
                ))}
              </View>
            ) : (
              <View className="bg-white rounded-xl p-8 items-center border border-gray-200">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-3">
                  <Ionicons name="shirt-outline" size={32} color="#9CA3AF" />
                </View>
                <Text className="text-sm font-semibold text-gray-600 mb-1">No products</Text>
                <Text className="text-xs text-gray-400 text-center">Check back soon</Text>
              </View>
            )}
          </View>
        </View>

        {/* --- FEATURED COLLECTIONS --- */}
        <View className="pb-12" style={{ paddingHorizontal: 16 }}>
           <View className="items-center mb-6">
              <Text className="text-2xl font-extrabold text-gray-900">Featured Collections</Text>
              <Text className="text-gray-500">Essential styles for him and her.</Text>
           </View>
           <View className="flex-col gap-4">
              <TouchableOpacity onPress={() => navigation.navigate('Category', { category: 'women', subcategory: 'shirt' })}>
                 <Image 
                    source={{ uri: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1763492921/Black_and_White_Modern_New_Arrivals_Blog_Banner_4_x9v1lw.png' }}
                    className="w-full h-48 rounded-xl"
                    resizeMode="cover"
                 />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Category', { category: 'men', subcategory: 'shirt' })}>
                 <Image 
                    source={{ uri: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1763493394/5ad7474b-2e60-47c5-b993-cdc9c1449c08.png' }}
                    className="w-full h-48 rounded-xl"
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
            {activeStoryIndex > 0 && (
              <TouchableOpacity 
                onPress={() => setActiveStoryIndex(activeStoryIndex - 1)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 rounded-full"
              >
                <IconChevronLeft />
              </TouchableOpacity>
            )}
            
            {activeStoryIndex !== null && activeStoryIndex < stories.length - 1 && (
              <TouchableOpacity 
                onPress={() => setActiveStoryIndex(activeStoryIndex + 1)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/10 rounded-full"
              >
                <IconChevronRight />
              </TouchableOpacity>
            )}

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
        )}

      </ScrollView>
      <BottomNavBar />
    </View>
  );
};

export default HomeScreen;