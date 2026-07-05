import type { Category, Product } from '../types';
import { api } from './api';
import palakovaImage from '../assets/palakova.webp';
import milkSweetsImage from '../assets/milk_sweet.webp';
import dryFruitSweetsImage from '../assets/dryfruitsweet.webp';

export const PRODUCT_STORAGE_KEY = 'svk-products';
export const ORDER_STORAGE_KEY = 'svk-orders';
export const ADMIN_AUTH_STORAGE_KEY = 'svk-admin-auth';

export interface AdminOrderItem {
  productId: number;
  productName: string;
  quantity: number;
  weightOption: string;
  price: number;
  imageUrl?: string;
}

export interface OrderTrackingStage {
  status: string;
  description: string;
  location: string;
  completed: boolean;
  timestamp: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  paymentMethod: string;
  status: 'Pending' | 'Accepted' | 'Out for delivery' | 'On the way' | 'Delivered' | 'Rejected' | 'Cancelled';
  paymentStatus: string;
  totalAmount: number;
  items: AdminOrderItem[];
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
  trackingHistory?: OrderTrackingStage[];
}

const weightPriceMap: Record<string, Record<string, number>> = {
  palakova: {
    '250g': 150,
    '500g': 300,
    '1kg': 600,
  },
  'milk sweets': {
    '250g': 200,
    '500g': 400,
    '1kg': 800,
  },
  'dry fruit sweets': {
    '250g': 375,
    '500g': 750,
    '1kg': 1500,
  },
};

const normalizeName = (name: string) => name.toLowerCase().trim();

export const getDefaultCategories = (): Category[] => [
  {
    id: 1,
    name: 'Palakova',
    description: 'Creamy, rich, and made for celebrations.',
    imageUrl: palakovaImage,
    active: true,
  },
  {
    id: 2,
    name: 'Milk Sweets',
    description: 'Soft milk-based sweets with a classic finish.',
    imageUrl: milkSweetsImage,
    active: true,
  },
  {
    id: 3,
    name: 'Dry Fruit Sweets',
    description: 'Premium nuts and dry fruits in every bite.',
    imageUrl: dryFruitSweetsImage,
    active: true,
  },
];

export const getDefaultProducts = (): Product[] => [
  {
    id: 1,
    name: 'Palakova',
    description: 'Silky, traditional palakova crafted with fresh milk and aromatic cardamom.',
    ingredients: 'Milk, sugar, cardamom, ghee',
    shelfLife: '3 days',
    storageInstructions: 'Store in a cool dry place',
    deliveryTime: 'Same-day delivery in city limits',
    weightOptions: '250g,500g,1kg',
    price: 150,
    stock: 48,
    imageUrl: palakovaImage,
    featured: true,
    bestSeller: true,
    active: true,
    rating: 4.8,
    reviewCount: 124,
    categoryName: 'Palakova',
  },
  {
    id: 2,
    name: 'Milk Sweets',
    description: 'Soft milk sweets with a rich, indulgent texture and festive appeal.',
    ingredients: 'Milk, sugar, saffron, nuts',
    shelfLife: '4 days',
    storageInstructions: 'Keep refrigerated for best texture',
    deliveryTime: 'Next-day delivery available',
    weightOptions: '250g,500g,1kg',
    price: 200,
    stock: 36,
    imageUrl: milkSweetsImage,
    featured: true,
    bestSeller: true,
    active: true,
    rating: 4.7,
    reviewCount: 98,
    categoryName: 'Milk Sweets',
  },
  {
    id: 3,
    name: 'Dry Fruit Sweets',
    description: 'A premium mix of dry fruits and golden sweetness in every box.',
    ingredients: 'Almonds, cashews, pistachios, saffron, milk',
    shelfLife: '5 days',
    storageInstructions: 'Store in a sealed container',
    deliveryTime: 'Same-day delivery available',
    weightOptions: '250g,500g,1kg',
    price: 375,
    stock: 24,
    imageUrl: dryFruitSweetsImage,
    featured: true,
    bestSeller: true,
    active: true,
    rating: 4.9,
    reviewCount: 155,
    categoryName: 'Dry Fruit Sweets',
  },
];

export const getProductImageForName = (name?: string) => {
  const normalized = normalizeName(name || '');
  if (normalized.includes('palakova')) return palakovaImage;
  if (normalized.includes('milk')) return milkSweetsImage;
  if (normalized.includes('dry fruit')) return dryFruitSweetsImage;
  return palakovaImage;
};

export const getWeightOptions = (product?: Product) => product?.weightOptions?.split(',').map((weight) => weight.trim()) || ['250g', '500g', '1kg'];

