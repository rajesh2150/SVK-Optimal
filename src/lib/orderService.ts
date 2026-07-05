import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import type { AdminOrder } from './sweetStore';
import { auth, signInAnonymously } from './firebase';
import { db } from './firebase';
import { getProductImageForName, getStoredOrders, saveOrders } from './sweetStore';

export type OrderStatus = AdminOrder['status'];

export interface OrderPayload {
  customerName: string;
  phoneNumber: string;
  address: string;
  pincode: string;
  sweetName: string;
  quantity: string;
  price: number;
  paymentStatus: string;
  orderStatus: OrderStatus;
  paymentMethod?: string;
  orderNumber?: string;
  imageUrl?: string;
}

const ORDERS_COLLECTION = 'orders';

const toDateString = (value: unknown) => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === 'string' && value) {
    return value;
  }

  return new Date().toISOString();
};

const toAdminOrder = (docSnap: QueryDocumentSnapshot<DocumentData>): AdminOrder => {
  const data = docSnap.data();
  const sweetName = (data.sweetName as string) || 'Palakova';
  const quantity = (data.quantity as string) || '250g';
  const price = Number(data.price || 0);
  const status = (data.orderStatus as OrderStatus) || 'Pending';

  return {
    id: docSnap.id,
    orderNumber: (data.orderNumber as string) || `SVK-${docSnap.id.slice(0, 6).toUpperCase()}`,
    customerName: (data.customerName as string) || '',
    phone: (data.phoneNumber as string) || '',
    deliveryAddress: (data.address as string) || '',
    paymentMethod: (data.paymentMethod as string) || 'COD',
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
        imageUrl: (data.imageUrl as string) || getProductImageForName(sweetName),
      },
    ],
    createdAt: toDateString(data.createdAt),
    updatedAt: toDateString(data.updatedAt || data.createdAt),
  };
};

export const createOrderDocument = async (payload: OrderPayload) => {
  const orderNumber = payload.orderNumber || `SVK-${Date.now().toString().slice(-6)}`;

  try {
    if (!auth.currentUser) {
      await signInAnonymously(auth);
    }
  } catch (signInError) {
    console.warn('Anonymous auth was unavailable, continuing with Firestore write.', signInError);
  }

  try {
    await setDoc(doc(db, ORDERS_COLLECTION, orderNumber), {
      customerName: payload.customerName,
      phoneNumber: payload.phoneNumber,
      address: payload.address,
      pincode: payload.pincode,
      sweetName: payload.sweetName,
      quantity: payload.quantity,
      price: payload.price,
      paymentStatus: payload.paymentStatus,
      orderStatus: payload.orderStatus,
      paymentMethod: payload.paymentMethod || 'RAZORPAY',
      imageUrl: payload.imageUrl || getProductImageForName(payload.sweetName),
      orderNumber,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return { id: orderNumber, orderNumber };
  } catch (error) {
    console.error('Order creation failed in Firestore', error);
    throw new Error('Unable to save order to Firebase. Please try again or contact support.');
  }
};

export const getOrdersOnce = async () => {
  try {
    const ordersQuery = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(ordersQuery);
    return snapshot.docs.map(toAdminOrder);
  } catch (error) {
    console.error('Firestore orders lookup failed, using local fallback', error);
    return getStoredOrders();
  }
};

export const subscribeToOrders = (
  callback: (orders: AdminOrder[]) => void,
  onOrderAdded?: (order: AdminOrder) => void,
) => {
  const ordersQuery = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
  let hasLoadedInitialSnapshot = false;

  return onSnapshot(
    ordersQuery,
    (snapshot) => {
      const nextOrders = snapshot.docs.map(toAdminOrder);
      callback(nextOrders);

      if (!hasLoadedInitialSnapshot) {
        hasLoadedInitialSnapshot = true;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && onOrderAdded) {
          onOrderAdded(toAdminOrder(change.doc));
        }
      });
    },
    (error) => {
      console.error('Firebase orders listener failed, using local fallback', error);
      callback(getStoredOrders());
    },
  );
};

export const updateOrderDocument = async (orderId: string, updates: Partial<Record<string, unknown>>) => {
  const firestoreUpdates: Record<string, unknown> = {
    ...updates,
    updatedAt: serverTimestamp(),
  };

  if ('orderStatus' in updates && typeof updates.orderStatus !== 'undefined') {
    firestoreUpdates.status = updates.orderStatus;
  }

  try {
    await setDoc(doc(db, ORDERS_COLLECTION, orderId), firestoreUpdates, { merge: true });
  } catch (error) {
    console.error('Firestore update failed, updating local order instead', error);
  }

  const existingOrders = getStoredOrders();
  const updatedOrders = existingOrders.map((order) => {
    if (order.id !== orderId && order.orderNumber !== orderId) return order;

    const nextStatus = typeof updates.orderStatus === 'string' ? updates.orderStatus : order.status;
    const nextPaymentStatus = typeof updates.paymentStatus === 'string' ? updates.paymentStatus : order.paymentStatus;

    return {
      ...order,
      status: nextStatus as AdminOrder['status'],
      paymentStatus: nextPaymentStatus,
      updatedAt: new Date().toISOString(),
    };
  });

  saveOrders(updatedOrders);
};

export const deleteOrderDocument = async (orderId: string) => {
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
  } catch (error) {
    console.error('Firestore delete failed, removing local order instead', error);
  }

  const existingOrders = getStoredOrders().filter((order) => order.id !== orderId && order.orderNumber !== orderId);
  saveOrders(existingOrders);
};
