import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { items, removeFromCart, updateQty, totals } = useCart();
  const navigate = useNavigate();
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart</h2>
      {items.length === 0 ? (
        <p className="text-gray-700">Cart is empty. <Link className="text-indigo-600" to="/shop">Go shopping</Link></p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 divide-y divide-gray-100">
            {items.map((i) => (
              <div key={i.product} className="grid grid-cols-[80px_1fr_120px_90px_90px] items-center gap-3 py-3">
                <img className="w-20 h-20 object-cover rounded border border-gray-200" src={i.data?.images?.[0] || 'https://via.placeholder.com/80'} alt={i.data?.name} />
                <Link className="text-gray-900 hover:text-indigo-600" to={`/product/${i.product}`}>{i.data?.name}</Link>
                <div className="text-gray-900">${i.data?.price}</div>
                <input className="w-20 rounded-md border border-gray-200 px-2 py-1" type="number" min="1" value={i.qty} onChange={(e) => updateQty(i.product, Number(e.target.value))} />
                <button className="px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50" onClick={() => removeFromCart(i.product)}>Remove</button>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-gray-100 p-4 h-max shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">Summary</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <div className="flex justify-between"><span>Items</span><span>${totals.itemsPrice.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>${totals.taxPrice.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>${totals.shippingPrice.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>${totals.totalPrice.toFixed(2)}</span></div>
            </div>
            <button className="mt-3 w-full px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}


