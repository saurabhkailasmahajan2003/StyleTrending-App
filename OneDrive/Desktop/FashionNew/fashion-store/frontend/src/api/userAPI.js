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

export const login = async (email, password) => {
  const { data } = await api.post('/users/login', { email, password });
  return data; // {_id, name, email, token}
};

export const register = async (name, email, password) => {
  const { data } = await api.post('/users/register', { name, email, password });
  return data; // {_id, name, email, token}
};

export const getProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data; // {_id, name, email, isAdmin}
};

