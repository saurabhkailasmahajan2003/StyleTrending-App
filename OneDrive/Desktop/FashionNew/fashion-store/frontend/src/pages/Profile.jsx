import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext.jsx';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in to view your profile</h2>
          <Link
            to="/login"
            className="inline-block px-6 py-3 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h2>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-orange-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{user.name}</h3>
                <p className="text-gray-600 mt-1">{user.email}</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="px-4 py-3 bg-gray-50 rounded-md text-gray-900">{user.name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="px-4 py-3 bg-gray-50 rounded-md text-gray-900">{user.email}</div>
            </div>
            {user.isAdmin && (
              <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium">
                Administrator Account
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </button>
            <Link
              to="/"
              className="flex items-center justify-center px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


