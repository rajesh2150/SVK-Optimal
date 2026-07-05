import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getOrderTrackingHistory, getProductImageForName } from '../lib/sweetStore';
import { getOrdersOnce } from '../lib/orderService';

const TrackOrderPage = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('order') || '');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleTrack = async () => {
    const orders = await getOrdersOnce();
    const found = orders.find((item) => item.orderNumber === orderId || item.phone === phone);
    if (found) {
      setResult(found);
      setError('');
    } else {
      setResult(null);
      setError('No matching order found.');
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

      {result && (
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-stone-900">Order #{result.orderNumber}</h2>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-600">
            <span className="rounded-full bg-stone-100 px-3 py-1">Status: {result.status}</span>
            <span className="rounded-full bg-stone-100 px-3 py-1">Payment: {result.paymentStatus}</span>
            <span className="rounded-full bg-stone-100 px-3 py-1">Phone: {result.phone}</span>
          </div>
          <p className="mt-6 text-lg leading-8 text-stone-600">Delivery address: {result.deliveryAddress}</p>
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
};

export default TrackOrderPage;
