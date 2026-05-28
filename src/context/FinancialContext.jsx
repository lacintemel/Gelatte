import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const FinancialContext = createContext(null);

export function FinancialProvider({ children }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAdmin } = useAuth();

  const loadRecords = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      // Fetch up to 1000 latest orders for financial aggregation
      const res = await api.admin.getOrders({ limit: 1000 });
      if (res.success) {
        const mappedRecords = res.data.orders.map((order) => {
          const now = new Date().toISOString();
          return {
            id: `fin_${order.id}`,
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerId: order.user?.email || order.customerEmail || 'guest',
            customerName: order.user?.name || order.customerFirstName || 'Misafir',
            totalAmount: order.total || 0,
            subtotal: order.subtotal || 0,
            discountAmount: order.discount || 0,
            taxAmount: order.tax || 0,
            shippingFee: order.shipping || 0,
            costAmount: 0, 
            profitAmount: order.total || 0, 
            paymentMethod: order.payment?.provider || 'online',
            orderStatus: order.status,
            isCancelled: order.status === 'cancelled',
            cancelledAt: order.status === 'cancelled' ? (order.updatedAt || now) : null,
            isRefunded: order.status === 'refunded',
            refundAmount: order.status === 'refunded' ? order.total : 0,
            refundedAt: order.status === 'refunded' ? (order.updatedAt || now) : null,
            isCompleted: order.status === 'completed',
            completedAt: order.status === 'completed' ? (order.updatedAt || now) : null,
            items: order.items || [],
            couponCode: order.couponCode || null,
            createdAt: order.createdAt || now,
            updatedAt: order.updatedAt || now,
          };
        });
        setRecords(mappedRecords);
      }
    } catch (err) {
      console.error('Failed to load financial records:', err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const upsertFinancialRecord = useCallback((order) => {
    // Upsert is handled by reloading from the backend, but we can do it optimistically if needed.
    loadRecords();
  }, [loadRecords]);

  /**
   * Get net revenue for a financial record (handles cancellations/refunds).
   */
  const getNetRevenue = useCallback((record) => {
    if (record.isCancelled) return 0;
    if (record.isRefunded) return record.totalAmount - (record.refundAmount || 0);
    return record.totalAmount;
  }, []);

  // ══════════════════════════════════════════
  // ── Aggregation Methods ──
  // ══════════════════════════════════════════

  /**
   * Filter records by date range.
   */
  const getRecordsByDateRange = useCallback((from, to) => {
    const fromDate = new Date(from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(to);
    toDate.setHours(23, 59, 59, 999);

    return records.filter(r => {
      const d = new Date(r.createdAt);
      return d >= fromDate && d <= toDate;
    });
  }, [records]);

  /**
   * Get aggregated sales data for a date range.
   */
  const aggregateSales = useCallback((filteredRecords) => {
    const activeRecords = filteredRecords.filter(r => !r.isCancelled);
    const cancelledRecords = filteredRecords.filter(r => r.isCancelled);
    const refundedRecords = filteredRecords.filter(r => r.isRefunded);
    const completedRecords = filteredRecords.filter(r => r.isCompleted);

    const totalRevenue = activeRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    const totalRefunds = refundedRecords.reduce((sum, r) => sum + (r.refundAmount || 0), 0);
    const totalDiscounts = filteredRecords.reduce((sum, r) => sum + (r.discountAmount || 0), 0);
    const totalTax = activeRecords.reduce((sum, r) => sum + (r.taxAmount || 0), 0);
    const netRevenue = totalRevenue - totalRefunds;

    return {
      orderCount: filteredRecords.length,
      activeOrderCount: activeRecords.length,
      completedOrderCount: completedRecords.length,
      cancelledOrderCount: cancelledRecords.length,
      refundedOrderCount: refundedRecords.length,
      totalRevenue,
      netRevenue,
      totalRefunds,
      totalDiscounts,
      totalTax,
      avgOrderValue: activeRecords.length > 0 ? totalRevenue / activeRecords.length : 0,
      profitAmount: netRevenue, // profit = netRevenue when cost is 0
    };
  }, []);

  /**
   * Get daily sales for a specific date.
   */
  const getDailySales = useCallback((date) => {
    const d = new Date(date);
    const dayRecords = getRecordsByDateRange(d, d);
    return { date: d.toISOString().split('T')[0], ...aggregateSales(dayRecords) };
  }, [getRecordsByDateRange, aggregateSales]);

  /**
   * Get weekly sales starting from a date (7 days).
   */
  const getWeeklySales = useCallback((weekStartDate) => {
    const from = new Date(weekStartDate);
    const to = new Date(from);
    to.setDate(to.getDate() + 6);
    const weekRecords = getRecordsByDateRange(from, to);
    return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0], ...aggregateSales(weekRecords) };
  }, [getRecordsByDateRange, aggregateSales]);

  /**
   * Get monthly sales for a specific year/month.
   */
  const getMonthlySales = useCallback((year, month) => {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0); // Last day of month
    const monthRecords = getRecordsByDateRange(from, to);
    return { year, month, ...aggregateSales(monthRecords) };
  }, [getRecordsByDateRange, aggregateSales]);

  /**
   * Get yearly sales for a specific year.
   */
  const getYearlySales = useCallback((year) => {
    const from = new Date(year, 0, 1);
    const to = new Date(year, 11, 31);
    const yearRecords = getRecordsByDateRange(from, to);
    return { year, ...aggregateSales(yearRecords) };
  }, [getRecordsByDateRange, aggregateSales]);

  /**
   * Get daily breakdown for a date range (array of daily sales).
   */
  const getDailyBreakdown = useCallback((from, to) => {
    const days = [];
    const current = new Date(from);
    const end = new Date(to);

    while (current <= end) {
      days.push(getDailySales(new Date(current)));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [getDailySales]);

  /**
   * Get monthly breakdown for a year.
   */
  const getMonthlyBreakdown = useCallback((year) => {
    const months = [];
    for (let m = 1; m <= 12; m++) {
      months.push(getMonthlySales(year, m));
    }
    return months;
  }, [getMonthlySales]);

  /**
   * Get sales breakdown by product.
   */
  const getSalesByProduct = useCallback(() => {
    const productMap = {};

    for (const record of records) {
      if (record.isCancelled) continue;
      const items = record.items || [];
      for (const item of items) {
        const key = item.id || item.productId || item.name;
        if (!productMap[key]) {
          productMap[key] = {
            productId: item.id || item.productId,
            productName: typeof item.name === 'object' ? (item.name.tr || item.name.en || key) : (item.name || key),
            unitsSold: 0,
            totalRevenue: 0,
            avgPrice: 0,
            image: item.image || null,
          };
        }
        const qty = item.quantity || 1;
        const price = (item.price || 0) * qty;
        productMap[key].unitsSold += qty;
        productMap[key].totalRevenue += price;
      }
    }

    return Object.values(productMap)
      .map(p => ({ ...p, avgPrice: p.unitsSold > 0 ? p.totalRevenue / p.unitsSold : 0 }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [records]);

  /**
   * Get sales breakdown by payment method.
   */
  const getSalesByPaymentMethod = useCallback(() => {
    const methodMap = {};

    for (const record of records) {
      if (record.isCancelled) continue;
      const method = record.paymentMethod || 'online';
      if (!methodMap[method]) {
        methodMap[method] = { method, orderCount: 0, totalRevenue: 0 };
      }
      methodMap[method].orderCount += 1;
      methodMap[method].totalRevenue += record.totalAmount;
    }

    const total = Object.values(methodMap).reduce((s, m) => s + m.totalRevenue, 0);
    return Object.values(methodMap).map(m => ({
      ...m,
      percentage: total > 0 ? (m.totalRevenue / total) * 100 : 0,
    }));
  }, [records]);

  /**
   * Get profit detail for a single order.
   */
  const getProfitByOrder = useCallback((orderId) => {
    return records.find(r => r.orderId === orderId) || null;
  }, [records]);

  // ── Overall summary (memoized) ──
  const overallSummary = useMemo(() => {
    return aggregateSales(records);
  }, [records, aggregateSales]);

  return (
    <FinancialContext.Provider
      value={{
        records,
        upsertFinancialRecord,
        getNetRevenue,
        getRecordsByDateRange,
        aggregateSales,
        getDailySales,
        getWeeklySales,
        getMonthlySales,
        getYearlySales,
        getDailyBreakdown,
        getMonthlyBreakdown,
        getSalesByProduct,
        getSalesByPaymentMethod,
        getProfitByOrder,
        overallSummary,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancials() {
  const context = useContext(FinancialContext);
  if (!context) throw new Error('useFinancials must be used within a FinancialProvider');
  return context;
}
