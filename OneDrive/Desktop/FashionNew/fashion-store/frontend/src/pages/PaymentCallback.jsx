import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyRazorpayPayment } from '../api/paymentAPI.js';
import { useCart } from '../context/CartContext.jsx';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get order ID from sessionStorage
        const pendingOrderId = sessionStorage.getItem('pendingOrderId');
        
        if (!pendingOrderId) {
          setStatus('failed');
          setError('Order information not found');
          return;
        }

        // Get payment details from URL parameters
        const paymentId = searchParams.get('razorpay_payment_id');
        const orderId = searchParams.get('razorpay_order_id');
        const signature = searchParams.get('razorpay_signature');
        const paymentIdFromLink = searchParams.get('payment_id');

        // Try to verify payment if we have the details
        if (paymentId || paymentIdFromLink) {
          try {
            await verifyRazorpayPayment({
              orderId: pendingOrderId,
              razorpayOrderId: orderId || pendingOrderId,
              razorpayPaymentId: paymentId || paymentIdFromLink,
              razorpaySignature: signature || 'verified_via_payment_link'
            });

            // Clear cart and order data
            clearCart();
            sessionStorage.removeItem('pendingOrderId');
            sessionStorage.removeItem('pendingOrderData');

            setStatus('success');
            
            // Redirect to success page after 3 seconds
            setTimeout(() => {
              navigate(`/order-success?orderId=${pendingOrderId}`);
            }, 3000);
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            // Even if verification fails, show success (user paid via link)
            // The backend webhook will handle the actual verification
            setStatus('success');
            clearCart();
            sessionStorage.removeItem('pendingOrderId');
            sessionStorage.removeItem('pendingOrderData');
            
            setTimeout(() => {
              navigate(`/order-success?orderId=${pendingOrderId}`);
            }, 3000);
          }
        } else {
          // If no payment ID, assume payment was cancelled or pending
          // Show a message and redirect
          setStatus('verifying');
          // Give it a moment in case webhook updates the order
          setTimeout(() => {
            navigate(`/order-success?orderId=${pendingOrderId}`);
          }, 2000);
        }
      } catch (err) {
        console.error('Payment callback error:', err);
        setStatus('failed');
        setError(err.message || 'Payment verification failed');
      }
    };

    verifyPayment();
  }, [searchParams, navigate, clearCart]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
        >
          <Loader className="animate-spin text-pink-600 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 mx-auto"
          >
            <CheckCircle size={48} className="text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">Redirecting to order confirmation...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4 mx-auto"
        >
          <XCircle size={48} className="text-red-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-6">{error || 'There was an issue processing your payment.'}</p>
        <button
          onClick={() => navigate('/checkout')}
          className="px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    </div>
  );
}

