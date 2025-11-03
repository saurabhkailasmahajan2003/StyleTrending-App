import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProduct } from '../api/productAPI.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import Loader from '../components/Loader.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const { toggle, isWished } = useWishlist();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchProduct(id);
      setProduct(res);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <Loader />;
  if (!product) return <div className="max-w-6xl mx-auto px-4 py-6">Not found</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-2 gap-6">
      <div>
        <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-50">
          <img className="w-full h-full object-cover" src={product.images?.[0] || 'https://via.placeholder.com/800'} alt={product.name} />
        </div>
        <div className="flex gap-2 mt-2">
          {(product.images || []).map((img, i) => (
            <img key={i} src={img} alt={product.name} className="w-20 h-20 object-cover rounded border border-gray-200" />
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">{product.name}</h2>
        <div className="mt-2 flex items-center gap-2">
          <div className="text-2xl font-bold text-gray-900">${product.price}</div>
          {product.onSale && <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">Sale</span>}
          {product.isNewArrival && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">New</span>}
        </div>
        <div className="text-sm text-gray-600 mt-1">Brand: {product.brand}</div>
        <div className="text-sm text-gray-600">Category: {product.category} / {product.subCategory}</div>
        <p className="mt-3 leading-7 text-gray-700">{product.description}</p>
        <div className="mt-4 flex items-center gap-3">
          <label className="text-sm text-gray-700">Qty</label>
          <input className="w-20 rounded-md border border-gray-200 px-2 py-1" type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
        </div>
        <div className="mt-4 flex gap-3">
          <button className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => addToCart(product, qty)}>Add to Cart</button>
          <button className="px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50" onClick={() => toggle(product._id)}>{isWished(product._id) ? 'Wishlisted' : 'Wishlist'}</button>
        </div>
      </div>
    </div>
  );
}


