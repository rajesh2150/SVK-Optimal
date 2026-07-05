import { Link, NavLink } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/track-order', label: 'Track Order' },
];

export const Header = () => {
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8B4513] text-lg font-semibold text-white">SV</div>
          <div>
            <p className="text-lg font-semibold text-stone-900">SVK Sweets</p>
            <p className="text-sm text-stone-500">Traditional Indian sweets</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'font-semibold text-[#8B4513]' : 'text-stone-600 hover:text-[#8B4513]')}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/cart" className="relative rounded-full border border-stone-200 p-2.5 text-stone-700">
            <ShoppingBag size={18} />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-semibold text-stone-900">{itemCount}</span>
          </Link>
          <button className="rounded-full border border-stone-200 p-2.5 text-stone-700 md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-stone-200 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => (isActive ? 'font-semibold text-[#8B4513]' : 'text-stone-600')} onClick={() => setOpen(false)}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
