import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import PaymentCallback from './pages/PaymentCallback.jsx';
import NotFound from './pages/NotFound.jsx';
import Footer from './components/Footer.jsx';

import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { ModalProvider, useModal } from './context/ModalContext.jsx';
import SignInModal from './components/SignInModal.jsx';

function SignInModalWrapper() {
  const { showSignInModal, closeSignInModal } = useModal();
  return <SignInModal isOpen={showSignInModal} onClose={closeSignInModal} />;
}

function Layout({ children }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <ModalProvider>
        <CartProvider>
          <WishlistProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/payment-callback" element={<PaymentCallback />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
            <SignInModalWrapper />
          </WishlistProvider>
        </CartProvider>
      </ModalProvider>
    </UserProvider>
  );
}


