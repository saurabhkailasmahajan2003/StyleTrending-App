import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignInModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleSignIn = () => {
    onClose();
    navigate('/login');
  };

  const handleSignUp = () => {
    onClose();
    navigate('/register');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>

          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-pink-100 mb-4">
              <svg
                className="h-8 w-8 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h3>
            <p className="text-gray-600 mb-6">
              Please sign in to add items to your cart or wishlist
            </p>

            <div className="space-y-3">
              <button
                onClick={handleSignIn}
                className="w-full py-3 px-4 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="w-full py-3 px-4 bg-white border-2 border-pink-600 text-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition-colors duration-200"
              >
                Create Account
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

