import { useEffect, useMemo, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { subscribeToAnalytics, type AnalyticsStats, type AnalyticsRange } from '../lib/analyticsService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

const ranges: AnalyticsRange[] = ['Today', 'Last 7 Days', 'Last 30 Days', 'All Time'];

const AdminAnalyticsSection = () => {
  const [range, setRange] = useState<AnalyticsRange>('Last 7 Days');
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAnalytics(setAnalytics, range);
    return () => unsubscribe();
  }, [range]);

  const stats = analytics ?? {
    totalRevenue: 0,
    todaysRevenue: 0,
    totalOrders: 0,
    todaysOrders: 0,
    pendingOrders: 0,
    acceptedOrders: 0,
    deliveredOrders: 0,
    rejectedOrders: 0,
    revenueTrend: [],
    ordersTrend: [],
    statusBreakdown: [],
    topProducts: [],
  };

  const revenueChart = useMemo(() => ({
    labels: stats.revenueTrend.map((item) => item.label),
    datasets: [
      {
        label: 'Revenue',
        data: stats.revenueTrend.map((item) => item.value),
        borderColor: '#8B4513',
        backgroundColor: 'rgba(139, 69, 19, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  }), [stats.revenueTrend]);

  const ordersChart = useMemo(() => ({
    labels: stats.ordersTrend.map((item) => item.label),
    datasets: [
      {
        label: 'Orders',
        data: stats.ordersTrend.map((item) => item.value),
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  }), [stats.ordersTrend]);

  const statusChart = useMemo(() => ({
    labels: stats.statusBreakdown.map((item) => item.label),
    datasets: [
      {
        data: stats.statusBreakdown.map((item) => item.value),
        backgroundColor: ['#FBBF24', '#22C55E', '#38BDF8', '#F87171'],
        borderWidth: 0,
      },
    ],
  }), [stats.statusBreakdown]);

  const topProductsChart = useMemo(() => ({
    labels: stats.topProducts.map((item) => item.label),
    datasets: [
      {
        label: 'Quantity sold',
        data: stats.topProducts.map((item) => item.value),
        backgroundColor: '#8B4513',
      },
    ],
  }), [stats.topProducts]);

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Live analytics</p>
            <h2 className="mt-2 text-3xl font-semibold text-stone-900">Realtime performance overview</h2>
            <p className="mt-2 text-sm text-stone-600">All analytics are powered by Firestore live updates.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {ranges.map((option) => (
              <button
                key={option}
                onClick={() => setRange(option)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${range === option ? 'bg-[#8B4513] text-white' : 'bg-stone-100 text-stone-700'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Total Revenue', value: stats.totalRevenue, prefix: '₹' },
          { title: "Today's Revenue", value: stats.todaysRevenue, prefix: '₹' },
          { title: 'Total Orders', value: stats.totalOrders },
          { title: "Today's Orders", value: stats.todaysOrders },
          { title: 'Pending Orders', value: stats.pendingOrders },
          { title: 'Accepted Orders', value: stats.acceptedOrders },
          { title: 'Delivered Orders', value: stats.deliveredOrders },
          { title: 'Rejected Orders', value: stats.rejectedOrders },
        ].map((card) => (
          <div key={card.title} className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">{card.title}</p>
            <p className="mt-4 text-3xl font-semibold text-stone-900">{card.prefix || ''}{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Revenue Trend</p>
          <p className="mt-2 text-sm text-stone-600">Daily revenue for the selected range.</p>
          <div className="mt-6 h-[320px]">
            <Line data={revenueChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#F3F4F6' } } } }} />
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Orders Trend</p>
          <p className="mt-2 text-sm text-stone-600">Daily order count for the selected range.</p>
          <div className="mt-6 h-[320px]">
            <Line data={ordersChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#F3F4F6' }, beginAtZero: true } } }} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Order Status</p>
          <p className="mt-2 text-sm text-stone-600">Current order distribution by status.</p>
          <div className="mt-6 h-[320px]"><Pie data={statusChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} /></div>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">Top Selling Products</p>
          <p className="mt-2 text-sm text-stone-600">Best performing products by quantity sold.</p>
          <div className="mt-6 h-[320px]"><Bar data={topProductsChart} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: '#F3F4F6' } } } }} /></div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsSection;
