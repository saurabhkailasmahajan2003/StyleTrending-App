import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchProducts } from '../api/productAPI.js';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';
import ElegantFashionHero from '../components/Hero/ElegantFashionHero.jsx';
import RecommendedProductsCustom from '../components/RecommendedProductsCustom.jsx';
import CategoryShowcase from '../components/CategoryShowcase.jsx';
import FeaturedCollection from '../components/FeaturedCollection.jsx';
import Stats from '../components/Stats.jsx';
import FashionBlog from '../components/FashionBlog.jsx';

export default function Home() {
  const [data, setData] = useState({ products: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetchProducts({ limit: 8, isNewArrival: true });
      setData(res);
      setLoading(false);
    })();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ElegantFashionHero />
      
      {/* Stats Section */}
      <Stats />

      {/* Featured Collections */}
      <FeaturedCollection />
      
      {/* Recommended Products */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-4"
            >
              Recommended For You
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Curated picks based on your style preferences
            </motion.p>
          </div>
          <RecommendedProductsCustom />
        </div>
      </div>

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* New Arrivals */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold mb-4"
            >
              New Arrivals
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Be the first to shop our latest collections
            </motion.p>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {data.products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Fashion Blog Section */}
      <FashionBlog />
    </motion.div>
  );
}


