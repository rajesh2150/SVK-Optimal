import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Search } from 'lucide-react';
import type { AdminOrder } from '../lib/sweetStore';
import { subscribeToOrders } from '../lib/orderService';

const statusTabs = [
  { value: 'All', label: 'All orders' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'On the way', label: 'On the way' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Delivered', label: 'Delivered' },
];

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToOrders((nextOrders) => setOrders(nextOrders));
    return () => unsubscribe();
  }, []);

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesFilter = filter === 'All' || order.status === filter;
    const matchesSearch = search
      ? order.orderNumber.includes(search) || order.phone.includes(search) || order.customerName.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesFilter && matchesSearch;
  }), [orders, filter, search]);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Orders</p>
            <h1 className="mt-3 text-3xl font-semibold text-stone-900">All customer orders</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by order ID, phone, or name" className="w-full rounded-full border border-stone-200 bg-stone-50 py-3 pl-11 pr-4 text-sm outline-none sm:w-80" />
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {statusTabs.map((tab) => (
            <button key={tab.value} onClick={() => setFilter(tab.value)} className={`rounded-full px-4 py-2 text-sm font-semibold ${filter === tab.value ? 'bg-[#8B4513] text-white' : 'bg-stone-100 text-stone-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <button key={order.id} onClick={() => navigate(`/admin/orders/${order.id}`)} className="w-full rounded-[2rem] border border-stone-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-500">{order.createdAt.slice(0, 10)}</p>
                <h2 className="mt-1 text-2xl font-semibold text-stone-900">{order.orderNumber}</h2>
                <p className="mt-2 text-sm text-stone-600">{order.customerName} · {order.phone}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700">{order.status}</span>
                <span className="rounded-full bg-[#FFF7D6] px-3 py-1 text-sm font-semibold text-[#8B4513]">₹{order.totalAmount}</span>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-sm font-semibold text-stone-700">
                  <ExternalLink size={14} /> View on Maps
                </a>
              </div>
            </div>
          </button>
        ))}
        {!filteredOrders.length && <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-8 text-center text-stone-600">No orders match your search.</div>}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
