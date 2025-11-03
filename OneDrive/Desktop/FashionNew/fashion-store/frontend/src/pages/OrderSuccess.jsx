import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Home, ShoppingBag } from 'lucide-react';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
        >
          <CheckCircle size={48} className="text-green-600" />
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 mb-2">
          Thank you for your purchase
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-8">
            Order ID: <span className="font-mono font-semibold">{orderId}</span>
          </p>
        )}

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center gap-2 text-gray-700 mb-4">
            <Package size={20} />
            <span className="font-medium">What's Next?</span>
          </div>
          <ul className="text-left text-sm text-gray-600 space-y-2">
            <li>✓ You will receive a confirmation email shortly</li>
            <li>✓ Your order will be processed and shipped within 2-3 business days</li>
            <li>✓ You can track your order status from your profile</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors"
          >
            <Home size={20} />
            Back to Home
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-pink-600 text-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition-colors"
          >
            <ShoppingBag size={20} />
            Continue Shopping
          </button>
        </div>
      </motion.div>
    </div>
  );
}

