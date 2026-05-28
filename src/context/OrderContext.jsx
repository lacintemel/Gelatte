import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const OrderContext = createContext(null);
const STORAGE_KEY = 'gelatte_orders';

const ORDER_STATUSES = ['new', 'preparing', 'ready', 'completed', 'cancelled', 'refunded'];

function loadOrders() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    // Migrate old statuses and add new tracking fields
    const orders = JSON.parse(data);
    return orders.map(o => {
      let migrated = { ...o };
      // Migrate legacy statuses
      if (o.status === 'pending') migrated.status = 'new';
      if (o.status === 'shipped') migrated.status = 'ready';
      if (o.status === 'delivered') migrated.status = 'completed';
      // Add stock tracking fields if missing
      if (migrated.stockDeducted === undefined) migrated.stockDeducted = false;
      if (migrated.stockDeductedAt === undefined) migrated.stockDeductedAt = null;
      if (migrated.stockDeductedBy === undefined) migrated.stockDeductedBy = null;
      if (migrated.stockDeductedByRole === undefined) migrated.stockDeductedByRole = null;
      if (migrated.stockRestored === undefined) migrated.stockRestored = false;
      if (migrated.stockRestoredAt === undefined) migrated.stockRestoredAt = null;
      // Add financial tracking fields if missing
      if (migrated.completedAt === undefined) migrated.completedAt = null;
      if (migrated.cancelledAt === undefined) migrated.cancelledAt = null;
      if (migrated.refundedAt === undefined) migrated.refundedAt = null;
      if (migrated.refundAmount === undefined) migrated.refundAmount = null;
      if (migrated.paymentMethod === undefined) migrated.paymentMethod = 'online';
      // Status history
      if (migrated.statusHistory === undefined) migrated.statusHistory = [];
      return migrated;
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
      // Stock tracking fields
      stockDeducted: false,
      stockDeductedAt: null,
      stockDeductedBy: null,
      stockDeductedByRole: null,
      stockRestored: false,
      stockRestoredAt: null,
      // Financial tracking fields
      paymentMethod: orderData.paymentMethod || 'online',
      completedAt: null,
      cancelledAt: null,
      refundedAt: null,
      refundAmount: null,
      // Timestamps
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Status history
      statusHistory: [
        { status: 'new', timestamp: new Date().toISOString(), by: 'system' }
      ],
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  /**
   * Update order status with enhanced tracking.
   * For stock-related transitions (→preparing, →cancelled, →refunded),
   * the caller (AdminOrders page) handles stock operations separately.
   * This method just updates the order record.
   *
   * @param {string} orderId
   * @param {string} newStatus
   * @param {Object} [meta] - Additional metadata
   * @param {string} [meta.performedBy] - Username of who performed the change
   * @param {string} [meta.performedByRole] - Role of who performed it
   * @param {boolean} [meta.stockDeducted] - Mark stock as deducted
   * @param {boolean} [meta.stockRestored] - Mark stock as restored
   * @param {number} [meta.refundAmount] - Refund amount (for refunded status)
   * @returns {{ success: boolean, order?: Object, error?: string }}
   */
  const updateOrderStatus = useCallback((orderId, newStatus, meta = {}) => {
    if (!ORDER_STATUSES.includes(newStatus)) {
      return { success: false, error: `Geçersiz sipariş durumu: ${newStatus}` };
    }

    let updatedOrder = null;
    let oldStatus = null;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        oldStatus = order.status;
        const now = new Date().toISOString();

        const updated = {
          ...order,
          status: newStatus,
          updatedAt: now,
          statusHistory: [
            ...(order.statusHistory || []),
            {
              status: newStatus,
              from: oldStatus,
              timestamp: now,
              by: meta.performedBy || 'system',
              byRole: meta.performedByRole || null,
            },
          ],
        };

        // Track stock deduction
        if (meta.stockDeducted && !order.stockDeducted) {
          updated.stockDeducted = true;
          updated.stockDeductedAt = now;
          updated.stockDeductedBy = meta.performedBy || null;
          updated.stockDeductedByRole = meta.performedByRole || null;
        }

        // Track stock restoration
        if (meta.stockRestored) {
          updated.stockRestored = true;
          updated.stockRestoredAt = now;
        }

        // Track completion
        if (newStatus === 'completed' && !order.completedAt) {
          updated.completedAt = now;
        }

        // Track cancellation
        if (newStatus === 'cancelled') {
          updated.cancelledAt = now;
        }

        // Track refund
        if (newStatus === 'refunded') {
          updated.refundedAt = now;
          updated.refundAmount = meta.refundAmount ?? order.total ?? 0;
        }

        updatedOrder = updated;
        return updated;
      })
    );

    if (updatedOrder) {
      return { success: true, order: updatedOrder, oldStatus };
    }
    return { success: false, error: 'Sipariş bulunamadı' };
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
    totalRevenue: orders
      .filter(o => o.status !== 'cancelled' && o.status !== 'refunded')
      .reduce((sum, o) => sum + (o.total || 0), 0),
    newOrders: orders.filter(o => o.status === 'new').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    preparingOrders: orders.filter(o => o.status === 'preparing').length,
    cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
    refundedOrders: orders.filter(o => o.status === 'refunded').length,
    totalRefunds: orders
      .filter(o => o.status === 'refunded')
      .reduce((sum, o) => sum + (o.refundAmount || o.total || 0), 0),
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
