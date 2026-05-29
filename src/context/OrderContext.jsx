import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const OrderContext = createContext(null);
const ORDER_STATUSES = ['pending_payment', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled', 'refunded'];

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

function normalizeOrder(order) {
  return {
    ...order,
    total: toNumber(order.total),
    subtotal: toNumber(order.subtotal),
    discount: toNumber(order.discount),
    deliveryFee: toNumber(order.deliveryFee),
    items: (order.items || []).map((item) => ({
      ...item,
      price: toNumber(item.price),
      discount: toNumber(item.discount),
      quantity: toNumber(item.quantity, 1),
    })),
  };
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!currentUser) {
      setOrders([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      let response;
      if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
        response = await api.admin.getOrders({ limit: 100 });
      } else {
        response = await api.getOrders();
      }

      if (response.success) {
        const orderList = response.data?.orders || response.data || [];
        setOrders(orderList.map(normalizeOrder));
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      const response = await api.admin.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        await fetchOrders();
        return { success: true, order: normalizeOrder(response.data) };
      }
      return { success: false, error: response.error };
    } catch (err) {
      console.error('Update order status error:', err);
      return { success: false, error: err.message };
    }
  }, [fetchOrders]);

  // Remove local addOrder as it's now handled by Checkout component hitting API directly
  // Keep it as a dummy method to prevent crashes if it's called somewhere else
  const addOrder = useCallback(() => {
    console.warn('addOrder called locally, but should be handled via API checkout.');
    return { id: 'dummy' };
  }, []);

  const stats = useMemo(() => {
    const activeOrders = orders.filter((order) => order.status !== 'cancelled');
    const revenueOrders = orders.filter((order) =>
      ['confirmed', 'preparing', 'ready', 'completed'].includes(order.status)
    );

    return {
      totalOrders: activeOrders.length,
      totalRevenue: revenueOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
      newOrdersToday: orders.filter((order) => {
        const created = new Date(order.createdAt);
        const today = new Date();
        return (
          created.getFullYear() === today.getFullYear() &&
          created.getMonth() === today.getMonth() &&
          created.getDate() === today.getDate()
        );
      }).length,
      ordersByStatus: orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {}),
    };
  }, [orders]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        stats,
        loading,
        ORDER_STATUSES,
        addOrder,
        updateOrderStatus,
        refreshOrders: fetchOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
