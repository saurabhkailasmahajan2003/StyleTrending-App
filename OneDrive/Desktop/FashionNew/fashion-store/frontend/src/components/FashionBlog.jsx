import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const posts = [
  {
    title: "The Ultimate Guide to Summer Fashion Trends",
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b",
    excerpt: "Discover the hottest trends for this summer season and learn how to style them.",
    date: "Oct 30, 2025"
  },
  {
    title: "Sustainable Fashion: A Guide to Eco-Friendly Shopping",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b",
    excerpt: "Learn how to make environmentally conscious fashion choices without compromising style.",
    date: "Oct 28, 2025"
  },
  {
    title: "Capsule Wardrobe: Less is More",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985",
    excerpt: "Create a versatile wardrobe with fewer pieces that work perfectly together.",
    date: "Oct 25, 2025"
  }
];

export default function FashionBlog() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Fashion Blog</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest fashion trends, style tips, and industry insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <Link to="/blog" className="block">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-500 mb-2">{post.date}</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                  <span className="text-blue-600 font-medium text-sm">Read More →</span>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link
            to="/blog"
            className="inline-block px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
          >
            View All Articles
          </Link>
        </div>
      </div>
    </section>
  );
}