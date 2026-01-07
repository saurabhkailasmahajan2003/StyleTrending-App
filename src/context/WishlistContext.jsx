import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { wishlistAPI } from '../services/api';
import { storage } from '../utils/storage';

const LOCAL_WISHLIST_KEY = 'local_wishlist_ids';
const WISHLIST_API_DISABLED_KEY = 'wishlist_api_disabled';

const getLocalWishlist = async () => {
  try {
    const stored = await storage.getItem(LOCAL_WISHLIST_KEY);
    return stored || [];
  } catch (err) {
    console.error('Error reading local wishlist:', err);
    return [];
  }
};

const saveLocalWishlist = async (ids) => {
  try {
    await storage.setItem(LOCAL_WISHLIST_KEY, ids);
  } catch (err) {
    console.error('Error saving local wishlist:', err);
  }
};

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistApiAvailable, setWishlistApiAvailable] = useState(true);

  // Initialize wishlist API availability
  useEffect(() => {
    const checkApiAvailability = async () => {
      const stored = await storage.getItem(WISHLIST_API_DISABLED_KEY);
      setWishlistApiAvailable(stored !== true);
    };
    checkApiAvailability();
  }, []);

  // Load wishlist when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
    } else {
      setWishlist([]);
      setWishlistIds(new Set());
    }
  }, [isAuthenticated]);

  const setLocalWishlistState = async (ids) => {
    const uniqueIds = Array.from(new Set(ids));
    setWishlistIds(new Set(uniqueIds));
    setWishlist(uniqueIds.map(id => ({ productId: id })));
    await saveLocalWishlist(uniqueIds);
  };

  const loadWishlist = async () => {
    if (!isAuthenticated) return;
    if (!wishlistApiAvailable) {
      const localIds = await getLocalWishlist();
      await setLocalWishlistState(localIds);
      return;
    }
    
    setLoading(true);
    try {
      const response = await wishlistAPI.getWishlist();
      if (response.success) {
        const items = response.data.wishlist || [];
        setWishlist(items);
        const ids = items.map(item => item.productId || item.product?._id || item.product?.id);
        setWishlistIds(new Set(ids));
        await saveLocalWishlist(ids);
      }
    } catch (error) {
      // Silently fall back to local storage when API route is missing
      setWishlistApiAvailable(false);
      await storage.setItem(WISHLIST_API_DISABLED_KEY, true);
      const localIds = await getLocalWishlist();
      await setLocalWishlistState(localIds);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      throw new Error('Please login to add items to wishlist');
    }

    try {
      if (!wishlistApiAvailable) {
        await setLocalWishlistState([...wishlistIds, productId]);
        return true;
      }

      const response = await wishlistAPI.addToWishlist(productId);
      if (response.success) {
        setWishlistIds(prev => new Set([...prev, productId]));
        await loadWishlist();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      // Fallback to local storage if API is not available
      setWishlistApiAvailable(false);
      await storage.setItem(WISHLIST_API_DISABLED_KEY, true);
      await setLocalWishlistState([...wishlistIds, productId]);
      return true;
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return false;

    try {
      if (!wishlistApiAvailable) {
        await setLocalWishlistState([...wishlistIds].filter(id => id !== productId));
        return true;
      }

      const response = await wishlistAPI.removeFromWishlist(productId);
      if (response.success) {
        const updated = [...wishlistIds].filter(id => id !== productId);
        await setLocalWishlistState(updated);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Fallback to local storage if API is not available
      setWishlistApiAvailable(false);
      await storage.setItem(WISHLIST_API_DISABLED_KEY, true);
      await setLocalWishlistState([...wishlistIds].filter(id => id !== productId));
      return true;
    }
  };

  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => {
    return wishlistIds.has(productId);
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        loading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        getWishlistCount,
        loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

