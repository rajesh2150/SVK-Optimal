import { Link } from 'react-router-dom';
import { ShoppingBag, Star } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { getProductImageForName, getProductPrice } from '../lib/sweetStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, items } = useCart();
  const imageSrc = getProductImageForName(product.name);
  const isInCart = items.some((item) => item.id === product.id);

  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/products/${product.id}`}>
        <img src={imageSrc} alt={product.name} className="h-56 w-full object-cover" />
      </Link>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[#FFF7D6] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#8B4513]">{product.categoryName || 'Sweet'}</span>
          {product.bestSeller && <span className="text-sm font-semibold text-[#D4AF37]">Best Seller</span>}
        </div>
        <Link to={`/products/${product.id}`}>
          <h3 className="mt-4 text-xl font-semibold text-stone-900">{product.name}</h3>
        </Link>
        <p className="mt-2 text-sm leading-6 text-stone-600">{product.description?.slice(0, 90)}...</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">Starting at</p>
            <p className="text-2xl font-semibold text-[#8B4513]">₹{getProductPrice(product, '250g')}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <Star size={16} className="fill-[#D4AF37] text-[#D4AF37]" /> {product.rating?.toFixed(1) || '4.8'}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between">
          {isInCart ? (
            <Link to="/cart" className="flex items-center justify-center rounded-full bg-[#8B4513] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f3410]">
              Go to Cart
            </Link>
          ) : (
            <button onClick={() => addToCart(product)} className="flex items-center gap-2 rounded-full bg-[#8B4513] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#6f3410]">
              <ShoppingBag size={16} /> Add to Cart
            </button>
          )}
          <Link to={`/products/${product.id}`} className="text-sm font-semibold text-[#D4AF37]">View Details</Link>
        </div>
      </div>
    </div>
  );
};
