import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

const FinancialContext = createContext(null);
const STORAGE_KEY = 'gelatte_financial_records';

function loadRecords() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function FinancialProvider({ children }) {
  const [records, setRecords] = useState(loadRecords);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  /**
   * Create or update a financial record for an order.
   */
  const upsertFinancialRecord = useCallback((order) => {
    setRecords(prev => {
      const existing = prev.find(r => r.orderId === order.id);
      const now = new Date().toISOString();

      const record = {
        id: existing?.id || `fin_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        orderId: order.id,
        orderNumber: order.id,
        customerId: order.customer?.email || order.customer?.name || 'guest',
        customerName: order.customer?.name || order.customer?.firstName || 'Misafir',
        totalAmount: order.total || 0,
        subtotal: order.subtotal || order.total || 0,
        discountAmount: order.discountAmount || order.couponDiscount || 0,
        taxAmount: order.taxAmount || 0,
        shippingFee: order.shippingFee || 0,
        costAmount: 0, // Extensible: add product costs when available
        profitAmount: order.total || 0, // Revenue = profit when cost is 0
        paymentMethod: order.paymentMethod || 'online',
        orderStatus: order.status,
        isCancelled: order.status === 'cancelled',
        cancelledAt: order.status === 'cancelled' ? (order.cancelledAt || now) : (existing?.cancelledAt || null),
        isRefunded: order.status === 'refunded',
        refundAmount: order.status === 'refunded' ? (order.refundAmount || order.total || 0) : (existing?.refundAmount || 0),
        refundedAt: order.status === 'refunded' ? (order.refundedAt || now) : (existing?.refundedAt || null),
        isCompleted: order.status === 'completed',
        completedAt: order.status === 'completed' ? (order.completedAt || now) : (existing?.completedAt || null),
        items: order.items || [],
        couponCode: order.couponCode || null,
        createdAt: existing?.createdAt || order.createdAt || now,
        updatedAt: now,
      };

      if (existing) {
        return prev.map(r => r.orderId === order.id ? record : r);
      }
      return [record, ...prev];
    });
  }, []);

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
