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

export const createRazorpayOrder = async (orderData) => {
  try {
    console.log('API Call: POST /api/orders/create-razorpay-order', orderData);
    const response = await api.post('/orders/create-razorpay-order', orderData);
    console.log('API Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Error Details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    throw error;
  }
};

export const verifyRazorpayPayment = async (paymentData) => {
  const { data } = await api.post('/orders/verify-razorpay-payment', paymentData);
  return data;
};

export const createOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

