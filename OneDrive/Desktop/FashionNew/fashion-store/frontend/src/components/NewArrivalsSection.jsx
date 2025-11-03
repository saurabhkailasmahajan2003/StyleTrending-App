import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api/productAPI.js';
import Loader from './Loader.jsx';

export default function NewArrivalsSection() {
  const [data, setData] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const res = await fetchProducts({ limit: 8, isNewArrival: true });
    setData(res);
    setLoading(false);
  };

  const categories = ['All', 'Mens', 'Womens', 'Kids'];

  const filteredProducts = data.products.filter(product => 
    activeCategory === 'All' ? true : product.category === activeCategory
  );

  return (
    <section className="relative bg-gradient-to-b from-pink-50 to-white py-20">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-pink-100 rounded-full opacity-20" />
        <div className="absolute -left-10 top-40 w-28 h-28 bg-orange-100 rounded-full opacity-20" />
        <div className="absolute right-1/4 bottom-20 w-32 h-32 bg-pink-100 rounded-full opacity-20" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium mb-4">
              New Season, New Style
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              New Arrivals
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Be the first to shop our latest collections and set trends with exclusive designs
            </p>
          </motion.div>

          {/* Category Filters */}
          <div className="flex justify-center space-x-4 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-pink-200
                  ${activeCategory === category 
                    ? 'bg-pink-600 text-white shadow-sm' 
                    : 'bg-white text-gray-600 hover:bg-pink-50'}`}
                aria-pressed={activeCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
            {filteredProducts.map((product, index) => {
              const content = (
                <Link to={`/product/${product._id}`}>
                  <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-xl bg-gray-100">
                    <img
                      loading="lazy"
                      style={{ willChange: 'transform' }}
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full transition-transform duration-300"
                    />
                    {product.discount && (
                      <div className="absolute top-4 right-4 bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {product.discount}% OFF
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium mb-1 group-hover:text-pink-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-2">{product.brand}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{product.price.toLocaleString()}
                      </span>
                      {product.discount && (
                        <span className="text-sm text-gray-400 line-through">
                          ₹{Math.round(product.price / (1 - product.discount / 100)).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );

              // Only animate first few items to avoid mass repaint on initial load
              if (index < 4) {
                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="group"
                  >
                    {content}
                  </motion.div>
                );
              }

              return (
                <div key={product._id} className="group">
                  {content}
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/shop?isNewArrival=true"
            className="inline-block px-8 py-3 bg-pink-600 text-white rounded-full font-medium hover:bg-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg shadow-pink-200"
          >
            View All New Arrivals
          </Link>
        </motion.div>
      </div>
    </section>
  );
}