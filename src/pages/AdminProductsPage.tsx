import { useEffect, useState } from 'react';
import { getDefaultCategories, getDefaultProducts, getStoredCategories, getStoredProducts, saveCategories, saveProducts, getProductImageForName, getProductPrice } from '../lib/sweetStore';
import type { Category, Product } from '../types';

const imageOptions = [
  { label: 'Palakova', value: 'palakova' },
  { label: 'Milk Sweets', value: 'milk' },
  { label: 'Dry Fruit Sweets', value: 'dryfruit' },
];

const AdminProductsPage = () => {
  const [categories, setCategories] = useState<Category[]>(() => getStoredCategories());
  const [products, setProducts] = useState<Product[]>(() => getStoredProducts());
  const [categoryName, setCategoryName] = useState('');
  const [productForm, setProductForm] = useState({ id: 0, name: '', price: '0', stock: '20', description: '', imageKey: 'palakova', active: true, featured: false, bestSeller: false, categoryName: 'Palakova' });

  useEffect(() => {
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

  useEffect(() => {
    saveProducts(products);
  }, [products]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  const submitProduct = () => {
    const price = Number(productForm.price);
    if (!productForm.name.trim() || Number.isNaN(price)) return;

    const imageName = productForm.imageKey === 'milk' ? 'Milk Sweets' : productForm.imageKey === 'dryfruit' ? 'Dry Fruit Sweets' : 'Palakova';
    const productPayload: Product = {
      id: productForm.id || Date.now(),
      name: productForm.name.trim(),
      description: productForm.description || 'Freshly prepared sweet.',
      price,
      stock: Number(productForm.stock || 20),
      imageUrl: getProductImageForName(imageName),
      active: productForm.active,
      featured: productForm.featured,
      bestSeller: productForm.bestSeller,
      categoryName: productForm.categoryName,
      weightOptions: '250g,500g,1kg',
      rating: 4.8,
      reviewCount: 120,
    };

    if (productForm.id) {
      setProducts((current) => current.map((product) => product.id === productForm.id ? productPayload : product));
    } else {
      setProducts((current) => [productPayload, ...current]);
    }

    setProductForm({ id: 0, name: '', price: '0', stock: '20', description: '', imageKey: 'palakova', active: true, featured: false, bestSeller: false, categoryName: 'Palakova' });
  };

  const editProduct = (product: Product) => {
    setProductForm({
      id: product.id,
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description || '',
      imageKey: product.name.toLowerCase().includes('milk') ? 'milk' : product.name.toLowerCase().includes('dry') ? 'dryfruit' : 'palakova',
      active: product.active ?? true,
      featured: product.featured ?? false,
      bestSeller: product.bestSeller ?? false,
      categoryName: product.categoryName || 'Palakova',
    });
  };

  const deleteProduct = (productId: number) => {
    setProducts((current) => current.filter((product) => product.id !== productId));
  };

  const addCategory = () => {
    if (!categoryName.trim()) return;
    const nextCategory: Category = { id: Date.now(), name: categoryName.trim(), description: 'Custom shop category', imageUrl: getProductImageForName(categoryName), active: true };
    setCategories((current) => [nextCategory, ...current]);
    setCategoryName('');
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-stone-900">Manage Products</h1>
        <p className="mt-3 text-stone-600">Create and edit your product catalog from one place.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-stone-900">Add / edit product</h2>
          <div className="mt-6 space-y-4">
            <input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} placeholder="Product name" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3" />
            <input value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price (for 250g)" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3" />
            <input value={productForm.stock} onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))} placeholder="Stock" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3" />
            <input value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3" />
            <select value={productForm.categoryName} onChange={(event) => setProductForm((current) => ({ ...current, categoryName: event.target.value }))} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
            </select>
            <select value={productForm.imageKey} onChange={(event) => setProductForm((current) => ({ ...current, imageKey: event.target.value }))} className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              {imageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex items-center gap-2 text-sm text-stone-700"><input type="checkbox" checked={productForm.active} onChange={() => setProductForm((current) => ({ ...current, active: !current.active }))} /> Available</label>
              <label className="flex items-center gap-2 text-sm text-stone-700"><input type="checkbox" checked={productForm.featured} onChange={() => setProductForm((current) => ({ ...current, featured: !current.featured }))} /> Featured</label>
              <label className="flex items-center gap-2 text-sm text-stone-700"><input type="checkbox" checked={productForm.bestSeller} onChange={() => setProductForm((current) => ({ ...current, bestSeller: !current.bestSeller }))} /> Best seller</label>
            </div>
            <button onClick={submitProduct} className="rounded-full bg-[#8B4513] px-5 py-3 font-semibold text-white">{productForm.id ? 'Save product' : 'Add product'}</button>
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-stone-900">Categories</h2>
          <div className="mt-6 space-y-4">
            <input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="New category" className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3" />
            <button onClick={addCategory} className="rounded-full bg-[#8B4513] px-5 py-3 font-semibold text-white">Add category</button>
          </div>
          <div className="mt-6 space-y-3">
            {categories.map((category) => <div key={category.id} className="rounded-2xl border border-stone-200 px-4 py-3 text-sm text-stone-700">{category.name}</div>)}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Product catalog</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">Product list</h2>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {products.map((product) => (
            <div key={product.id} className="flex flex-col gap-3 rounded-2xl border border-stone-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-stone-900">{product.name}</p>
                <p className="text-sm text-stone-500">Starting at ₹{getProductPrice(product, '250g')} · Stock {product.stock} · {product.active ? 'Available' : 'Out of stock'}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => editProduct(product)} className="rounded-full border border-stone-300 px-3 py-2 text-sm font-semibold text-stone-700">Edit</button>
                <button onClick={() => deleteProduct(product.id)} className="rounded-full border border-red-200 px-3 py-2 text-sm font-semibold text-red-600">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;
