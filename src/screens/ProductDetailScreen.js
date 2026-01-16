/**
 * Product Detail Screen - React Native version
 * Converted from web ProductDetail.jsx
 * Features: Image carousel, Add to cart, Same API endpoints, Same product schema
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { productAPI, reviewAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import BottomNavBar from '../components/BottomNavBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Compact Product Card for Horizontal Lists
const CompactProductCard = ({ product, navigation }) => {
  const { colors, isDark } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Get product image
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
  
  const defaultImageSrc = productImages.length > 0 ? productImages[0] : 'https://via.placeholder.com/300x400?text=No+Image';
  const finalPrice = product.finalPrice || product.price || product.mrp || 0;
  const originalPrice = product.originalPrice || product.mrp || product.price || 0;
  const hasDiscount = originalPrice > finalPrice && finalPrice > 0;
  const productId = product._id || product.id;

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductDetail', { productId, category: product.category })}
      activeOpacity={0.9}
      style={{ width: 160, marginRight: 12, backgroundColor: colors.card, borderRadius: 12, overflow: 'hidden', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}
    >
      <View style={{ width: '100%', height: 200, backgroundColor: colors.backgroundTertiary, position: 'relative' }}>
        {hasDiscount && (
          <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: colors.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, zIndex: 10 }}>
            <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 10, fontWeight: '700' }}>SALE</Text>
          </View>
        )}
        {!imageLoaded && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        <Image
          source={{ uri: defaultImageSrc }}
          style={{ width: '100%', height: '100%', opacity: imageLoaded ? 1 : 0 }}
          onLoad={() => setImageLoaded(true)}
          resizeMode="cover"
        />
      </View>
      <View style={{ padding: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8, minHeight: 40 }} numberOfLines={2}>
          {product.name || 'Product Name'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
            ₹{(finalPrice || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </Text>
          {hasDiscount && originalPrice > 0 && (
            <Text style={{ fontSize: 12, color: colors.textTertiary, textDecorationLine: 'line-through' }}>
              ₹{(originalPrice || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ProductDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { productId, category } = route.params || {};
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { colors, isDark } = useTheme();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  // Related products
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [loadingSale, setLoadingSale] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewSort, setReviewSort] = useState('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    comment: '',
  });

  // Image carousel ref
  const imageCarouselRef = useRef(null);

  // Fetch product (preserved from web)
  const fetchProduct = async () => {
    setLoading(true);
    try {
      const validCategories = ['men', 'women', 'watches', 'lens', 'accessories'];
      const categoryMap = {
        'watches': 'watches', 'watch': 'watches',
        'lens': 'lens', 'lenses': 'lens',
        'accessories': 'accessories',
        'men': 'men', 'mens': 'men',
        'women': 'women', 'womens': 'women',
        'fashion': 'men',
      };

      let foundData = null;

      if (category && category !== 'undefined') {
        const apiCategory = categoryMap[category] || category;
        try {
          // Use productAPI methods
          let response = null;
          if (apiCategory === 'watches') {
            response = await productAPI.getWatchById(productId);
          } else if (apiCategory === 'lens' || apiCategory === 'lenses') {
            response = await productAPI.getLensById(productId);
          } else if (apiCategory === 'accessories') {
            response = await productAPI.getAccessoryById(productId);
          } else if (apiCategory === 'men') {
            response = await productAPI.getMenItemById(productId);
          } else if (apiCategory === 'women') {
            response = await productAPI.getWomenItemById(productId);
          }
          
          if (response && response.success) {
            foundData = response;
          }
        } catch (err) {
          // Silently continue to fallback - 404s are expected when product doesn't exist in that category
        }
      }

      // Fallback: try all categories
      if (!foundData) {
        for (const cat of validCategories) {
          try {
            let response = null;
            if (cat === 'watches') {
              response = await productAPI.getWatchById(productId);
            } else if (cat === 'lens') {
              response = await productAPI.getLensById(productId);
            } else if (cat === 'accessories') {
              response = await productAPI.getAccessoryById(productId);
            } else if (cat === 'men') {
              response = await productAPI.getMenItemById(productId);
            } else if (cat === 'women') {
              response = await productAPI.getWomenItemById(productId);
            }
            
            if (response && response.success) {
              foundData = response;
              break;
            }
          } catch (e) {
            // Silently continue - 404s are expected when product doesn't exist in that category
          }
        }
      }

      if (foundData) {
        const productData = foundData.data.product;
        setProduct(productData);
        if (productData.sizes?.length > 0) setSelectedSize(productData.sizes[0]);
        if (productData.colors?.length > 0) setSelectedColor(productData.colors[0]);
        
        // Fetch related data
        fetchRecommendedProducts(productData);
        fetchTrendingProducts(productData);
        fetchSaleProducts(productData);
        fetchReviews(productData);
      } else {
        // Product not found - this is expected for invalid/deleted products
        setProduct(null);
      }
    } catch (error) {
      // Only log unexpected errors (not 404s)
      if (error.message && !error.message.includes('404') && !error.message.includes('not found')) {
        console.error('Unexpected error fetching product:', error);
      }
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId, category]);

  // Fetch recommended products (preserved from web)
  const fetchRecommendedProducts = async (currentProduct) => {
    if (!currentProduct) return;

    setLoadingRecommendations(true);
    try {
      const currentProductId = currentProduct._id || currentProduct.id;
      const categoryMap = {
        'watches': 'watches',
        'lens': 'lens',
        'lenses': 'lens',
        'accessories': 'accessories',
        'men': 'men',
        'women': 'women',
      };

      const productCategory = currentProduct.category?.toLowerCase() || category?.toLowerCase();
      const apiCategory = categoryMap[productCategory] || productCategory;

      let relatedProducts = [];

      if (apiCategory === 'men') {
        const response = await productAPI.getMenItems({
          limit: 30,
          subCategory: currentProduct.subCategory
        });
        if (response.success) relatedProducts = response.data.products || [];
      } else if (apiCategory === 'women') {
        const response = await productAPI.getWomenItems({
          limit: 30,
          subCategory: currentProduct.subCategory
        });
        if (response.success) relatedProducts = response.data.products || [];
      } else if (apiCategory === 'watches') {
        const response = await productAPI.getWatches({ limit: 30 });
        if (response.success) relatedProducts = response.data.products || [];
      } else if (apiCategory === 'lens') {
        const response = await productAPI.getLenses({ limit: 30 });
        if (response.success) relatedProducts = response.data.products || [];
      } else if (apiCategory === 'accessories') {
        const response = await productAPI.getAccessories({ limit: 30 });
        if (response.success) relatedProducts = response.data.products || [];
      }

      let filtered = relatedProducts.filter(p => (p._id || p.id) !== currentProductId);

      if (currentProduct.brand) {
        const sameBrand = filtered.filter(p => p.brand === currentProduct.brand);
        const differentBrand = filtered.filter(p => p.brand !== currentProduct.brand);
        filtered = [...sameBrand, ...differentBrand];
      }

      const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      const shuffled = shuffleArray(filtered);
      const selectedProducts = shuffled.slice(0, 10);

      const normalized = selectedProducts.map(p => ({
        ...p,
        id: p._id || p.id,
        images: p.images || [p.image || p.thumbnail],
        image: p.images?.[0] || p.image || p.thumbnail,
        price: p.finalPrice || p.price,
        originalPrice: p.originalPrice || p.mrp || p.price,
      }));

      setRecommendedProducts(normalized);
    } catch (error) {
      console.error('Error fetching recommended products:', error);
      setRecommendedProducts([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Fetch trending products (preserved from web)
  const fetchTrendingProducts = async (currentProduct) => {
    if (!currentProduct) return;

    setLoadingTrending(true);
    try {
      const currentProductId = currentProduct._id || currentProduct.id;
      const productsByCategory = {
        men: [],
        women: [],
        watches: [],
        lenses: [],
        accessories: []
      };

      const fetchPromises = [
        productAPI.getMenItems({ limit: 40 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.men = res.data.products;
          }
        }).catch(err => console.warn('Error fetching men items:', err)),
        productAPI.getWomenItems({ limit: 40 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.women = res.data.products;
          }
        }).catch(err => console.warn('Error fetching women items:', err)),
        productAPI.getWatches({ limit: 30 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.watches = res.data.products;
          }
        }).catch(err => console.warn('Error fetching watches:', err)),
        productAPI.getLenses({ limit: 30 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.lenses = res.data.products;
          }
        }).catch(err => console.warn('Error fetching lenses:', err)),
        productAPI.getAccessories({ limit: 30 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.accessories = res.data.products;
          }
        }).catch(err => console.warn('Error fetching accessories:', err)),
      ];

      await Promise.allSettled(fetchPromises);

      const allProducts = [
        ...productsByCategory.men,
        ...productsByCategory.women,
        ...productsByCategory.watches,
        ...productsByCategory.lenses,
        ...productsByCategory.accessories
      ].filter(p => (p._id || p.id) !== currentProductId);

      const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      const shuffled = shuffleArray(allProducts);
      const randomProducts = shuffled.slice(0, 12);

      const normalized = randomProducts.map(p => ({
        ...p,
        id: p._id || p.id,
        images: p.images || [p.image || p.thumbnail],
        image: p.images?.[0] || p.image || p.thumbnail,
        price: p.finalPrice || p.price,
        originalPrice: p.originalPrice || p.mrp || p.price,
      }));

      setTrendingProducts(normalized);
    } catch (error) {
      console.error('Error fetching trending products:', error);
      setTrendingProducts([]);
    } finally {
      setLoadingTrending(false);
    }
  };

  // Fetch sale products (preserved from web)
  const fetchSaleProducts = async (currentProduct) => {
    if (!currentProduct) return;

    setLoadingSale(true);
    try {
      const currentProductId = currentProduct._id || currentProduct.id;
      const productsByCategory = {
        men: [],
        women: [],
        watches: [],
        lenses: [],
        accessories: []
      };

      const fetchPromises = [
        productAPI.getMenItems({ limit: 50 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.men = res.data.products;
          }
        }).catch(err => console.warn('Error fetching men items:', err)),
        productAPI.getWomenItems({ limit: 50 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.women = res.data.products;
          }
        }).catch(err => console.warn('Error fetching women items:', err)),
        productAPI.getWatches({ limit: 40 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.watches = res.data.products;
          }
        }).catch(err => console.warn('Error fetching watches:', err)),
        productAPI.getLenses({ limit: 40 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.lenses = res.data.products;
          }
        }).catch(err => console.warn('Error fetching lenses:', err)),
        productAPI.getAccessories({ limit: 40 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.accessories = res.data.products;
          }
        }).catch(err => console.warn('Error fetching accessories:', err)),
      ];

      await Promise.allSettled(fetchPromises);

      const allProducts = [
        ...productsByCategory.men,
        ...productsByCategory.women,
        ...productsByCategory.watches,
        ...productsByCategory.lenses,
        ...productsByCategory.accessories
      ];

      const saleItems = allProducts.filter(p => {
        const productId = p._id || p.id;
        if (productId === currentProductId) return false;

        const finalPrice = p.finalPrice || p.price;
        const originalPrice = p.originalPrice || p.mrp || p.price;
        const hasDiscount = originalPrice > finalPrice;
        const discountPercent = p.discountPercent || (hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0);

        return p.onSale === true || hasDiscount || discountPercent > 0;
      });

      const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      const shuffled = shuffleArray(saleItems);
      const selectedSaleProducts = shuffled.slice(0, 12);

      const normalized = selectedSaleProducts.map(p => ({
        ...p,
        id: p._id || p.id,
        images: p.images || [p.image || p.thumbnail],
        image: p.images?.[0] || p.image || p.thumbnail,
        price: p.finalPrice || p.price,
        originalPrice: p.originalPrice || p.mrp || p.price,
      }));

      setSaleProducts(normalized);
    } catch (error) {
      console.error('Error fetching sale products:', error);
      setSaleProducts([]);
    } finally {
      setLoadingSale(false);
    }
  };

  // Fetch reviews (preserved from web)
  const fetchReviews = async (currentProduct) => {
    if (!currentProduct) return;

    setLoadingReviews(true);
    try {
      const productId = String(currentProduct._id || currentProduct.id);
      const response = await reviewAPI.getReviews(productId, reviewSort, 50);

      if (response.success) {
        setReviews(response.data.reviews || []);
        setReviewStats(response.data.statistics || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      setReviewStats(null);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (product) {
      fetchReviews(product);
    }
  }, [reviewSort, product]);

  // Handle add to cart (preserved from web)
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    try {
      await addToCart(product, 1, selectedSize, selectedColor);
      Alert.alert('Success', 'Product added to cart');
    } catch (error) {
      if (error.message.includes('login')) {
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', error.message || 'Failed to add to cart');
      }
    }
  };

  // Handle buy now (preserved from web)
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    try {
      await addToCart(product, 1, selectedSize, selectedColor);
      navigation.navigate('Cart');
    } catch (error) {
      if (error.message.includes('login')) {
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', error.message || 'Failed to add to cart');
      }
    }
  };

  // Image carousel handlers
  const handlePrevImage = () => {
    const productImages = product.images || [product.image || product.thumbnail];
    const newIndex = selectedImageIndex === 0 ? productImages.length - 1 : selectedImageIndex - 1;
    setSelectedImageIndex(newIndex);
    if (imageCarouselRef.current) {
      imageCarouselRef.current.scrollTo({ x: newIndex * SCREEN_WIDTH, animated: true });
    }
  };

  const handleNextImage = () => {
    const productImages = product.images || [product.image || product.thumbnail];
    const newIndex = selectedImageIndex === productImages.length - 1 ? 0 : selectedImageIndex + 1;
    setSelectedImageIndex(newIndex);
    if (imageCarouselRef.current) {
      imageCarouselRef.current.scrollTo({ x: newIndex * SCREEN_WIDTH, animated: true });
    }
  };

  // Review handlers
  const handleReviewSubmit = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }

    if (!reviewForm.rating || !reviewForm.title.trim() || !reviewForm.comment.trim()) {
      Alert.alert('Error', 'Please fill in all fields and select a rating');
      return;
    }

    setSubmittingReview(true);
    try {
      const productId = String(product._id || product.id);
      const productCategory = product.category || category || 'general';

      const response = await reviewAPI.createReview({
        productId,
        productCategory,
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        comment: reviewForm.comment.trim(),
      });

      if (response.success) {
        setReviewForm({ rating: 0, title: '', comment: '' });
        setShowReviewForm(false);
        await fetchReviews(product);
        Alert.alert('Success', 'Review submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }

    try {
      const response = await reviewAPI.markHelpful(reviewId);
      if (response.success) {
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review._id === reviewId
              ? { ...review, helpful: response.data.helpful, isHelpful: response.data.isHelpful }
              : review
          )
        );
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundSecondary }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, fontSize: 14, color: colors.textSecondary }}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.background }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, backgroundColor: colors.backgroundTertiary }}
            >
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: colors.backgroundTertiary, justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <Ionicons name="alert-circle-outline" size={64} color={colors.textTertiary} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 12, textAlign: 'center' }}>Product Not Found</Text>
          <Text style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', marginBottom: 32, lineHeight: 22, paddingHorizontal: 20 }}>
            The product you're looking for doesn't exist or may have been removed.
          </Text>
          <View style={{ gap: 12, width: '100%', maxWidth: 300 }}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 }} 
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color={isDark ? '#000000' : '#FFFFFF'} />
          <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Home')} 
              style={{ backgroundColor: colors.backgroundTertiary, paddingHorizontal: 24, paddingVertical: 16, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: colors.border }} 
              activeOpacity={0.8}
            >
              <Ionicons name="home" size={20} color={colors.text} />
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  const productImages = product.images || [product.image || product.thumbnail];
  const finalPrice = product.finalPrice || product.price;
  const originalPrice = product.originalPrice || product.mrp || product.price;
  const hasDiscount = originalPrice > finalPrice && finalPrice > 0;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={{ backgroundColor: colors.background }} edges={['top']}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: colors.text, marginHorizontal: 12 }} numberOfLines={1}>
            {product.name || 'Product Details'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>
      
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Image Carousel */}
      <View style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH, backgroundColor: colors.backgroundTertiary, position: 'relative' }}>
        <ScrollView
          ref={imageCarouselRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setSelectedImageIndex(index);
          }}
        >
          {productImages.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
              resizeMode="contain"
            />
          ))}
        </ScrollView>

        {/* Image Navigation */}
        {productImages.length > 1 && (
          <>
            <TouchableOpacity
              onPress={handlePrevImage}
              style={{ position: 'absolute', left: 16, top: '50%', width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card + 'E6', justifyContent: 'center', alignItems: 'center', zIndex: 10, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNextImage}
              style={{ position: 'absolute', right: 16, top: '50%', width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card + 'E6', justifyContent: 'center', alignItems: 'center', zIndex: 10, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={20} color={colors.text} />
            </TouchableOpacity>
            
            {/* Image Indicators */}
            <View style={{ position: 'absolute', bottom: 16, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
              {productImages.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: index === selectedImageIndex ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: index === selectedImageIndex ? colors.card : colors.card + '80',
                  }}
                />
              ))}
            </View>
          </>
        )}

        {/* Badges */}
        <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 8 }}>
          {hasDiscount && (
            <View style={{ backgroundColor: colors.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
              <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 10, fontWeight: '700' }}>{discountPercent}% OFF</Text>
            </View>
          )}
          <View style={{ backgroundColor: colors.card + 'E6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
            <Text style={{ color: colors.text, fontSize: 10, fontWeight: '700' }}>BEST SELLER</Text>
          </View>
        </View>
      </View>

      {/* Product Info */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 16, backgroundColor: colors.background }}>
        {/* Brand & Title */}
        {product.brand && (
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{product.brand}</Text>
        )}
        <Text style={{ fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 12 }}>{product.name}</Text>

        {/* Price */}
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text }}>₹{finalPrice.toLocaleString()}</Text>
          {hasDiscount && (
            <>
              <Text style={{ fontSize: 18, color: colors.textTertiary, textDecorationLine: 'line-through' }}>₹{originalPrice.toLocaleString()}</Text>
            </>
          )}
        </View>

        {/* Size Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 }}>Select Size</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {product.sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => setSelectedSize(size)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 8,
                    borderWidth: 2,
                    borderColor: selectedSize === size ? colors.primary : colors.border,
                    backgroundColor: selectedSize === size ? colors.primary : colors.card,
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: selectedSize === size ? (isDark ? '#000000' : '#FFFFFF') : colors.text,
                  }}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Color Selection */}
        {(product.colors?.length > 0 || product.color) && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 12 }}>Select Color</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {(product.colors || [product.color || '#000000']).slice(0, 6).map((color, idx) => {
                const isSelected = selectedColor === color || (!selectedColor && idx === 0);
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setSelectedColor(color)}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: color,
                      borderWidth: isSelected ? 3 : 2,
                      borderColor: isSelected ? colors.primary : colors.border,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={handleAddToCart}
            style={{ flex: 1, paddingVertical: 16, backgroundColor: colors.backgroundTertiary, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}
            activeOpacity={0.8}
          >
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBuyNow}
            style={{ flex: 1, paddingVertical: 16, backgroundColor: colors.primary, borderRadius: 8, alignItems: 'center' }}
            activeOpacity={0.8}
          >
            <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Buy Now</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Info */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: colors.backgroundTertiary, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', gap: 8 }}>
            <Text style={{ fontSize: 20, color: colors.success }}>✓</Text>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 2 }}>Free Shipping</Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>On orders over ₹1,000</Text>
            </View>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.backgroundTertiary, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', gap: 8 }}>
            <Text style={{ fontSize: 20, color: colors.success }}>↻</Text>
            <View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text, marginBottom: 2 }}>Easy Returns</Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>30 days return policy</Text>
            </View>
          </View>
        </View>

        {/* Reviews Summary */}
        {reviewStats && reviewStats.averageRating && (
          <View style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 16, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <View>
                <Text style={{ fontSize: 32, fontWeight: '700', color: colors.text }}>{reviewStats.averageRating.toFixed(1)}</Text>
                <View style={{ flexDirection: 'row', gap: 2, marginTop: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text
                      key={star}
                      style={{
                        fontSize: 16,
                        color: star <= Math.round(reviewStats.averageRating) ? '#FBBF24' : colors.textTertiary,
                      }}
                    >
                      ★
                    </Text>
                  ))}
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8 }}>
                  Based on {reviewStats.totalReviews} reviews
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Product Details */}
        <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 12 }}>Product Details</Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 16 }}>
            {product.description || product.productDetails?.description || 'Premium quality product designed for comfort and style.'}
          </Text>
          <View style={{ gap: 12 }}>
            {product.brand && (
              <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary, width: 80 }}>Brand:</Text>
                <Text style={{ fontSize: 14, color: colors.text, flex: 1 }}>{product.brand}</Text>
              </View>
            )}
            {product.productDetails?.fabric && (
              <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary, width: 80 }}>Fabric:</Text>
                <Text style={{ fontSize: 14, color: colors.text, flex: 1 }}>{product.productDetails.fabric}</Text>
              </View>
            )}
            {product.color && (
              <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.borderLight }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary, width: 80 }}>Color:</Text>
                <Text style={{ fontSize: 14, color: colors.text, flex: 1 }}>{product.color}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Shipping & Returns */}
        <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 16 }}>Shipping & Returns</Text>
          <View style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Text style={{ fontSize: 20, color: colors.success }}>✓</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Free Shipping</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>On orders over ₹1,000. Standard delivery in 5-7 business days.</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Text style={{ fontSize: 20, color: colors.success }}>↻</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 }}>5-Day Returns</Text>
                <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18 }}>Easy returns within 30 days of purchase.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <View style={{ marginBottom: 24, backgroundColor: colors.background }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>You may also like</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Category', { category: category || 'all' })} activeOpacity={0.7}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={recommendedProducts}
              renderItem={({ item }) => <CompactProductCard product={item} navigation={navigation} />}
              keyExtractor={(item) => item.id || item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
            />
          </View>
        )}

        {/* Sale Products */}
        {saleProducts.length > 0 && (
          <View style={{ marginBottom: 24, backgroundColor: colors.background }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>On Sale</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Sale')} activeOpacity={0.7}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={saleProducts}
              renderItem={({ item }) => <CompactProductCard product={item} navigation={navigation} />}
              keyExtractor={(item) => item.id || item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
            />
          </View>
        )}

        {/* Trending Products */}
        {trendingProducts.length > 0 && (
          <View style={{ marginBottom: 24, backgroundColor: colors.background }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>Trending Now</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Category', { category: 'all' })} activeOpacity={0.7}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text }}>View All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={trendingProducts}
              renderItem={({ item }) => <CompactProductCard product={item} navigation={navigation} />}
              keyExtractor={(item) => item.id || item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
            />
          </View>
        )}

        {/* Reviews Section */}
        <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>
              Customer Reviews{reviews.length > 0 ? ` (${reviews.length})` : ''}
            </Text>
            {isAuthenticated && !showReviewForm && (
              <TouchableOpacity
                onPress={() => setShowReviewForm(true)}
                style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.primary, borderRadius: 8 }}
                activeOpacity={0.8}
              >
                <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Write Review</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Review Form Modal */}
          <Modal
            visible={showReviewForm}
            animationType="slide"
            transparent
            onRequestClose={() => setShowReviewForm(false)}
          >
            <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
              <View style={{ backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>Write a Review</Text>
                  <TouchableOpacity onPress={() => setShowReviewForm(false)} activeOpacity={0.7}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ padding: 16, maxHeight: 400 }}>
                  {/* Star Rating */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Rating *</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => setReviewForm({ ...reviewForm, rating: star })}
                          activeOpacity={0.7}
                        >
                          <Text style={{
                            fontSize: 32,
                            color: star <= reviewForm.rating ? '#FBBF24' : colors.textTertiary,
                          }}>
                            ★
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Review Title */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Review Title *</Text>
                    <TextInput
                      value={reviewForm.title}
                      onChangeText={(text) => setReviewForm({ ...reviewForm, title: text })}
                      placeholder="Give your review a title"
                      placeholderTextColor={colors.textTertiary}
                      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, backgroundColor: colors.card }}
                      maxLength={200}
                    />
                  </View>

                  {/* Review Comment */}
                  <View style={{ marginBottom: 20 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Your Review *</Text>
                    <TextInput
                      value={reviewForm.comment}
                      onChangeText={(text) => setReviewForm({ ...reviewForm, comment: text })}
                      placeholder="Share your experience"
                      placeholderTextColor={colors.textTertiary}
                      multiline
                      numberOfLines={5}
                      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, backgroundColor: colors.card, minHeight: 100, textAlignVertical: 'top' }}
                      maxLength={2000}
                    />
                    <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 4, textAlign: 'right' }}>
                      {reviewForm.comment.length}/2000
                    </Text>
                  </View>
                </ScrollView>

                <View style={{ flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowReviewForm(false);
                      setReviewForm({ rating: 0, title: '', comment: '' });
                    }}
                    style={{ flex: 1, paddingVertical: 12, backgroundColor: colors.backgroundTertiary, borderRadius: 8, alignItems: 'center' }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: colors.text, fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleReviewSubmit}
                    disabled={submittingReview}
                    style={{ flex: 1, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 8, alignItems: 'center', opacity: submittingReview ? 0.6 : 1 }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Reviews List */}
          {loadingReviews ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : reviews.length > 0 ? (
            <View style={{ gap: 16 }}>
              {reviews.map((review) => (
                <View key={review._id} style={{ backgroundColor: colors.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                  <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Text style={{ color: isDark ? '#000000' : '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
                        {(review.userName || 'A')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 4 }}>{review.userName || 'Anonymous'}</Text>
                      <View style={{ flexDirection: 'row', gap: 2 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Text
                            key={star}
                            style={{
                              fontSize: 14,
                              color: star <= review.rating ? '#FBBF24' : colors.textTertiary,
                            }}
                          >
                            ★
                          </Text>
                        ))}
                      </View>
                    </View>
                  </View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>{review.title}</Text>
                  <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: 12 }}>{review.comment}</Text>
                  <TouchableOpacity
                    onPress={() => handleMarkHelpful(review._id)}
                    style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.backgroundTertiary, borderRadius: 6 }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 12, color: colors.text }}>
                      Helpful ({review.helpful || 0})
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingVertical: 24 }}>No reviews yet. Be the first to review!</Text>
          )}
        </View>
      </View>
      </ScrollView>
      <BottomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#111827',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 12,
  },
  headerSpacer: {
    width: 40,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    backgroundColor: '#f9fafb',
    position: 'relative',
  },
  productImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
  },
  imageNavButton: {
    position: 'absolute',
    left: 16,
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  imageNavButtonRight: {
    left: 'auto',
    right: 16,
  },
  imageNavText: {
    fontSize: 24,
    color: '#111827',
    fontWeight: 'bold',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#fff',
  },
  badgesContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  discountBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bestSellerBadge: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bestSellerText: {
    color: '#111827',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  brand: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 18,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  selectionContainer: {
    marginBottom: 20,
  },
  selectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  sizeButtonActive: {
    borderColor: '#111827',
    backgroundColor: '#f9fafb',
  },
  sizeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  sizeButtonTextActive: {
    color: '#111827',
  },
  colorsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorButtonActive: {
    borderColor: '#111827',
    borderWidth: 3,
  },
  colorCheckmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#111827',
    alignItems: 'center',
  },
  buyNowText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  quickInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 8,
  },
  quickInfoIcon: {
    fontSize: 20,
    color: '#10b981',
  },
  quickInfoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  quickInfoSubtitle: {
    fontSize: 11,
    color: '#6b7280',
  },
  reviewsSummary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  reviewsSummaryHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  reviewsRating: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 4,
  },
  star: {
    fontSize: 16,
    color: '#d1d5db',
  },
  starActive: {
    color: '#fbbf24',
  },
  reviewsStats: {
    flex: 1,
  },
  reviewsCount: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsList: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  detailValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  shippingSection: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  shippingItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  shippingIcon: {
    fontSize: 20,
    color: '#3b82f6',
    marginTop: 2,
  },
  shippingTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  shippingText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  relatedSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  relatedList: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  compactCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  compactImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#f9fafb',
    position: 'relative',
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactImageLoader: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  compactSaleBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 10,
  },
  compactSaleText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  compactInfo: {
    padding: 12,
  },
  compactName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
    minHeight: 36,
    lineHeight: 18,
  },
  compactPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  compactPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
  },
  compactOriginalPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  reviewsSection: {
    marginBottom: 24,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  writeReviewButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  writeReviewText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsList: {
    gap: 16,
  },
  reviewItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  reviewHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  reviewInfo: {
    flex: 1,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewStar: {
    fontSize: 14,
    color: '#d1d5db',
  },
  reviewStarActive: {
    color: '#fbbf24',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpfulText: {
    fontSize: 12,
    color: '#6b7280',
  },
  noReviewsText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#6b7280',
    paddingVertical: 32,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalClose: {
    fontSize: 24,
    color: '#6b7280',
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  starsInput: {
    flexDirection: 'row',
    gap: 8,
  },
  starInput: {
    fontSize: 32,
    color: '#d1d5db',
  },
  starInputActive: {
    color: '#fbbf24',
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },
  formTextArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ProductDetailScreen;
