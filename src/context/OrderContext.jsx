import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const OrderContext = createContext(null);
const STORAGE_KEY = 'gelatte_orders';

const ORDER_STATUSES = ['new', 'preparing', 'ready', 'completed', 'cancelled'];

function loadOrders() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    // Migrate old statuses
    const orders = JSON.parse(data);
    return orders.map(o => {
      if (o.status === 'pending') return { ...o, status: 'new' };
      if (o.status === 'shipped') return { ...o, status: 'ready' };
      if (o.status === 'delivered') return { ...o, status: 'completed' };
      return o;
    });
  } catch {
    return [];
  }
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders]);

  const addOrder = useCallback((orderData) => {
    const order = {
      id: 'GL-' + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).toUpperCase().slice(2, 5),
      ...orderData,
      status: 'new',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const updateOrderStatus = useCallback((orderId, status) => {
    if (!ORDER_STATUSES.includes(status)) return;
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      )
    );
  }, []);

  const getOrderById = useCallback(
    (orderId) => orders.find((o) => o.id === orderId),
    [orders]
  );

  const getOrdersByStatus = useCallback(
    (status) => {
      if (status === 'all') return orders;
      return orders.filter((o) => o.status === status);
    },
    [orders]
  );

  const getOrdersByCustomer = useCallback(
    (email) => orders.filter((o) => o.customer?.email?.toLowerCase() === email?.toLowerCase()),
    [orders]
  );

  // Stats for dashboard
  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0),
    newOrders: orders.filter(o => o.status === 'new').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        updateOrderStatus,
        getOrderById,
        getOrdersByStatus,
        getOrdersByCustomer,
        stats,
        ORDER_STATUSES,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) throw new Error('useOrders must be used within an OrderProvider');
  return context;
}