export const getPriceForWeight = (productName: string, weightOption?: string) => {
  const normalized = normalizeName(productName);
  const selectedWeight = (weightOption || '250g').trim().toLowerCase();

  for (const [nameKey, weights] of Object.entries(weightPriceMap)) {
    if (normalized.includes(nameKey)) {
      return weights[selectedWeight] || weights['250g'] || 0;
    }
  }

  return 0;
};

export const getProductPrice = (product: Product, weightOption?: string) => {
  const mapped = getPriceForWeight(product.name, weightOption);
  if (mapped > 0) return mapped;
  const basePrice = product.price || 0;
  const selectedWeight = (weightOption || '250g').trim().toLowerCase();
  if (selectedWeight === '250g') return basePrice;
  if (selectedWeight === '500g') return basePrice * 2;
  if (selectedWeight === '1kg') return basePrice * 4;
  return basePrice;
};

const extractDeliveryLocation = (address: string) => {
  const segments = address.split(',').map((segment) => segment.trim()).filter(Boolean);
  return segments.length ? segments[segments.length - 1] : address;
};

export const getOrderTrackingHistory = (order: AdminOrder): OrderTrackingStage[] => {
  const cityLabel = extractDeliveryLocation(order.deliveryAddress);
  const isAccepted = order.status === 'Accepted' || order.status === 'Out for delivery' || order.status === 'On the way' || order.status === 'Delivered';
  const isPrepared = order.status === 'Accepted' || order.status === 'Out for delivery' || order.status === 'On the way' || order.status === 'Delivered';
  const isPacked = order.status === 'Out for delivery' || order.status === 'On the way' || order.status === 'Delivered';
  const isOutForDelivery = order.status === 'Out for delivery' || order.status === 'On the way' || order.status === 'Delivered';
  const isDelivered = order.status === 'Delivered';
  const isRejected = order.status === 'Rejected' || order.status === 'Cancelled';
  const baseTimestamp = order.createdAt;
  const updateTimestamp = order.updatedAt || order.createdAt;

  const steps: OrderTrackingStage[] = [
    {
      status: isRejected ? 'Order rejected' : 'Order accepted',
      description: isRejected
        ? 'The order was rejected by SVK Sweets. Please contact support for assistance.'
        : 'Order has been confirmed and is now moving into preparation.',
      location: 'SVK Kitchen, Chennai',
      completed: isAccepted,
      timestamp: baseTimestamp,
    },
    {
      status: 'Preparing in kitchen',
      description: isRejected
        ? 'Order was rejected before preparation began.'
        : 'Order preparation has begun in the SVK kitchen.',
      location: 'SVK Kitchen, Chennai',
      completed: isPrepared && !isRejected,
      timestamp: updateTimestamp,
    },
    {
      status: 'Packed and dispatched',
      description: isRejected
        ? 'Order will not be dispatched due to rejection.'
        : 'Order has been packed and dispatched from the kitchen.',
      location: isRejected ? 'SVK Kitchen, Chennai' : 'SVK Dispatch',
      completed: isPacked && !isRejected,
      timestamp: updateTimestamp,
    },
    {
      status: 'Out for delivery',
      description: isRejected
        ? 'Order delivery was cancelled.'
        : 'Order is out for delivery and heading to the destination.',
      location: isOutForDelivery ? `En route to ${cityLabel}` : 'SVK Dispatch',
      completed: isOutForDelivery && !isRejected,
      timestamp: updateTimestamp,
    },
    {
      status: 'Delivered',
      description: isDelivered
        ? `Order delivered to ${order.deliveryAddress}.`
        : 'Order is still on its way to the delivery address.',
      location: isDelivered ? order.deliveryAddress : `En route to ${cityLabel}`,
      completed: isDelivered,
      timestamp: updateTimestamp,
    },
  ];

  return steps;
};

export const getStoredCategories = (): Category[] => {
  if (typeof window === 'undefined') return getDefaultCategories();
  try {
    const raw = window.localStorage.getItem('svk-categories');
    if (!raw) return getDefaultCategories();
    const parsed = JSON.parse(raw) as Category[];
    return parsed.length ? parsed : getDefaultCategories();
  } catch {
    return getDefaultCategories();
  }
};

