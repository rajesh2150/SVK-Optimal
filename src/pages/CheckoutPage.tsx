import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import { createOrderDocument, getOrdersOnce } from '../lib/orderService';

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Please enter your name'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  deliveryAddress: z.string().min(10, 'Please enter your delivery address'),
  houseNumber: z.string().optional(),
  street: z.string().optional(),
  landmark: z.string().optional(),
  village: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  paymentMethod: z.enum(['RAZORPAY']),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [submittedOrder, setSubmittedOrder] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema), defaultValues: { paymentMethod: 'RAZORPAY' } });
  const CHECKOUT_FORM_ID = 'checkout-form';
  const watchedPhone = watch('phone');
  const [matchedOrders, setMatchedOrders] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const placeOrderInFirebase = async (values: CheckoutFormValues, deliveryAddress: string, paymentStatus: string, orderStatus: 'Pending' | 'Accepted' | 'Rejected' | 'Delivered' | 'Out for delivery' | 'On the way' | 'Cancelled', paymentMethod: string) => {
    const primaryItem = items[0];
    const result = await createOrderDocument({
      customerName: values.customerName,
      phoneNumber: values.phone,
      address: deliveryAddress,
      pincode: values.pincode || '',
      sweetName: primaryItem?.name || 'Palakova',
      quantity: primaryItem?.selectedWeight || '250g',
      price: subtotal,
      paymentStatus,
      orderStatus,
      paymentMethod,
      imageUrl: primaryItem?.imageUrl,
      orderNumber: `SVK-${Date.now().toString().slice(-6)}`,
    });

    clearCart();
    setSubmittedOrder(result.orderNumber);
    window.dispatchEvent(new CustomEvent('svk:new-order', { detail: { id: result.id, orderNumber: result.orderNumber } }));
    setTimeout(() => navigate(`/track-order?order=${result.orderNumber}`), 1200);
    return result;
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    const manualAddress = [values.houseNumber, values.street, values.landmark, values.village, values.city, values.state, values.pincode]
      .filter(Boolean)
      .join(', ');
    const deliveryAddress = manualAddress.trim().length >= 10 ? manualAddress : values.deliveryAddress;

    if (values.paymentMethod === 'RAZORPAY') {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: Math.round(subtotal * 100), currency: 'INR', receipt: `rcpt_${Date.now()}` }),
        });

        const rawText = await response.text();
        let payload: any = null;
        try {
          payload = rawText ? JSON.parse(rawText) : null;
        } catch {
          throw new Error('Invalid response from Razorpay order API.');
        }

        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || 'Unable to start Razorpay payment.');
        }

        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Unable to load Razorpay script.'));
          document.body.appendChild(script);
        });

        const options = {
          key: payload.key_id,
          amount: payload.order.amount,
          currency: payload.order.currency,
          name: 'SVK Sweets',
          description: 'Order payment',
          order_id: payload.order.id,
          prefill: {
            name: values.customerName,
            contact: values.phone,
            email: '',
          },
          handler: async (response: any) => {
            try {
              const verifyResponse = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const verifyText = await verifyResponse.text();
              let verifyPayload: any = null;
              try {
                verifyPayload = verifyText ? JSON.parse(verifyText) : null;
              } catch {
                throw new Error('Unable to verify Razorpay payment.');
              }

              if (!verifyResponse.ok || !verifyPayload?.ok) {
                throw new Error(verifyPayload?.error || 'Payment verification failed.');
              }

              await placeOrderInFirebase(values, deliveryAddress, 'Paid', 'Pending', 'RAZORPAY');
              toast.success('Payment successful and order placed');
            } catch (error) {
              console.error('Razorpay checkout failed after payment', error);
              toast.error(error instanceof Error ? error.message : 'Payment failed.');
            }
          },
          modal: { escape: false },
        } as any;

        const Razorpay = (window as any).Razorpay;
        if (!Razorpay) {
          throw new Error('Razorpay SDK not available.');
        }

        const rzp = new Razorpay(options);
        rzp.open();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to place order. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      await placeOrderInFirebase(values, deliveryAddress, 'Pending', 'Pending', 'RAZORPAY');
      toast.success('Order placed successfully');
    } catch (error) {
      console.error('Checkout submission failed', error);
      toast.error(error instanceof Error ? error.message : 'Unable to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!watchedPhone || watchedPhone.trim().length < 4) {
      setMatchedOrders([]);
      return;
    }

    const loadMatches = async () => {
      const all = await getOrdersOnce();
      setMatchedOrders(all.filter((order) => order.phone?.includes(watchedPhone.trim())));
    };

    void loadMatches();
  }, [watchedPhone]);

  if (!items.length) {
    return <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center shadow-sm"><h1 className="text-3xl font-semibold text-stone-900">Your cart is empty</h1><p className="mt-3 text-stone-600">Add items before checkout.</p></div>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-stone-900">Checkout</h1>
        <form id={CHECKOUT_FORM_ID} className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm font-semibold text-stone-700">Customer name</label>
            <input {...register('customerName')} className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none" />
            {errors.customerName && <p className="mt-2 text-sm text-red-500">{errors.customerName.message}</p>}
          </div>
          <div>
            <label className="text-sm font-semibold text-stone-700">Phone number</label>
            <input {...register('phone')} className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none" />
            {errors.phone && <p className="mt-2 text-sm text-red-500">{errors.phone.message}</p>}
            {matchedOrders.length > 0 && (
              <div className="mt-3 space-y-2 rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm">
                <p className="font-semibold">Previous orders matching this number</p>
                {matchedOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <span>{order.orderNumber} · {order.deliveryAddress}</span>
                    <a href={`/track-order?order=${order.orderNumber}`} className="text-[#8B4513] font-semibold">Track</a>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-sm font-semibold text-stone-700">Delivery address</label>
            <textarea {...register('deliveryAddress')} rows={4} placeholder="Full HNo, street, landmark, village, city, state, pincode" className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none" />
            {errors.deliveryAddress && <p className="mt-2 text-sm text-red-500">{errors.deliveryAddress.message}</p>}
            <button type="button" onClick={() => {
              if (!navigator.geolocation) return;
              navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                try {
                  const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
                  const data = await resp.json();
                  const addr = data.address || {};
                  setValue('houseNumber', addr.house_number || '');
                  setValue('street', addr.road || addr.pedestrian || '');
                  setValue('landmark', addr.suburb || addr.neighbourhood || addr.village || '');
                  setValue('village', addr.village || addr.town || addr.suburb || '');
                  setValue('city', addr.city || addr.town || addr.village || '');
                  setValue('state', addr.state || '');
                  setValue('pincode', addr.postcode || '');
                  const formatted = data.display_name || `Current location: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
                  setValue('deliveryAddress', formatted);
                } catch {
                  const coords = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
                  setValue('deliveryAddress', `Current location: ${coords}`);
                }
              }, () => {
                // ignore location errors for now
              });
            }} className="mt-3 rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-200">Use current location</button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-stone-700">House / Flat no.</label>
              <input {...register('houseNumber')} className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700">Street name</label>
              <input {...register('street')} className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700">Landmark</label>
              <input {...register('landmark')} className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700">Village / locality</label>
              <input {...register('village')} className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700">City</label>
              <input {...register('city')} className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700">State</label>
              <input {...register('state')} className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none" />
            </div>
            <div>
              <label className="text-sm font-semibold text-stone-700">Pincode</label>
              <input {...register('pincode')} className="mt-2 w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 outline-none" />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-stone-700">Payment option</label>
            <div className="mt-3 rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold text-stone-700">
              Online payment only — Razorpay will be used for checkout.
            </div>
            <details className="mt-3 hidden rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700 md:block">
              <summary className="font-semibold">Razorpay Test Integration (read before testing)</summary>
              <div className="mt-2 space-y-2">
                <p>This app uses Razorpay in Test Mode for integration testing. Use only Test API keys and test cards/UPI flows. No real money is charged.</p>
                <p className="text-xs text-stone-500">Helpful: use UPI ID <code>success@razorpay</code> for successful UPI test, or test cards from Razorpay docs.</p>
                <p className="text-xs"><a href="https://razorpay.com/docs/build/llm-docs/payments/payment-gateway/web-integration/custom/go-live-checklist.md" target="_blank" rel="noreferrer" className="text-[#8B4513] font-semibold">Razorpay integration docs</a></p>
              </div>
            </details>
          </div>
          <button disabled={isSubmitting} className="hidden w-full rounded-full bg-[#8B4513] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 lg:inline-flex" type="submit">
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </button>
        </form>
        {submittedOrder && <p className="mt-4 text-sm font-semibold text-emerald-600">Order placed successfully. Tracking ID: {submittedOrder}</p>}
      </div>
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-stone-900">Order Summary</h2>
        <div className="mt-6 space-y-3">
          {items.map((item) => <div key={`${item.id}-${item.selectedWeight}`} className="flex items-center justify-between text-sm text-stone-600"><span>{item.name} × {item.quantity}</span><span>₹{item.price * item.quantity}</span></div>)}
        </div>
        <div className="mt-6 border-t border-stone-200 pt-4 flex items-center justify-between text-lg font-semibold text-stone-900"><span>Total</span><span>₹{subtotal}</span></div>
      </div>
      <button disabled={isSubmitting} type="submit" form={CHECKOUT_FORM_ID} className="mt-4 w-full rounded-full bg-[#8B4513] px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70 lg:hidden">
        {isSubmitting ? 'Processing...' : 'Place Order'}
      </button>
    </div>
  );
};

export default CheckoutPage;
