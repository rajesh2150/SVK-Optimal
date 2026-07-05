import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ExternalLink, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { getOrderTrackingHistory, type AdminOrder } from '../lib/sweetStore';
import { deleteOrderDocument, subscribeToOrders, updateOrderDocument } from '../lib/orderService';

const statusOptions: AdminOrder['status'][] = ['Pending', 'Accepted', 'Out for delivery', 'On the way', 'Delivered', 'Rejected', 'Cancelled'];

const AdminOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((nextOrders) => setOrders(nextOrders));
    return () => unsubscribe();
  }, []);

  const order = orders.find((item) => item.id === orderId) ?? null;

  const updateStatus = async (newStatus: AdminOrder['status']) => {
    if (!order) return;
    setIsSaving(true);
    try {
      await updateOrderDocument(order.id, { orderStatus: newStatus });
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item));
      toast.success('Order status updated');
    } catch {
      toast.error('Unable to update order status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAccept = async () => {
    if (!order) return;
    try {
      await updateOrderDocument(order.id, { orderStatus: 'Accepted', paymentStatus: 'Paid' });
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: 'Accepted', paymentStatus: 'Paid', updatedAt: new Date().toISOString() } : item));
      toast.success('Order accepted');
    } catch {
      toast.error('Unable to accept order');
    }
  };

  const handleReject = async () => {
    if (!order) return;
    try {
      await updateOrderDocument(order.id, { orderStatus: 'Rejected', paymentStatus: 'Cancelled' });
      setOrders((current) => current.map((item) => item.id === order.id ? { ...item, status: 'Rejected', paymentStatus: 'Cancelled', updatedAt: new Date().toISOString() } : item));
      toast.success('Order rejected');
    } catch {
      toast.error('Unable to reject order');
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    if (!window.confirm('Delete this order permanently?')) return;
    try {
      await deleteOrderDocument(order.id);
      toast.success('Order deleted');
      navigate('/admin/orders');
    } catch {
      toast.error('Unable to delete order');
    }
  };

  if (!order) {
    return <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm"><h1 className="text-3xl font-semibold text-stone-900">Order not found</h1><p className="mt-3 text-stone-600">Try selecting a different order.</p></div>;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Order detail</p>
            <h1 className="mt-2 text-3xl font-semibold text-stone-900">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-stone-600">{order.customerName} · {order.phone}</p>
          </div>
          <button onClick={() => navigate('/admin/orders')} className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-700">Back to orders</button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_0.85fr]">
        <div className="space-y-6 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-stone-700">Customer</p>
              <p className="mt-2 text-lg font-semibold text-stone-900">{order.customerName}</p>
              <p className="mt-1 text-sm text-stone-600">Phone: {order.phone}</p>
              <p className="mt-3 text-sm text-stone-600">Delivery address: {order.deliveryAddress}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-700">Order info</p>
              <div className="mt-2 space-y-2 text-sm text-stone-600">
                <div className="flex items-center gap-2"><span className="font-semibold text-stone-900">Payment:</span>{order.paymentMethod} · {order.paymentStatus}</div>
                <div className="flex items-center gap-2"><span className="font-semibold text-stone-900">Placed:</span>{new Date(order.createdAt).toLocaleString()}</div>
                <div className="flex items-center gap-2"><span className="font-semibold text-stone-900">Updated:</span>{new Date(order.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-5">
            <p className="text-sm font-semibold text-stone-700">Live order tracking</p>
            <div className="mt-4 space-y-3">
              {getOrderTrackingHistory(order).map((stage) => (
                <div key={stage.status} className={`rounded-2xl border px-4 py-4 ${stage.completed ? 'border-emerald-200 bg-white' : 'border-stone-200 bg-stone-100'}`}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-stone-900">{stage.status}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stage.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'}`}>{stage.completed ? 'Completed' : 'Pending'}</span>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">{stage.description}</p>
                  <p className="mt-2 text-sm font-medium text-stone-700">Location: {stage.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-700">Order status</p>
            <select value={order.status} onChange={(event) => void updateStatus(event.target.value as AdminOrder['status'])} disabled={isSaving} className="mt-4 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-70">
              {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => void handleAccept()} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Accept</button>
              <button onClick={() => void handleReject()} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Reject</button>
              <button onClick={() => void handleDelete()} className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-700">Delete</button>
            </div>
            <div className="mt-5 grid gap-3">
              {order.items.map((item) => (
                <div key={`${item.productId}-${item.weightOption}`} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm text-stone-700">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <img src={item.imageUrl || '/placeholder.png'} alt={item.productName} className="h-24 w-24 rounded-2xl object-cover" />
                      <div>
                        <p className="font-semibold text-stone-900">{item.productName}</p>
                        <p className="text-sm text-stone-500">Weight: {item.weightOption}</p>
                        <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-base font-semibold text-stone-900">₹{item.price * item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-stone-100 px-4 py-4 text-lg font-semibold text-stone-900">
              <span>Total</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>

          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-700">Delivery route</p>
            <div className="mt-4 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
              <div className="flex items-center gap-2"><MapPin size={16} className="text-[#8B4513]" /> <span>{order.deliveryAddress}</span></div>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.deliveryAddress)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-700"><ExternalLink size={16} /> View on Maps</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;
