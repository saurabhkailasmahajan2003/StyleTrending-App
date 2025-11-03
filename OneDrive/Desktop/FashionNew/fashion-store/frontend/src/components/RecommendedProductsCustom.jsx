import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

const RecommendedProductsCustom = () => {
  const { addToCart } = useCart();
  const { toggle, isWished } = useWishlist();

  const products = [
    { id: 1, image: 'https://5.imimg.com/data5/SELLER/Default/2022/12/KP/DR/GP/158596441/whatsapp-image-2022-12-21-at-5-59-49-pm.jpeg', alt: 'Elegant black blouse with delicate embroidery', isTopSeller: true, rating: 4.8, reviews: 692, title: 'Spezia Top Black', currentPrice: 96.12, originalPrice: 136.0, discount: '30% OFF', category: 'Apparel' },
    { id: 2, image: 'https://img.gem.app/1606349526/1t/1748224115/luna-luz-white-linen-classic-button-down.jpg', alt: 'Striped classic white and black cardigan', isTopSeller: true, rating: 4.5, reviews: 430, title: 'Luna Classic White', currentPrice: 75.0, originalPrice: 100.0, discount: '25% OFF', category: 'Apparel' },
    { id: 3, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlW2eiOvA7bJEPpE-utJpHkrINn_vkWMcUwQ&s', alt: 'Stylish denim jacket with distressed details', isTopSeller: false, rating: 4.7, reviews: 310, title: 'Orion Denim Jacket', currentPrice: 120.0, originalPrice: 150.0, discount: '20% OFF', category: 'Apparel' },
    { id: 4, image: 'https://www.portlandleathergoods.com/cdn/shop/files/verona-tote-medium-coldbrew-1008-Edit.jpg?v=1760638161&width=1445', alt: 'Elegant leather tote bag in a warm color', isTopSeller: true, rating: 4.9, reviews: 580, title: 'Verona Leather Tote', currentPrice: 280.0, originalPrice: 350.0, discount: '20% OFF', category: 'Bags' },
    { id: 5, image: 'https://i.pinimg.com/736x/c1/06/82/c10682a9186142054d14977539491694.jpg', alt: 'Flowy summer maxi skirt with floral print', isTopSeller: false, rating: 4.6, reviews: 210, title: 'Summer Breeze Skirt', currentPrice: 65.0, originalPrice: 80.0, discount: '18.75% OFF', category: 'Apparel' },
    { id: 6, image: 'https://ae01.alicdn.com/kf/S9a8c7e65262b44d491b626091f73c2cb1.jpg', alt: 'Compact leather wallet with metallic clasp', isTopSeller: true, rating: 4.7, reviews: 390, title: 'Eclat Wallet', currentPrice: 45.0, originalPrice: 60.0, discount: '25% OFF', category: 'Accessories' },
    { id: 7, image: 'https://m.media-amazon.com/images/I/71LVgc8MSOL._UY350_.jpg', alt: 'Stylish oversized sunglasses for women', isTopSeller: false, rating: 4.3, reviews: 150, title: 'Aura Sunglasses', currentPrice: 85.0, originalPrice: 110.0, discount: '22.7% OFF', category: 'Accessories' },
    { id: 8, image: 'https://image.made-in-china.com/202f0j00ADNBpVFWlioU/High-Slit-Wide-Leg-Women-Office-Casual-Elegant-Trousers-Chic-Palazzo-Pants.webp', alt: 'Tailored wide-leg trousers in a neutral tone', isTopSeller: true, rating: 4.8, reviews: 420, title: 'Chic Palazzo Pants', currentPrice: 110.0, originalPrice: 140.0, discount: '21.4% OFF', category: 'Apparel' },
    { id: 9, image: 'https://m.media-amazon.com/images/I/71WmhYPluNL._AC_AC_SY350_QL65_.jpg', alt: 'Warm wool beanie hat in a vibrant color', isTopSeller: false, rating: 4.4, reviews: 95, title: 'Cozy Knit Beanie', currentPrice: 30.0, originalPrice: 40.0, discount: '25% OFF', category: 'Accessories' }
  ];

  const toCartProduct = (p) => ({ _id: String(p.id), name: p.title, price: p.currentPrice, images: [p.image] });

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">Recommended for you</h2>
          <Link to="/shop" className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors duration-200">See All</Link>
        </div>
        <div className="flex overflow-x-auto gap-4 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 lg:gap-8 pb-4">
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-64 sm:w-72 md:w-auto bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden">
              <div className="relative h-64 w-full overflow-hidden group">
                <img src={product.image} alt={product.alt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                {product.isTopSeller && (
                  <span className="absolute top-2 left-2 bg-pink-600 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">Top Seller</span>
                )}
                <button
                  onClick={(e) => { e.preventDefault(); toggle(String(product.id)); }}
                  aria-label="Add to favorites"
                  className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:scale-110 transition-all duration-200 z-10"
                >
                  <Heart size={18} strokeWidth={1.5} className={isWished(String(product.id)) ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-500'} />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Star size={16} fill="gold" stroke="gold" className="mr-1" />
                  <span>{product.rating} ({product.reviews})</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1 leading-tight">{product.title}</h3>
                <div className="flex items-baseline mb-3">
                  <span className="text-xl font-bold text-gray-900">${product.currentPrice.toFixed(2)}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice.toFixed(2)}</span>
                      <span className="text-sm text-red-500 font-medium ml-2">{product.discount}</span>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => addToCart(toCartProduct(product), 1)} className="flex-1 py-2 px-4 bg-rose-500 text-white font-semibold rounded-lg hover:bg-rose-600 active:scale-98 transition-all duration-200 shadow-md">Add to Cart</button>
                  <Link to={`/product/${product.id}`} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200">View</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedProductsCustom;


