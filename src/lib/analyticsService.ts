import { collection, onSnapshot, orderBy, query, Timestamp, type DocumentData, type QueryDocumentSnapshot } from 'firebase/firestore';
import type { AdminOrder } from './sweetStore';
import { db } from './firebase';

const ORDERS_COLLECTION = 'orders';

const toAdminOrder = (docSnap: QueryDocumentSnapshot<DocumentData>): AdminOrder => {
  const data = docSnap.data();
  const sweetName = (data.sweetName as string) || 'Palakova';
  const quantity = (data.quantity as string) || '250g';
  const price = Number(data.price || 0);
  const status = (data.orderStatus as AdminOrder['status']) || 'Pending';

  return {
    id: docSnap.id,
    orderNumber: (data.orderNumber as string) || `SVK-${docSnap.id.slice(0, 6).toUpperCase()}`,
    customerName: (data.customerName as string) || '',
    phone: (data.phoneNumber as string) || '',
    deliveryAddress: (data.address as string) || '',
    paymentMethod: (data.paymentMethod as string) || 'RAZORPAY',
    status,
    paymentStatus: (data.paymentStatus as string) || 'Pending',
    totalAmount: price,
    items: [
      {
        productId: 1,
        productName: sweetName,
        quantity: 1,
        weightOption: quantity,
        price,
        imageUrl: (data.imageUrl as string) || '',
      },
    ],
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : (data.createdAt as string) || new Date().toISOString(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : (data.updatedAt as string) || (data.createdAt as string) || new Date().toISOString(),
  };
};

export type AnalyticsRange = 'Today' | 'Last 7 Days' | 'Last 30 Days' | 'All Time';

export type AnalyticsStats = {
  totalRevenue: number;
  todaysRevenue: number;
  totalOrders: number;
  todaysOrders: number;
  pendingOrders: number;
  acceptedOrders: number;
  deliveredOrders: number;
  rejectedOrders: number;
  revenueTrend: { label: string; value: number }[];
  ordersTrend: { label: string; value: number }[];
  statusBreakdown: { label: string; value: number }[];
  topProducts: { label: string; value: number }[];
};

const getDayKey = (date: Date) => date.toISOString().slice(0, 10);
const buildRangeDates = (range: AnalyticsRange) => {
  const end = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  switch (range) {
    case 'Today':
      return { start, end };
    case 'Last 7 Days':
      start.setDate(start.getDate() - 6);
      return { start, end };
    case 'Last 30 Days':
      start.setDate(start.getDate() - 29);
      return { start, end };
    case 'All Time':
    default:
      return { start: new Date(0), end };
  }
};

const isPaidOrder = (order: AdminOrder) => order.paymentStatus.toLowerCase() === 'paid';

const createSeries = (range: AnalyticsRange) => {
  const { start, end } = buildRangeDates(range);
  const series: Record<string, number> = {};
  const current = new Date(start);

  while (current <= end) {
    series[getDayKey(current)] = 0;
    current.setDate(current.getDate() + 1);
  }

  return series;
};

const buildAnalytics = (orders: AdminOrder[], range: AnalyticsRange): AnalyticsStats => {
  const { start, end } = buildRangeDates(range);
  const series = createSeries(range);

  let totalRevenue = 0;
  let todaysRevenue = 0;
  let totalOrders = 0;
  let todaysOrders = 0;
  let pendingOrders = 0;
  let acceptedOrders = 0;
  let deliveredOrders = 0;
  let rejectedOrders = 0;

  const productCounts: Record<string, number> = {};

  orders.forEach((order) => {
    const created = new Date(order.createdAt);
    const isInRange = created >= start && created <= end;
    const isToday = created.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);

    if (isPaidOrder(order)) {
      totalRevenue += order.totalAmount;
      if (isToday) todaysRevenue += order.totalAmount;
    }
    if (isToday) todaysOrders += 1;

    totalOrders += 1;
    if (order.status === 'Pending') pendingOrders += 1;
    if (order.status === 'Accepted') acceptedOrders += 1;
    if (order.status === 'Delivered') deliveredOrders += 1;
    if (order.status === 'Rejected') rejectedOrders += 1;

    if (isInRange) {
      const label = getDayKey(created);
      series[label] = (series[label] || 0) + (isPaidOrder(order) ? order.totalAmount : 0);
    }

    order.items.forEach((item) => {
      productCounts[item.productName] = (productCounts[item.productName] || 0) + item.quantity;
    });
  });

  const revenueTrend = Object.entries(series).map(([label, value]) => ({ label, value }));
  const ordersTrendCounts: Record<string, number> = {};
  orders.forEach((order) => {
    const created = new Date(order.createdAt);
    if (created >= start && created <= end) {
      const label = getDayKey(created);
      ordersTrendCounts[label] = (ordersTrendCounts[label] || 0) + 1;
    }
  });

  const ordersTrend = Object.keys(series).map((label) => ({ label, value: ordersTrendCounts[label] || 0 }));
  const topProducts = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));

  return {
    totalRevenue,
    todaysRevenue,
    totalOrders,
    todaysOrders,
    pendingOrders,
    acceptedOrders,
    deliveredOrders,
    rejectedOrders,
    revenueTrend,
    ordersTrend,
    statusBreakdown: [
      { label: 'Pending', value: pendingOrders },
      { label: 'Accepted', value: acceptedOrders },
      { label: 'Delivered', value: deliveredOrders },
      { label: 'Rejected', value: rejectedOrders },
    ],
    topProducts,
  };
};

export const subscribeToAnalytics = (
  onUpdate: (analytics: AnalyticsStats) => void,
  range: AnalyticsRange,
) => {
  const ordersQuery = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(ordersQuery, (snapshot) => {
    const orders = snapshot.docs.map(toAdminOrder);
    onUpdate(buildAnalytics(orders, range));
  }, (error) => {
    console.error('Analytics snapshot failed', error);
  });
};
