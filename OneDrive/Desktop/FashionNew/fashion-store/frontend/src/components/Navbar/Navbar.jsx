import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx';

export default function Navbar() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
            Fashion<span className="text-indigo-600">Store</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
            <Link className="hover:text-indigo-600" to="/shop">Shop</Link>
            <Link className="hover:text-indigo-600" to="/category/Mens">Mens</Link>
            <Link className="hover:text-indigo-600" to="/category/Womens">Womens</Link>
            <Link className="hover:text-indigo-600" to="/category/Kids">Kids</Link>
            <Link className="hover:text-indigo-600" to="/wishlist">Wishlist</Link>
            <Link className="hover:text-indigo-600" to="/profile">Profile</Link>
            <Link className="relative hover:text-indigo-600" to="/cart">
              Cart
              {count > 0 && (
                <span className="absolute -top-2 -right-3 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium leading-4 bg-indigo-600 text-white rounded-full">{count}</span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}


