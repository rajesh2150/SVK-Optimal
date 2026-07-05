import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { ADMIN_AUTH_STORAGE_KEY } from '../lib/sweetStore';

const AdminLayout = ({ children }: { children?: ReactNode }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200 bg-white py-4 shadow-sm">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8B4513] text-white">SV</div>
            <div>
              <p className="text-sm font-semibold text-stone-900">SVK Sweets Admin</p>
              <p className="text-xs text-stone-500">Order and product management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/admin" className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:border-[#8B4513] hover:text-[#8B4513]">
              <LayoutDashboard size={16} /> Dashboard
            </Link>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[2rem] border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Admin panel</p>
              <h1 className="mt-2 text-3xl font-semibold text-stone-900">SVK Orders & products</h1>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link to="/admin/orders" className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 font-semibold text-stone-700 hover:bg-[#FFF7D6]">Orders</Link>
              <Link to="/admin/products" className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 font-semibold text-stone-700 hover:bg-[#FFF7D6]">Products</Link>
              <Link to="/admin/analytics" className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 font-semibold text-stone-700 hover:bg-[#FFF7D6]">Analytics</Link>
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
