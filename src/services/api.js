/**
 * API Service - Exact match to web frontend
 * Same endpoints, same request/response format, same JWT handling
 * Adapted for React Native with axios and AsyncStorage
 */
import axios from 'axios';
import env from '../config/env';
import { storage } from '../utils/storage';

// Base URL from environment (matches web: import.meta.env.VITE_API_BASE_URL)
const API_BASE_URL = env.apiBaseUrl;

// Log API configuration on module load
console.log('🔧 API Service Initialized');
console.log('   Base URL:', API_BASE_URL || 'NOT SET - Products will not load!');
if (!API_BASE_URL) {
  console.error('❌ CRITICAL: API_BASE_URL is not set!');
  console.error('   Please create .env file with: EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api');
}

// Helper function to make API requests - matches web apiRequest exactly
const apiRequest = async (endpoint, options = {}) => {
  // Debug: Log API base URL on first call
  if (!apiRequest._logged) {
    console.log('🔗 API Configuration:');
    console.log('   Base URL:', API_BASE_URL || 'NOT SET');
    console.log('   Endpoint:', endpoint);
    apiRequest._logged = true;
  }
  
  // Check if API_BASE_URL is set
  if (!API_BASE_URL) {
    const error = new Error('API Base URL is not configured. Please set EXPO_PUBLIC_API_URL in .env file');
    console.error('❌', error.message);
    throw error;
  }
  
  // Get token from storage (matches web: localStorage.getItem('token'))
  const token = await storage.getToken('token');
  
  // Build full URL (endpoint may already include query string from web version)
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Debug: Log request details
  console.log(`🌐 API Request: ${options.method || 'GET'} ${fullUrl}`);
  
  const config = {
    url: fullUrl,
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    timeout: 30000, // 30 second timeout
  };

  // Handle request body (matches web: body: JSON.stringify())
  if (options.body) {
    config.data = JSON.parse(options.body);
  }

  try {
    const response = await axios(config);
    
    // Debug: Log successful response
    console.log(`✅ API Success: ${fullUrl}`, response.status);
    
    // Return data directly (matches web: return data from response.json())
    return response.data;
  } catch (error) {
    // Enhanced error logging - concise and useful
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const errorMessage = error.response.data?.message || `Server error (${status})`;
      
      // 404s are often expected (e.g., when searching for products across categories)
      // Log them as warnings instead of errors to reduce console noise
      if (status === 404) {
        // Only log 404s for product endpoints as warnings (expected behavior)
        if (endpoint.includes('/products/') || endpoint.includes('/product/')) {
          // Suppress 404 logs for product lookups - they're expected during category searches
        } else {
          console.warn(`⚠️ API Warning [404]: ${endpoint} - ${errorMessage}`);
        }
      } else {
        console.error(`❌ API Error [${status}]: ${endpoint}`);
        console.error(`   ${errorMessage}`);
      }
      
      const apiError = new Error(errorMessage);
      apiError.response = { 
        data: error.response.data, 
        status: error.response.status 
      };
      throw apiError;
    }
    
    if (error.request || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      // Network error - no response received
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      const errorMsg = isTimeout 
        ? `Request timeout: Server took too long to respond (${config.timeout}ms)`
        : 'Network error: Unable to reach server. Please check your connection.';
      
      console.error(`❌ Network Error: ${endpoint}`);
      console.error(`   ${errorMsg}`);
      if (error.code) {
        console.error(`   Error Code: ${error.code}`);
      }
      
      const networkError = new Error(errorMsg);
      networkError.isNetworkError = true;
      networkError.isTimeout = isTimeout;
      throw networkError;
    }
    
    // Other errors (configuration, etc.)
    console.error(`❌ API Error: ${endpoint}`);
    console.error(`   ${error.message || 'Unknown error occurred'}`);
    const genericError = new Error(error.message || 'An unexpected error occurred');
    throw genericError;
  }
};

// Auth API calls - Exact match to web
export const authAPI = {
  signup: async (userData) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  sendOTP: async (phone) => {
    return apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  verifyOTP: async (phone, otp, name = null, email = null) => {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp, name, email }),
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me');
  },
};

// Cart API calls - Exact match to web
export const cartAPI = {
  getCart: async () => {
    return apiRequest('/cart');
  },

  addToCart: async (product, quantity = 1, size = '', color = '') => {
    return apiRequest('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product, quantity, size, color }),
    });
  },

  updateCartItem: async (itemId, quantity) => {
    return apiRequest(`/cart/update/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeFromCart: async (itemId) => {
    return apiRequest(`/cart/remove/${itemId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async () => {
    return apiRequest('/cart/clear', {
      method: 'DELETE',
    });
  },
};

// Order API calls - Exact match to web
export const orderAPI = {
  getOrders: async () => {
    return apiRequest('/orders');
  },

  getOrder: async (orderId) => {
    return apiRequest(`/orders/${orderId}`);
  },

  createOrder: async (shippingAddress, paymentMethod = 'COD') => {
    return apiRequest('/orders/create', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress, paymentMethod }),
    });
  },
};

