import { useMemo, useState } from 'react';
import { ShoppingBag, Star, Clock3, PackageOpen, ThermometerSnowflake, Truck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductImageForName, getWeightOptions, getProductPrice, getStoredProducts } from '../lib/sweetStore';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [selectedWeight, setSelectedWeight] = useState('250g');

  const products = getStoredProducts();
  const product = products.find((item) => item.id.toString() === id);
  const weightOptions = useMemo(() => getWeightOptions(product), [product]);
  const imageSrc = getProductImageForName(product?.name || '');

  if (!product) return <div className="rounded-3xl bg-white p-8 text-center text-stone-600">Loading product details...</div>;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm lg:grid-cols-[0.9fr_1.1fr] lg:p-8">
        <div>
          <img src={imageSrc} alt={product.name} className="h-[420px] w-full rounded-[1.5rem] object-cover" />
        </div>
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">{product.categoryName || 'Premium Sweet'}</p>
            <h1 className="mt-3 text-4xl font-semibold text-stone-900">{product.name}</h1>
            <p className="mt-4 text-lg leading-8 text-stone-600">{product.description}</p>
            <div className="mt-5 flex items-center gap-2 text-sm text-stone-500">
              <Star size={16} className="fill-[#D4AF37] text-[#D4AF37]" /> {product.rating?.toFixed(1) || '4.8'} ({product.reviewCount || 120} reviews)
            </div>
            <div className="mt-6 rounded-2xl bg-stone-50 p-4">
                <p className="text-4xl font-semibold text-[#8B4513]">₹{getProductPrice(product, selectedWeight)}</p>
              <p className="mt-2 text-sm text-stone-500">Stock: {product.stock} available</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-stone-700">Select Weight</p>
              <div className="mt-2 flex flex-wrap gap-3">
                {weightOptions.map((weight) => (
                  <button key={weight} onClick={() => setSelectedWeight(weight.trim())} className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedWeight === weight.trim() ? 'bg-[#8B4513] text-white' : 'bg-stone-100 text-stone-700'}`}>
                      {weight.trim()} · ₹{getProductPrice(product, weight.trim())}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => addToCart(product, selectedWeight)} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#8B4513] px-6 py-3 font-semibold text-white transition hover:bg-[#6f3410]">
              <ShoppingBag size={18} /> Add to Cart
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-stone-900">Product details</h2>
          <div className="mt-6 space-y-4 text-sm leading-8 text-stone-600">
            <div><span className="font-semibold text-stone-900">Ingredients:</span> {product.ingredients}</div>
            <div><span className="font-semibold text-stone-900">Shelf Life:</span> {product.shelfLife}</div>
            <div><span className="font-semibold text-stone-900">Storage Instructions:</span> {product.storageInstructions}</div>
            <div><span className="font-semibold text-stone-900">Delivery Time:</span> {product.deliveryTime}</div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-stone-200 bg-[#FFF7D6] p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-stone-900">Why customers love it</h3>
          <div className="mt-4 space-y-4 text-sm leading-7 text-stone-700">
            <div className="flex gap-3"><Clock3 className="mt-1 text-[#8B4513]" /> Freshly prepared and carefully packed for premium quality.</div>
            <div className="flex gap-3"><PackageOpen className="mt-1 text-[#8B4513]" /> Available in 250g, 500g and 1kg formats.</div>
            <div className="flex gap-3"><ThermometerSnowflake className="mt-1 text-[#8B4513]" /> Store in a cool dry place for best texture.</div>
            <div className="flex gap-3"><Truck className="mt-1 text-[#8B4513]" /> Fast doorstep delivery across the city.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
