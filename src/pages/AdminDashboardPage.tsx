import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { toast } from 'react-toastify';
import type { AdminOrder } from '../lib/sweetStore';
import notificationSound from '../assets/universfield-new-notification-057-494255.mp3';
import { subscribeToOrders } from '../lib/orderService';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [notifications, setNotifications] = useState<AdminOrder[]>([]);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const recentAddedOrderIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const onInteraction = () => setHasUserInteracted(true);
    window.addEventListener('click', onInteraction);
    window.addEventListener('keydown', onInteraction);

    const unsubscribe = subscribeToOrders(
      (nextOrders) => {
        setOrders(nextOrders);
        setNotifications(nextOrders.filter((order) => order.status === 'Pending'));
      },
      (newOrder) => {
        if (recentAddedOrderIds.current.has(newOrder.id)) return;
        recentAddedOrderIds.current.add(newOrder.id);

        toast.success(`New order ${newOrder.orderNumber} received`);
        if (hasUserInteracted) {
          playNotificationSound();
        }
      },
    );

    return () => {
      unsubscribe();
      window.removeEventListener('click', onInteraction);
      window.removeEventListener('keydown', onInteraction);
    };
  }, [hasUserInteracted]);

  const recentOrders = useMemo(() => orders.slice(0, 4), [orders]);
  const orderCounts = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((order) => order.status === 'Pending').length,
      accepted: orders.filter((order) => order.status === 'Accepted').length,
      delivered: orders.filter((order) => order.status === 'Delivered').length,
    }),
    [orders],
  );

  const pendingCount = notifications.length;
  const handleViewAllOrders = () => navigate('/admin/orders');
  const handleViewProducts = () => navigate('/admin/products');

  const playNotificationSound = () => {
    try {
      const audio = new Audio(notificationSound as string);
      audio.play().catch(() => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        oscillator.connect(gain);
        gain.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.15, audioCtx.currentTime + 0.02);
        oscillator.start();
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
        oscillator.stop(audioCtx.currentTime + 0.35);
      });
    } catch {
      // Ignore sound issues in unsupported environments.
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-stone-900">Admin Dashboard</h1>
            <p className="mt-3 text-stone-600">Overview of orders, notifications, and quick admin actions.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={handleViewAllOrders} className="rounded-full border border-[#8B4513] bg-[#FFF7D6] px-5 py-3 text-sm font-semibold text-[#8B4513]">View orders</button>
            <button onClick={handleViewProducts} className="rounded-full border border-stone-200 bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-[#FFF7D6]">Manage products</button>
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Bell className="text-[#8B4513]" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Notifications</p>
              <p className="mt-1 text-sm text-stone-600">Pending orders are highlighted for fast review.</p>
            </div>
            {pendingCount > 0 && (
              <span className="rounded-full bg-[#8B4513] px-3 py-1 text-xs font-semibold text-white">{pendingCount}</span>
            )}
          </div>
          <button onClick={handleViewAllOrders} className="inline-flex items-center justify-center rounded-full border border-[#8B4513] px-4 py-2 text-sm font-semibold text-[#8B4513] transition hover:bg-[#FFF7D6]">Open orders</button>
        </div>
        <div className="mt-4 space-y-3">
          {notifications.length ? (
            notifications.map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/admin/orders/${order.id}`)}
                className="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-left text-sm text-stone-700 transition hover:bg-white"
              >
                <span>New order {order.orderNumber} from {order.customerName}</span>
                <span className="font-semibold text-[#8B4513]">Open details</span>
              </button>
            ))
          ) : (
            <p className="text-sm text-stone-500">No new pending orders.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Orders', value: orderCounts.total },
          { label: 'Pending', value: orderCounts.pending },
          { label: 'Accepted', value: orderCounts.accepted },
          { label: 'Delivered', value: orderCounts.delivered },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-stone-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[#8B4513]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Recent orders</p>
              <h2 className="mt-2 text-2xl font-semibold text-stone-900">Latest activity</h2>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                  className="w-full rounded-3xl border border-stone-200 bg-stone-50 p-4 text-left transition hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-stone-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="mt-1 text-lg font-semibold text-stone-900">{order.orderNumber}</p>
                    </div>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-sm text-stone-700">{order.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-stone-600">{order.customerName} · {order.phone}</p>
                </button>
              ))
            ) : (
              <p className="rounded-3xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-500">No recent orders to show.</p>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Quick actions</p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-900">Admin shortcuts</h2>
          </div>
          <div className="mt-6 grid gap-4">
            <button onClick={handleViewAllOrders} className="rounded-3xl border border-stone-200 bg-[#FFF7D6] px-5 py-4 text-left text-sm font-semibold text-[#8B4513]">Manage all orders</button>
            <button onClick={handleViewProducts} className="rounded-3xl border border-stone-200 bg-stone-50 px-5 py-4 text-left text-sm font-semibold text-stone-700">Edit product catalog</button>
            <button onClick={() => navigate('/admin')} className="rounded-3xl border border-stone-200 bg-white px-5 py-4 text-left text-sm font-semibold text-stone-700">Refresh dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
