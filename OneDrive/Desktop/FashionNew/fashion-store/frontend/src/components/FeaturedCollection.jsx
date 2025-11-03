import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

const collections = [
  {
    title: "Summer Collection '25",
    description: "Embrace the heat with our latest summer essentials",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b",
    category: "Womens",
    bgColor: "bg-amber-50"
  },
  {
    title: "Autumn Essentials",
    description: "Cozy and stylish picks for the changing season",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d",
    category: "Womens",
    bgColor: "bg-rose-50"
  },
  {
    title: "Formal Edit",
    description: "Elevate your professional wardrobe",
    image: "https://images.unsplash.com/photo-1487222477894-8943e31ef7b2",
    category: "Mens",
    bgColor: "bg-slate-50"
  }
];

export default function FeaturedCollection() {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  return (
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Featured Collections</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our carefully curated collections that blend style, comfort, and the latest fashion trends
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((collection, index) => (
          <motion.div
            key={collection.title}
            className={`relative overflow-hidden rounded-2xl ${collection.bgColor} group cursor-pointer`}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
            whileHover={useReducedMotion() ? {} : { scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <Link to={`/shop?category=${collection.category}`}>
              <div className="aspect-[3/4] relative">
                <img
                  loading="lazy"
                  style={{ willChange: 'transform' }}
                  src={collection.image}
                  alt={collection.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 transition-opacity group-hover:bg-opacity-30" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: hoveredIndex === index ? 1 : 0.9,
                      y: hoveredIndex === index ? 0 : 10
                    }}
                    transition={{ duration: 0.3 }}
                    className="bg-white bg-opacity-90 rounded-xl p-4"
                  >
                    <h3 className="text-xl font-semibold mb-2">{collection.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{collection.description}</p>
                    <span className="text-sm font-medium text-blue-600">
                      Explore Collection →
                    </span>
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}