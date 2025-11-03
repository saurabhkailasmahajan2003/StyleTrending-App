import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loader from './Loader.jsx';
import ProductCard from './ProductCard.jsx';
import { fetchProducts } from '../api/productAPI.js';

const RecommendedProducts = () => {
  const [data, setData] = useState({ products: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Use onSale or isNewArrival as a heuristic for recommending
      const res = await fetchProducts({ limit: 8, onSale: true });
      setData(res);
      setLoading(false);
    })();
  }, []);

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Recommended for you</h2>
          <Link to="/shop?sale=true" className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors duration-200">See All</Link>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {data.products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendedProducts;


