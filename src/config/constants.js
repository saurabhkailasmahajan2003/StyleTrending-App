/**
 * App Constants
 * Centralized constants for the application
 */

// API Configuration
export const API_TIMEOUT = 30000; // 30 seconds

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  WISHLIST: 'local_wishlist_ids',
  RECENTLY_VIEWED: 'recently_viewed_products',
  CART: 'cart',
};

// App Constants
export const APP_NAME = 'Astra Fashion';
export const APP_VERSION = '1.0.0';

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_RECENT_ITEMS = 20;

// Colors (can be moved to theme file later)
export const COLORS = {
  primary: '#000000',
  secondary: '#666666',
  background: '#FFFFFF',
  error: '#FF0000',
  success: '#00FF00',
};

export default {
  API_TIMEOUT,
  STORAGE_KEYS,
  APP_NAME,
  APP_VERSION,
  DEFAULT_PAGE_SIZE,
  MAX_RECENT_ITEMS,
  COLORS,
};

