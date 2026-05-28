import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser, isSuperAdmin } = useAuth();

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
        setOrders(response.data.orders || response.data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateOrderStatus = useCallback(async (orderId, newStatus, meta = {}) => {
    try {
      const response = await api.admin.updateOrderStatus(orderId, newStatus);
      if (response.success) {
        await fetchOrders();
        return { success: true, order: response.data };
      }
      return { success: false, error: response.error };
    } catch (err) {
      console.error('Update order status error:', err);
      return { success: false, error: err.message };
    }
  }, [fetchOrders]);

  // Remove local addOrder as it's now handled by Checkout component hitting API directly
  // Keep it as a dummy method to prevent crashes if it's called somewhere else
  const addOrder = useCallback((orderData) => {
    console.warn('addOrder called locally, but should be handled via API checkout.');
    return { id: 'dummy' };
  }, []);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
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