export const saveCategories = (categories: Category[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('svk-categories', JSON.stringify(categories));
};

export const getStoredProducts = (): Product[] => {
  if (typeof window === 'undefined') return getDefaultProducts();
  try {
    const raw = window.localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (!raw) return getDefaultProducts();
    const parsed = JSON.parse(raw) as Product[];
    return parsed.length ? parsed : getDefaultProducts();
  } catch {
    return getDefaultProducts();
  }
};

export const saveProducts = (products: Product[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
};

export const getStoredOrders = (): AdminOrder[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AdminOrder[];
  } catch {
    return [];
  }
};

export const saveOrders = (orders: AdminOrder[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
};

export const hasServerOrderApi = () => Boolean(import.meta.env.VITE_API_URL);

export const parseBackendOrder = (data: any): AdminOrder => ({
  id: data.id?.toString() || data.orderNumber,
  orderNumber: data.orderNumber,
  customerName: data.customerName,
  phone: data.phone,
  deliveryAddress: data.deliveryAddress,
  paymentMethod: data.paymentMethod,
  status: data.status || 'Pending',
  paymentStatus: data.paymentStatus || (data.paymentMethod === 'COD' ? 'Pending' : 'Awaiting payment'),
  totalAmount: Number(data.totalAmount) || 0,
  items: (data.items || []).map((item: any) => ({
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    weightOption: item.weightOption,
    price: Number(item.unitPrice) || 0,
    imageUrl: item.imageUrl,
  })),
  latitude: data.latitude ? Number(data.latitude) : undefined,
  longitude: data.longitude ? Number(data.longitude) : undefined,
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
});

export const getOrders = async (): Promise<AdminOrder[]> => {
  if (!hasServerOrderApi()) {
    return getStoredOrders();
  }
  try {
    const response = await api.get('/orders/all');
    const orders = response.data?.data;
    if (!orders || !Array.isArray(orders)) return getStoredOrders();
    return orders.map(parseBackendOrder);
  } catch {
    return getStoredOrders();
  }
};

export const getOrderById = async (orderId: string): Promise<AdminOrder | null> => {
  if (!hasServerOrderApi()) {
    return getStoredOrders().find((order) => order.id === orderId || order.orderNumber === orderId) ?? null;
  }

  try {
    const orders = await getOrders();
    return orders.find((order) => order.id === orderId || order.orderNumber === orderId) ?? null;
  } catch {
    return getStoredOrders().find((order) => order.id === orderId || order.orderNumber === orderId) ?? null;
  }
};

export const createOrderOnServer = async (payload: {
  customerName: string;
  phone: string;
  deliveryAddress: string;
  paymentMethod: string;
  totalAmount: number;
  paymentStatus?: string;
  items: AdminOrderItem[];
  latitude?: number;
  longitude?: number;
}) => {
  if (!hasServerOrderApi()) {
    const order = createOrderRecord(payload);
    saveOrders([order, ...getStoredOrders()]);
    return order;
  }

  try {
    const response = await api.post('/orders/checkout', payload);
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Order creation failed');
    }
    return parseBackendOrder(response.data.data);
  } catch (error) {
    const order = createOrderRecord(payload);
    saveOrders([order, ...getStoredOrders()]);
    return order;
  }
};

export const updateOrderStatus = async (orderId: string, status: AdminOrder['status']) => {
  if (!hasServerOrderApi()) {
    const stored = getStoredOrders().map((item) => item.id === orderId || item.orderNumber === orderId ? { ...item, status, updatedAt: new Date().toISOString() } : item);
    saveOrders(stored);
    return stored.find((item) => item.id === orderId || item.orderNumber === orderId) ?? null;
  }

  try {
    await api.put(`/orders/${orderId}/status`, null, { params: { status } });
    return await getOrderById(orderId);
  } catch {
    const stored = getStoredOrders().map((item) => item.id === orderId || item.orderNumber === orderId ? { ...item, status, updatedAt: new Date().toISOString() } : item);
    saveOrders(stored);
    return stored.find((item) => item.id === orderId || item.orderNumber === orderId) ?? null;
  }
};

export const createOrderRecord = (payload: {
  customerName: string;
  phone: string;
  deliveryAddress: string;
  paymentMethod: string;
  totalAmount: number;
  items: AdminOrderItem[];
  latitude?: number;
  longitude?: number;
  paymentStatus?: string;
}) => {
  const orderNumber = `SVK-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();
  const order: AdminOrder = {
    id: orderNumber,
    orderNumber,
    ...payload,
    status: 'Pending',
    paymentStatus: payload.paymentStatus ?? (payload.paymentMethod === 'COD' ? 'Pending' : 'Awaiting payment'),
    createdAt: now,
    updatedAt: now,
  };
  return order;
};

export const isAdminCredentialsValid = (username: string, password: string) => {
  if (typeof window === 'undefined') return username === 'admin' && password === 'admin123';
  const storedRaw = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
  if (storedRaw) {
    const stored = JSON.parse(storedRaw) as { username?: string; password?: string };
    if (stored.username === username && stored.password === password) return true;
  }
  return username === 'admin' && password === 'admin123';
};
