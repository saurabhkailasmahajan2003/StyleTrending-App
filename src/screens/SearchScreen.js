/**
 * Search Screen - React Native version
 * Converted from web SearchResults.jsx
 * Features: Product search, filters, same API calls
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { searchAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import BottomNavBar from '../components/BottomNavBar';

const ITEMS_PER_PAGE = 12;

const SearchScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Get search query from route params or state
  const initialQuery = route.params?.query || route.params?.q || '';
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const [filters, setFilters] = useState({
    priceRange: null,
    brands: [],
    sizes: [],
    sortBy: null,
  });

  // Fetch search results
  const fetchSearchResults = useCallback(async (query) => {
    if (!query || !query.trim()) {
      setProducts([]);
      setFilteredProducts([]);
      setDisplayedProducts([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchAPI.searchProducts(query);
      if (response.success) {
        const fetchedProducts = response.data.products || [];
        setProducts(fetchedProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...products];

    if (filters.priceRange) {
      filtered = filtered.filter((product) => {
        const price = product.finalPrice || product.price || 0;
        const { min, max } = filters.priceRange;
        return price >= min && (max === Infinity || price <= max);
      });
    }

    if (filters.brands.length > 0) {
      filtered = filtered.filter((product) => 
        filters.brands.includes(product.brand)
      );
    }

    if (filters.sizes.length > 0) {
      filtered = filtered.filter((product) => {
        if (!product.sizes || !Array.isArray(product.sizes)) return false;
        return filters.sizes.some((size) => product.sizes.includes(size));
      });
    }

    if (filters.sortBy && filters.sortBy !== 'default') {
      filtered.sort((a, b) => {
        const priceA = a.finalPrice || a.price || 0;
        const priceB = b.finalPrice || b.price || 0;
        switch (filters.sortBy) {
          case 'price-low-high': return priceA - priceB;
          case 'price-high-low': return priceB - priceA;
          case 'newest': 
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          default: return 0;
        }
      });
    }

    setFilteredProducts(filtered);
    setPage(1);
    setDisplayedProducts(filtered.slice(0, ITEMS_PER_PAGE));
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [products, filters]);

  // Load more products (pagination)
  const loadMore = useCallback(() => {
    if (!hasMore || isLoading) return;
    
    const nextPage = page + 1;
    const startIndex = nextPage * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newProducts = filteredProducts.slice(0, endIndex);
    
    setDisplayedProducts(newProducts);
    setPage(nextPage);
    setHasMore(endIndex < filteredProducts.length);
  }, [page, hasMore, isLoading, filteredProducts]);

  // Initial search
  useEffect(() => {
    if (initialQuery) {
      fetchSearchResults(initialQuery);
    }
  }, [initialQuery, fetchSearchResults]);

  // Handle search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      fetchSearchResults(searchQuery.trim());
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (searchQuery.trim()) {
      fetchSearchResults(searchQuery.trim()).finally(() => {
        setRefreshing(false);
      });
    } else {
      setRefreshing(false);
    }
  }, [searchQuery, fetchSearchResults]);

  // Get unique brands and sizes for filters
  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  const uniqueSizes = [...new Set(
    products.flatMap(p => (Array.isArray(p.sizes) ? p.sizes : [])).filter(Boolean)
  )];

  const renderProduct = ({ item }) => (
    <ProductCard product={item} />
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <Ionicons name="search" size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#111' }}>
          No products found
        </Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' }}>
          Try adjusting your search or filters
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={{
            backgroundColor: '#000',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Search Header */}
      <View style={{ 
        backgroundColor: '#fff', 
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: '#e5e7eb' 
      }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
            }}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            onPress={handleSearch}
            style={{
              backgroundColor: '#000',
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 8,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Search</Text>
          </TouchableOpacity>
        </View>
        
        {/* Results Count & Filter Toggle */}
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: 12 
        }}>
          <Text style={{ color: '#666', fontSize: 14 }}>
            {isLoading ? 'Searching...' : `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`}
          </Text>
          <TouchableOpacity
            onPress={() => setShowFilters(true)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderWidth: 1,
              borderColor: '#d1d5db',
              borderRadius: 6,
            }}
          >
            <Text style={{ marginRight: 4, fontSize: 14 }}>Filters</Text>
            <Ionicons name="options-outline" size={16} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Products List */}
      {isLoading && displayedProducts.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={{ marginTop: 16, color: '#666' }}>Searching products...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id || item.id || `product-${item.name}`}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 100 }}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 4 }}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {/* Modal Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Filters</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            {/* Sort By */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Sort By</Text>
              {['default', 'price-low-high', 'price-high-low', 'newest'].map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setFilters({ ...filters, sortBy: option })}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                  }}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: filters.sortBy === option ? '#000' : '#d1d5db',
                    marginRight: 12,
                    backgroundColor: filters.sortBy === option ? '#000' : 'transparent',
                  }} />
                  <Text style={{ fontSize: 14 }}>
                    {option === 'default' ? 'Default' :
                     option === 'price-low-high' ? 'Price: Low to High' :
                     option === 'price-high-low' ? 'Price: High to Low' :
                     'Newest First'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price Range */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Price Range</Text>
              {[
                { label: 'Under ₹1,000', min: 0, max: 1000 },
                { label: '₹1,000 - ₹5,000', min: 1000, max: 5000 },
                { label: '₹5,000 - ₹10,000', min: 5000, max: 10000 },
                { label: 'Above ₹10,000', min: 10000, max: Infinity },
              ].map((range) => (
                <TouchableOpacity
                  key={range.label}
                  onPress={() => setFilters({
                    ...filters,
                    priceRange: filters.priceRange?.min === range.min ? null : range,
                  })}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                  }}
                >
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: filters.priceRange?.min === range.min ? '#000' : '#d1d5db',
                    marginRight: 12,
                    backgroundColor: filters.priceRange?.min === range.min ? '#000' : 'transparent',
                  }} />
                  <Text style={{ fontSize: 14 }}>{range.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Brands */}
            {uniqueBrands.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Brands</Text>
                {uniqueBrands.slice(0, 10).map((brand) => (
                  <TouchableOpacity
                    key={brand}
                    onPress={() => {
                      const newBrands = filters.brands.includes(brand)
                        ? filters.brands.filter(b => b !== brand)
                        : [...filters.brands, brand];
                      setFilters({ ...filters, brands: newBrands });
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: '#f3f4f6',
                    }}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor: filters.brands.includes(brand) ? '#000' : '#d1d5db',
                      marginRight: 12,
                      backgroundColor: filters.brands.includes(brand) ? '#000' : 'transparent',
                    }} />
                    <Text style={{ fontSize: 14 }}>{brand}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Clear Filters */}
            <TouchableOpacity
              onPress={() => {
                setFilters({ priceRange: null, brands: [], sizes: [], sortBy: null });
              }}
              style={{
                backgroundColor: '#f3f4f6',
                paddingVertical: 14,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>Clear All Filters</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Apply Button */}
          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' }}>
            <TouchableOpacity
              onPress={() => setShowFilters(false)}
              style={{
                backgroundColor: '#000',
                paddingVertical: 16,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <BottomNavBar />
    </View>
  );
};

export default SearchScreen;

