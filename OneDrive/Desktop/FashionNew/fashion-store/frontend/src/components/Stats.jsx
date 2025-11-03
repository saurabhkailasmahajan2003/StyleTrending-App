import { motion } from 'framer-motion';

const stats = [
  {
    value: '20K+',
    label: 'Fashion Products',
    icon: '👕'
  },
  {
    value: '50+',
    label: 'Premium Brands',
    icon: '✨'
  },
  {
    value: '24/7',
    label: 'Customer Support',
    icon: '💬'
  },
  {
    value: '100K+',
    label: 'Happy Customers',
    icon: '😊'
  }
];

export default function Stats() {
  return (
    <section className="py-12 bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}