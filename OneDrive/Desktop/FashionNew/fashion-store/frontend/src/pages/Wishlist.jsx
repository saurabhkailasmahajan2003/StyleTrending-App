import { useWishlist } from '../context/WishlistContext.jsx';
import { useEffect, useState } from 'react';
import { fetchProduct } from '../api/productAPI.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Wishlist() {
  const { productIds } = useWishlist();
  const [products, setProducts] = useState([]);
  useEffect(() => {
    (async () => {
      if (productIds.length === 0) return setProducts([]);
      const uniqueIds = Array.from(new Set(productIds));
      const results = await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            return await fetchProduct(id);
          } catch (_) {
            return null;
          }
        })
      );
      setProducts(results.filter(Boolean));
    })();
  }, [productIds]);
  return (
    <div className="container" style={{ padding: '16px 0' }}>
      <h2>Wishlist</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
}


