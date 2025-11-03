import axios from 'axios';

const api = axios.create({
  // baseURL left empty to use vite proxy for /api
  timeout: 10000
});

const buildQueryString = (params = {}) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (typeof value === 'boolean') sp.set(key, value ? 'true' : 'false');
    else sp.set(key, String(value));
  });
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
};

export const fetchProducts = async (params = {}) => {
  const qs = buildQueryString(params);
  const { data } = await api.get(`/api/products${qs}`);
  return data; // {products, page, pages, total}
};

export const fetchProduct = async (id) => {
  const { data } = await api.get(`/api/products/${id}`);
  return data;
};


