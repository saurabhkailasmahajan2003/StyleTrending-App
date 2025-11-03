import { Link } from 'react-router-dom';
import { Eye, Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function ProductCard({ product }) {
  const { toggle, isWished } = useWishlist();
  const { addToCart } = useCart();
  return (
  <div className="card p-4">
      <Link to={`/product/${product._id}`}>
        <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-50">
          <img
            loading="lazy"
            style={{ willChange: 'transform' }}
            className="h-full w-full object-cover transition-transform duration-300"
            src={product.images?.[0] || 'https://via.placeholder.com/600'}
            alt={product.name}
          />
        </div>
          <div className="mt-3 space-y-1">
            <div className="text-sm text-gray-500 uppercase tracking-wider truncate">{product.brand}</div>
            <div className="font-display text-lg text-gray-900 line-clamp-2">{product.name}</div>
            <div className="flex items-center gap-3 mt-2">
              <div className="text-lg font-semibold text-primary-600">₹{product.price.toLocaleString()}</div>
              {product.discount && (
                <div className="text-sm text-gray-400 line-through">₹{Math.round(product.price / (1 - product.discount / 100)).toLocaleString()}</div>
              )}
              {product.onSale && <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">Sale</span>}
              {product.isNewArrival && <span className="text-xs px-2 py-0.5 rounded-full bg-accent-50 text-accent-700">New</span>}
            </div>
          </div>
      </Link>
      <div className="mt-4 flex gap-2">
        <Link 
          to={`/product/${product._id}`} 
          className="p-2 text-sm rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
          title="View Details"
        >
          <Eye size={16} />
        </Link>
        <button 
          className={`p-2 text-sm rounded-lg border flex items-center justify-center transition-colors
            ${isWished(product._id) 
              ? 'border-primary-200 text-primary-600' 
              : 'border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => toggle(product._id)}
          title={isWished(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={16} fill={isWished(product._id) ? 'currentColor' : 'none'} />
        </button>
        <button 
          className="flex-1 p-2 text-sm rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          onClick={() => addToCart(product, 1)}
        >
          <ShoppingBag size={16} />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}


