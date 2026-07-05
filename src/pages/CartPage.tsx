import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductImageForName } from '../lib/sweetStore';

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart();

  if (!items.length) {
    return <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm"><h1 className="text-3xl font-semibold text-stone-900">Your cart is empty</h1><p className="mt-3 text-stone-600">Add a few handcrafted sweets to begin your order.</p><Link to="/products" className="mt-6 inline-flex rounded-full bg-[#8B4513] px-6 py-3 font-semibold text-white">Continue shopping</Link></div>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <div key={`${item.id}-${item.selectedWeight}`} className="flex flex-col gap-4 rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <img src={item.imageUrl || getProductImageForName(item.name) || 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&w=900&q=80'} alt={item.name} className="h-24 w-24 rounded-2xl object-cover" />
              <div>
                <h3 className="text-lg font-semibold text-stone-900">{item.name}</h3>
                <p className="text-sm text-stone-500">Weight: {item.selectedWeight}</p>
                <p className="mt-2 text-lg font-semibold text-[#8B4513]">₹{item.price}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-full border border-stone-200">
                <button onClick={() => updateQuantity(item.cartKey || `${item.id}__${item.selectedWeight || '250g'}`, item.quantity - 1)} className="p-2"><Minus size={16} /></button>
                <span className="min-w-10 text-center font-semibold">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.cartKey || `${item.id}__${item.selectedWeight || '250g'}`, item.quantity + 1)} className="p-2"><Plus size={16} /></button>
              </div>
              <button onClick={() => removeFromCart(item.cartKey || `${item.id}__${item.selectedWeight || '250g'}`)} className="rounded-full p-2 text-red-500 hover:bg-red-50"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-stone-900">Order Summary</h2>
        <div className="mt-5 flex items-center justify-between text-stone-600"><span>Subtotal</span><span>₹{subtotal}</span></div>
        <div className="mt-3 flex items-center justify-between text-stone-600"><span>Delivery</span><span>Free</span></div>
        <div className="mt-6 border-t border-stone-200 pt-4 flex items-center justify-between text-lg font-semibold text-stone-900"><span>Total</span><span>₹{subtotal}</span></div>
        <Link to="/checkout" className="mt-6 flex w-full items-center justify-center rounded-full bg-[#8B4513] px-6 py-3 font-semibold text-white">Proceed to Checkout</Link>
      </div>
    </div>
  );
};

export default CartPage;
