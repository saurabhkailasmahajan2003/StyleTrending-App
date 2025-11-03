import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { useUser } from './UserContext.jsx';
import { useModal } from './ModalContext.jsx';
import { getMyCart, updateCart } from '../api/cartAPI.js';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{product, qty, data}]
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { user } = useUser();
  const { openSignInModal } = useModal();

  // Load cart from backend when user logs in
  useEffect(() => {
    if (user) {
      setLoading(true);
      setIsInitialLoad(true);
      getMyCart()
        .then((cart) => {
          if (cart && cart.items) {
            // Transform backend format to frontend format
            const transformedItems = cart.items.map(item => ({
              product: item.product._id || item.product,
              qty: item.qty,
              data: item.product._id ? item.product : null // If populated, use full product
            }));
            setItems(transformedItems);
          } else {
            setItems([]);
          }
        })
        .catch((err) => {
          console.error('Error loading cart:', err);
          setItems([]);
        })
        .finally(() => {
          setLoading(false);
          setIsInitialLoad(false);
        });
    } else {
      setItems([]);
      setIsInitialLoad(false);
    }
  }, [user]);

  // Sync cart to backend when items change (debounced)
  useEffect(() => {
    if (!user || loading || isInitialLoad) return;
    
    const timeoutId = setTimeout(() => {
      const cartItems = items.map(item => ({
        product: item.product,
        qty: item.qty
      }));
      updateCart(cartItems).catch((err) => {
        console.error('Error syncing cart:', err);
      });
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [items, user, loading, isInitialLoad]);

  const addToCart = (product, qty = 1) => {
    if (!user) {
      openSignInModal();
      return;
    }
    
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product === product._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty, data: product };
        return copy;
      }
      return [...prev, { product: product._id, qty, data: product }];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.product !== productId));
  };

  const updateQty = (productId, qty) => {
    setItems((prev) => prev.map((i) => (i.product === productId ? { ...i, qty } : i)));
  };

  const clearCart = () => {
    setItems([]);
  };

  const totals = useMemo(() => {
    const itemsPrice = items.reduce((sum, i) => {
      const price = i.data?.price || 0;
      return sum + price * i.qty;
    }, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 5;
    const taxPrice = +(itemsPrice * 0.1).toFixed(2);
    const totalPrice = +(itemsPrice + shippingPrice + taxPrice).toFixed(2);
    return { itemsPrice, shippingPrice, taxPrice, totalPrice };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, totals, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);


