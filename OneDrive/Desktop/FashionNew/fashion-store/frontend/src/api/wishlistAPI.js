import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getMyWishlist = async () => {
  const { data } = await api.get('/wishlist/mine');
  return data; // {user, products: [productIds]}
};

export const toggleWishlist = async (productId) => {
  const { data } = await api.post('/wishlist/toggle', { productId });
  return data; // {user, products: [productIds]}
};

