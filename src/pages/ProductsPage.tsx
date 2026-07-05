import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import type { Category, Product } from '../types';
import { getDefaultCategories, getDefaultProducts, getStoredCategories, getStoredProducts, saveCategories, saveProducts } from '../lib/sweetStore';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const selectedCategory = searchParams.get('category') || '';
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [categories, setCategories] = useState<Category[]>(() => getStoredCategories());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.localStorage.getItem('svk-products')) {
      saveProducts(getDefaultProducts());
      setProducts(getDefaultProducts());
    }
    if (!window.localStorage.getItem('svk-categories')) {
      saveCategories(getDefaultCategories());
      setCategories(getDefaultCategories());
    }
    setProducts(getStoredProducts());
    setCategories(getStoredCategories());
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = !search || product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || product.categoryName === categories.find((c) => c.id.toString() === selectedCategory)?.name;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory, categories]);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearch(q);
  }, [searchParams]);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Our collection</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">Browse premium sweets</h1>
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex items-center gap-3 rounded-full border border-stone-200 bg-stone-50 px-4 py-3 lg:min-w-[320px]">
            <Search size={18} className="text-stone-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="w-full bg-transparent outline-none" />
          </label>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setSearchParams({})} className={`rounded-full px-4 py-2 text-sm font-semibold ${!selectedCategory ? 'bg-[#8B4513] text-white' : 'bg-stone-100 text-stone-600'}`}>All</button>
            {categories.map((category) => (
              <button key={category.id} onClick={() => setSearchParams({ category: category.id.toString() })} className={`rounded-full px-4 py-2 text-sm font-semibold ${selectedCategory === category.id.toString() ? 'bg-[#8B4513] text-white' : 'bg-stone-100 text-stone-600'}`}>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
};

export default ProductsPage;
