import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getOrderTrackingHistory, getProductImageForName } from '../lib/sweetStore';
import { getOrdersOnce } from '../lib/orderService';

const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('order') || '');
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    const allOrders = await getOrdersOnce();
    const trimmedOrderId = orderId.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedOrderId && !trimmedPhone) {
      setOrders([]);
      setError('Please enter an order ID or phone number.');
      return;
    }

    const matches = allOrders.filter((item) => {
      const byOrderId = trimmedOrderId ? item.orderNumber.toLowerCase() === trimmedOrderId.toLowerCase() : true;
      const byPhone = trimmedPhone ? item.phone === trimmedPhone : true;
      return byOrderId && byPhone;
    });

    const sorted = matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (sorted.length) {
      setOrders(sorted);
      setError('');
      setExpandedOrderId(sorted[0].id);
    } else {
      setOrders([]);
      setExpandedOrderId(null);
      setError('No matching orders found.');
    }
  };

  useEffect(() => {
    if (orderId) {
      void handleTrack();
    }
  }, [orderId]);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-stone-900">Track your order</h1>
        <p className="mt-3 text-stone-600">Use your order ID and phone number to see live status.</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Order ID" className="rounded-full border border-stone-200 bg-stone-50 px-4 py-3 outline-none" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className="rounded-full border border-stone-200 bg-stone-50 px-4 py-3 outline-none" />
          <button onClick={handleTrack} className="rounded-full bg-[#8B4513] px-6 py-3 font-semibold text-white">Track</button>
        </div>
      </div>

      {error && <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-600">{error}</div>}

      {orders.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-stone-900">Matched orders</h2>
            <p className="mt-2 text-sm text-stone-600">Expand any order to view full details.</p>
          </div>

          <div className="space-y-4">
            {orders.map((result) => {
              const isExpanded = result.id === expandedOrderId;
              return (
                <div key={result.id} className="rounded-[2rem] border border-stone-200 bg-white shadow-sm">
                  <button
                    onClick={() => setExpandedOrderId(isExpanded ? null : result.id)}
                    className="flex w-full items-center justify-between gap-4 rounded-[2rem] px-6 py-5 text-left"
                  >
                    <div>
                      <p className="text-sm text-stone-500">{new Date(result.createdAt).toLocaleDateString()}</p>
                      <h2 className="mt-1 text-xl font-semibold text-stone-900">Order #{result.orderNumber}</h2>
                      <p className="mt-2 text-sm text-stone-600">Phone: {result.phone} · Status: {result.status}</p>
                    </div>
                    <span className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-700">
                      {isExpanded ? 'Hide details' : 'View details'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-stone-200 px-6 py-6">
                      <div className="flex flex-wrap gap-3 text-sm text-stone-600">
                        <span className="rounded-full bg-stone-100 px-3 py-1">Status: {result.status}</span>
                        <span className="rounded-full bg-stone-100 px-3 py-1">Payment: {result.paymentStatus}</span>
                        <span className="rounded-full bg-stone-100 px-3 py-1">Total: ₹{result.totalAmount}</span>
                      </div>
                      <p className="mt-4 text-lg leading-8 text-stone-600">Delivery address: {result.deliveryAddress}</p>
                      <div className="mt-4 space-y-2 text-sm text-stone-600">
                        {result.items.map((item: any) => (
                          <div key={`${item.productId}-${item.weightOption}`} className="flex items-center gap-3 rounded-2xl bg-stone-50 px-4 py-3">
                            <img src={item.imageUrl || getProductImageForName(item.productName)} alt={item.productName} className="h-16 w-16 rounded-2xl object-cover" />
                            <div className="min-w-0">
                              <p className="font-semibold text-stone-900">{item.productName} · {item.weightOption}</p>
                              <p className="text-sm text-stone-600">Qty: {item.quantity}</p>
                            </div>
                            <span className="ml-auto text-sm font-semibold text-stone-700">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 rounded-2xl bg-stone-50 p-5">
                        <p className="text-sm font-semibold text-stone-700">Order tracking details</p>
                        <div className="mt-4 space-y-3">
                          {getOrderTrackingHistory(result).map((stage) => (
                            <div key={stage.status} className={`rounded-2xl border px-4 py-4 ${stage.completed ? 'border-emerald-200 bg-white' : 'border-stone-200 bg-stone-100'}`}>
                              <div className="flex items-center justify-between gap-4">
                                <p className="font-semibold text-stone-900">{stage.status}</p>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${stage.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'}`}>
                                  {stage.completed ? 'Completed' : 'Pending'}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-stone-600">{stage.description}</p>
                              <p className="mt-2 text-sm font-medium text-stone-700">Location: {stage.location}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrderPage;