// Payment API calls - Exact match to web
export const paymentAPI = {
  createRazorpayOrder: async (shippingAddress) => {
    return apiRequest('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify({ shippingAddress }),
    });
  },

  verifyPayment: async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    return apiRequest('/payment/verify-payment', {
      method: 'POST',
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }),
    });
  },
};

// Profile API calls - Exact match to web
export const profileAPI = {
  getProfile: async () => {
    return apiRequest('/profile');
  },

  updateProfile: async (data) => {
    return apiRequest('/profile/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Product API calls - Exact match to web
export const productAPI = {
  getWatches: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products/watches${queryString ? `?${queryString}` : ''}`);
  },

  getWatchById: async (id) => {
    return apiRequest(`/products/watches/${id}`);
  },

  getLenses: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products/lens${queryString ? `?${queryString}` : ''}`);
  },

  getLensById: async (id) => {
    return apiRequest(`/products/lens/${id}`);
  },

  getAccessories: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products/accessories${queryString ? `?${queryString}` : ''}`);
  },

  getAccessoryById: async (id) => {
    return apiRequest(`/products/accessories/${id}`);
  },

  getMenItems: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products/men${queryString ? `?${queryString}` : ''}`);
  },

  getMenItemById: async (id) => {
    return apiRequest(`/products/men/${id}`);
  },

  getWomenItems: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/products/women${queryString ? `?${queryString}` : ''}`);
  },

  getWomenItemById: async (id) => {
    return apiRequest(`/products/women/${id}`);
  },

  // Helper to get all products from all categories - Exact match to web
  getAllProducts: async (params = {}) => {
    try {
      const [watches, lenses, accessories, men, women] = await Promise.all([
        productAPI.getWatches(params),
        productAPI.getLenses(params),
        productAPI.getAccessories(params),
        productAPI.getMenItems(params),
        productAPI.getWomenItems(params),
      ]);

      const allProducts = [
        ...(watches.success ? watches.data.products : []),
        ...(lenses.success ? lenses.data.products : []),
        ...(accessories.success ? accessories.data.products : []),
        ...(men.success ? men.data.products : []),
        ...(women.success ? women.data.products : []),
      ];

      return {
        success: true,
        data: { products: allProducts },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        data: { products: [] },
      };
    }
  },
};

// Admin API calls - Exact match to web
export const adminAPI = {
  getSummary: async () => apiRequest('/admin/summary'),
  getOrders: async () => apiRequest('/admin/orders'),
  updateOrderStatus: async (orderId, status) =>
    apiRequest(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deleteOrder: async (orderId) =>
    apiRequest(`/admin/orders/${orderId}`, { method: 'DELETE' }),
  getProducts: async (category) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiRequest(`/admin/products${query}`);
  },
  createProduct: async (payload) =>
    apiRequest('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateProduct: async (id, payload) =>
    apiRequest(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteProduct: async (id, category) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiRequest(`/admin/products/${id}${query}`, { method: 'DELETE' });
  },
  getUsers: async () => apiRequest('/admin/users'),
  deleteUser: async (userId) =>
    apiRequest(`/admin/users/${userId}`, { method: 'DELETE' }),
};

// Review API calls - Exact match to web
export const reviewAPI = {
  getReviews: async (productId, sort = 'newest', limit = 50) => {
    return apiRequest(`/reviews/${productId}?sort=${sort}&limit=${limit}`);
  },

  createReview: async (reviewData) => {
    return apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  markHelpful: async (reviewId) => {
    return apiRequest(`/reviews/${reviewId}/helpful`, {
      method: 'PUT',
    });
  },
};

// Wishlist API calls - Exact match to web
export const wishlistAPI = {
  getWishlist: async () => {
    return apiRequest('/wishlist');
  },

  addToWishlist: async (productId) => {
    return apiRequest('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },

  removeFromWishlist: async (productId) => {
    return apiRequest(`/wishlist/remove/${productId}`, {
      method: 'DELETE',
    });
  },

  checkWishlist: async (productId) => {
    return apiRequest(`/wishlist/check/${productId}`);
  },
};

// Search API calls - Exact match to web
export const searchAPI = {
  searchProducts: async (query, params = {}) => {
    const queryString = new URLSearchParams({ q: query, ...params }).toString();
    return apiRequest(`/search?${queryString}`);
  },
};

// Order Tracking API - Removed as order placing system is disabled
// export const trackingAPI = {
//   trackOrder: async (orderId) => {
//     return apiRequest(`/orders/track/${orderId}`);
//   },
// };

// Export default apiRequest (matches web export)
export default apiRequest;
