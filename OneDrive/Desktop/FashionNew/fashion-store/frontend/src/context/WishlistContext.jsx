import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext.jsx';
import { useModal } from './ModalContext.jsx';
import { getMyWishlist, toggleWishlist as toggleWishlistAPI } from '../api/wishlistAPI.js';

const WishlistContext = createContext(undefined);

export function WishlistProvider({ children }) {
  const [productIds, setProductIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { openSignInModal } = useModal();

  // Load wishlist from backend when user logs in
  useEffect(() => {
    if (user) {
      setLoading(true);
      getMyWishlist()
        .then((wishlist) => {
          if (wishlist && wishlist.products) {
            // Extract product IDs from populated products or direct IDs
            const ids = wishlist.products.map(p => p._id || p.toString());
            setProductIds(ids);
          } else {
            setProductIds([]);
          }
        })
        .catch((err) => {
          console.error('Error loading wishlist:', err);
          setProductIds([]);
        })
        .finally(() => setLoading(false));
    } else {
      setProductIds([]);
    }
  }, [user]);

  const toggle = async (id) => {
    if (!user) {
      openSignInModal();
      return;
    }
    
    // Optimistically update UI
    const isCurrentlyWished = productIds.includes(id);
    setProductIds((prev) => (isCurrentlyWished ? prev.filter((p) => p !== id) : [...prev, id]));
    
    // Sync with backend
    try {
      const updatedWishlist = await toggleWishlistAPI(id);
      // Update with fresh data from backend
      if (updatedWishlist && updatedWishlist.products) {
        const ids = updatedWishlist.products.map(p => p._id || p.toString());
        setProductIds(ids);
      }
    } catch (err) {
      // Revert on error
      setProductIds((prev) => (isCurrentlyWished ? [...prev, id] : prev.filter((p) => p !== id)));
      console.error('Error toggling wishlist:', err);
    }
  };
  
  const isWished = (id) => productIds.includes(id);
  
  return (
    <WishlistContext.Provider value={{ productIds, toggle, isWished, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);


