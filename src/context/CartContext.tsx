import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import type { CartItem, Product } from '../types';
import { getProductPrice, getProductImageForName } from '../lib/sweetStore';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, weightOption?: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  removeFromCart: (cartKey: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('svk-cart');
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved) as CartItem[];
      return parsed.map((item) => {
        const selectedWeight = item.selectedWeight || '250g';
        const imageUrl = item.imageUrl || getProductImageForName(item.name);
        const price = item.price && item.price > 0 ? item.price : getProductPrice(item, selectedWeight);
        return {
          ...item,
          selectedWeight,
          imageUrl,
          price,
          cartKey: item.cartKey || `${item.id}__${selectedWeight}`,
        };
      });
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const normalized = items.map((it) => ({ ...it, cartKey: it.cartKey || `${it.id}__${it.selectedWeight || '250g'}` }));
      localStorage.setItem('svk-cart', JSON.stringify(normalized));
    }
  }, [items]);

  const addToCart = (product: Product, weightOption?: string) => {
    const selectedWeight = weightOption ?? product.weightOptions?.split(',')[0] ?? '250g';
    const price = getProductPrice(product, selectedWeight);
    const imageUrl = product.imageUrl || getProductImageForName(product.name);
    const cartKey = `${product.id}__${selectedWeight}`;
    setItems((current) => {
      const existing = current.find((item) => item.cartKey === cartKey);
      if (existing) {
        return current.map((item) => item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1, price, imageUrl } : item);
      }
      return [...current, { ...product, quantity: 1, selectedWeight, price, imageUrl, cartKey }];
    });
    try {
      toast.success(`${product.name} (${selectedWeight}) added to cart`, { autoClose: 1200 });
    } catch {
      // ignore toast errors in SSR or unsupported env
    }
  };

  const updateQuantity = (cartKey: string, quantity: number) => {
    setItems((current) => current.map((item) => (item.cartKey === cartKey ? { ...item, quantity: Math.max(0, quantity) } : item)).filter((item) => item.quantity > 0));
  };

  const removeFromCart = (cartKey: string) => {
    setItems((current) => current.filter((item) => item.cartKey !== cartKey));
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  return <CartContext.Provider value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, itemCount, subtotal }}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
