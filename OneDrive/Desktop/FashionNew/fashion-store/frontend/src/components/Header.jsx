import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X, Heart, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useUser } from '../context/UserContext.jsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { items } = useCart();
  const { productIds } = useWishlist();
  const { user, logout } = useUser();
  const cartItemsCount = items.reduce((sum, i) => sum + i.qty, 0);
  const wishlistCount = productIds.length;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const searchRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isSearchOpen) return;
      // close when clicking outside the search overlay content
      if (searchRef.current && !searchRef.current.contains(event.target) && !event.target.closest('.search-button')) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'New Arrivals', href: '/shop?new=true', isNew: true },
    { name: 'Mens', href: '/category/Mens' },
    { name: 'Womens', href: '/category/Womens' },
    { name: 'Kids', href: '/category/Kids' },
    { name: 'Sale', href: '/shop?sale=true', isSale: true }
  ];

  const searchSuggestions = ['Summer Collection', 'Leather Bags', 'Silk Dresses', 'Evening Gowns', 'Accessories', 'New Arrivals'];
  const [suggestions, setSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const navigate = useNavigate();
  const navigateSearch = (q) => {
    setIsSearchOpen(false);
    if (!q) return;
    // navigate to shop with keyword (SPA navigation)
    navigate(`/shop?keyword=${encodeURIComponent(q)}`);
  };

  // debounce search
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      return;
    }
    let mounted = true;
    setSuggestLoading(true);
    const timer = setTimeout(async () => {
      try {
        // fetch limited results
        const res = await fetch(`/api/products?keyword=${encodeURIComponent(searchQuery)}&limit=6`);
        const data = await res.json();
        if (mounted) setSuggestions(data.products || []);
      } catch (e) {
        if (mounted) setSuggestions([]);
      } finally {
        if (mounted) setSuggestLoading(false);
      }
    }, 300);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const IconButton = ({ icon: Icon, label, onClick, className = '', badgeCount = 0 }) => (
    <button
      aria-label={label}
      onClick={onClick}
      className={`relative p-2 text-gray-700 hover:text-rose-600 transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-opacity-50 rounded-lg hover:bg-rose-50 active:scale-95 ${className}`}
    >
      <Icon size={20} strokeWidth={1.75} />
      {badgeCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">{badgeCount}</span>
      )}
    </button>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-500 ease-in-out ${isScrolled ? 'shadow-lg border-b border-gray-100' : 'shadow-sm border-b border-gray-50'}`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center md:hidden">
              <IconButton icon={isMenuOpen ? X : Menu} label="Toggle Menu" onClick={() => setIsMenuOpen(!isMenuOpen)} className="mr-2" />
            </div>
            <div className="flex-grow md:flex-grow-0 flex justify-center md:justify-start">
              <Link to="/" className="text-3xl font-black tracking-tight text-gray-900 hover:text-rose-600 transition-colors duration-300 transform hover:scale-105 uppercase whitespace-nowrap">
                ETRO
                <span className="block w-4 h-0.5 bg-rose-600 mx-auto mt-1"></span>
              </Link>
            </div>
            <nav className="hidden md:flex items-center space-x-8 mx-8 flex-grow justify-center">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.href} className="relative text-sm font-semibold text-gray-700 hover:text-rose-600 transition-colors duration-300 tracking-wide uppercase group py-2">
                  {link.name}
                  {link.isNew && <span className="absolute -top-2 -right-4 bg-green-500 text-white text-xs px-1 rounded">NEW</span>}
                  {link.isSale && <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs px-1 rounded">SALE</span>}
                </Link>
              ))}
            </nav>
            <div className="flex items-center space-x-1 md:space-x-3">
              <IconButton icon={Search} label="Search" onClick={() => setIsSearchOpen(true)} className="search-button" />
              {user ? (
                <>
                  <Link to="/profile"><IconButton icon={User} label="Account" /></Link>
                  <IconButton icon={LogOut} label="Logout" onClick={() => { logout(); navigate('/'); }} />
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="hidden sm:flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Sign In
                  </Link>
                  <Link to="/login" className="sm:hidden">
                    <IconButton icon={User} label="Login" />
                  </Link>
                </>
              )}
              <Link to="/wishlist" className="hidden sm:block"><IconButton icon={Heart} label="Wishlist" badgeCount={wishlistCount} /></Link>
              <Link to="/cart"><IconButton icon={ShoppingBag} label="Shopping Bag" badgeCount={cartItemsCount} /></Link>
            </div>
          </div>
        </div>

        {isSearchOpen && (
          <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-md">
            <div ref={searchRef} className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl pt-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Search</h2>
                <button onClick={() => setIsSearchOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} className="text-gray-600" />
                </button>
              </div>
                <div className="relative mb-8">
                  <div className="rounded-full bg-white shadow-sm border border-gray-200 px-4 py-2 flex items-center">
                    <Search className="text-gray-400 mr-3 flex-shrink-0" size={20} />
                    <input
                      type="text"
                      aria-label="Search products"
                      placeholder="Search products, collections, brands..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') navigateSearch(searchQuery);
                      }}
                      className="flex-1 text-lg placeholder-gray-400 bg-transparent focus:outline-none"
                      autoFocus
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery('')} className="ml-3 text-sm text-gray-500 hover:text-gray-700">Clear</button>
                    )}
                  </div>
                </div>
              {searchQuery === '' && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Popular Searches</h3>
                  <div className="flex flex-wrap gap-3">
                    {searchSuggestions.map((s, i) => (
                      <button key={i} onClick={() => setSearchQuery(s)} className="px-4 py-2 bg-gray-100 hover:bg-rose-50 text-gray-700 hover:text-rose-600 rounded-full transition-colors duration-200">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {searchQuery !== '' && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Results</h3>
                  <div className="bg-white rounded-lg shadow-md divide-y overflow-hidden">
                    {suggestLoading && (
                      <div className="p-4 text-sm text-gray-500">Searching...</div>
                    )}
                    {!suggestLoading && suggestions.length === 0 && (
                      <div className="p-4 text-sm text-gray-500">No results. Press Enter to search all products.</div>
                    )}
                    {!suggestLoading && suggestions.map((p) => (
                      <button key={p._id} onClick={() => navigateSearch(p.name)} className="w-full text-left p-3 hover:bg-gray-50 flex items-center gap-3">
                        <img src={p.image || p.images?.[0] || '/images/placeholder.png'} alt={p.name} className="w-12 h-12 object-cover rounded-md" />
                        <div>
                          <div className="font-medium text-gray-900">{p.name}</div>
                          <div className="text-sm text-gray-500">{p.brand} • ₹{p.price.toLocaleString()}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
                <button onClick={() => setIsSearchOpen(false)} className="px-6 py-3 bg-gray-900 text-white hover:bg-gray-800 rounded-full transition-colors duration-200">Close Search</button>
              </div>
            </div>
          </div>
        )}

        <div className={`md:hidden absolute top-full left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-b border-gray-100 transition-all duration-500 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <nav className="flex flex-col items-stretch py-6 px-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.href} className="flex items-center justify-between py-4 px-6 text-gray-700 hover:text-rose-600 hover:bg-rose-50 transition-all duration-300 ease-out rounded-lg font-medium text-lg" onClick={() => setIsMenuOpen(false)}>
                <span>{link.name}</span>
                {link.isNew && <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>}
                {link.isSale && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">SALE</span>}
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-4 pt-4">
              <button onClick={() => { setIsMenuOpen(false); setIsSearchOpen(true); }} className="flex items-center w-full py-4 px-6 text-gray-700 hover:text-rose-600 transition-colors">
                <Search size={18} className="mr-3" />
                Search
              </button>
              {user ? (
                <>
                  <Link to="/profile" className="flex items-center py-4 px-6 text-gray-700 hover:text-rose-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                    <User size={18} className="mr-3" />
                    Profile
                  </Link>
                  <button onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }} className="flex items-center w-full py-4 px-6 text-gray-700 hover:text-rose-600 transition-colors">
                    <LogOut size={18} className="mr-3" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="flex items-center justify-center w-full py-3 px-6 mx-2 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors duration-200 shadow-md" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="flex items-center justify-center w-full py-3 px-6 mx-2 border-2 border-pink-600 text-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition-colors duration-200" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
              <Link to="/wishlist" className="flex items-center py-4 px-6 text-gray-700 hover:text-rose-600 transition-colors" onClick={() => setIsMenuOpen(false)}>
                <Heart size={18} className="mr-3" />
                Wishlist
                <span className="ml-auto bg-rose-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{wishlistCount}</span>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div
        className="fixed top-0 left-0 right-0 z-50 h-1 bg-gradient-to-r from-rose-400 to-rose-600 origin-left transition-transform duration-200 ease-out"
        style={{ transform: `scaleX(${typeof window !== 'undefined' ? (window.scrollY / Math.max(1, (document.body.scrollHeight - window.innerHeight))) : 0})` }}
      ></div>
    </>
  );
};

export default Header;


