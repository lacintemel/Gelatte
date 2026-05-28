import { useState, useMemo } from 'react';
import { Package, ChevronDown, Search, Eye, X, MapPin, Phone, Mail, User, AlertTriangle, CheckCircle, RotateCcw, Lock } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useFinancials } from '../../context/FinancialContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

const STATUS_COLORS = {
  new: 'bg-amber-50 text-amber-700 border-amber-200',
  preparing: 'bg-blue-50 text-blue-700 border-blue-200',
  ready: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-orange-50 text-orange-700 border-orange-200',
};

const STATUS_LABELS = {
  new: 'Yeni',
  preparing: 'Hazırlanıyor',
  ready: 'Hazır',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
  refunded: 'İade',
};

export default function AdminOrders() {
  const { orders, updateOrderStatus, ORDER_STATUSES } = useOrders();
  const { bulkDeductStock, bulkRestoreStock } = useProducts();
  const { currentUser, logDetailedAuditEvent } = useAuth();
  const { upsertFinancialRecord } = useFinancials();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Stock deduction UI state
  const [stockConfirmOrder, setStockConfirmOrder] = useState(null);
  const [stockError, setStockError] = useState(null);
  const [cancelConfirmOrder, setCancelConfirmOrder] = useState(null);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  const filtered = useMemo(() => {
    let result = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        (o.customer?.firstName || '').toLowerCase().includes(q) ||
        (o.customer?.email || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, statusFilter, search]);

  /**
   * Handle status change with stock deduction/restoration logic.
   */
  const handleStatusChange = (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const oldStatus = order.status;

    // If changing to "preparing" — need stock deduction
    if (newStatus === 'preparing' && !order.stockDeducted) {
      setStockConfirmOrder(order);
      setPendingStatusChange({ orderId, newStatus });
      return;
    }

    // If changing to "cancelled" or "refunded" — might need stock restoration
    if ((newStatus === 'cancelled' || newStatus === 'refunded') && order.stockDeducted && !order.stockRestored) {
      setCancelConfirmOrder(order);
      setPendingStatusChange({ orderId, newStatus });
      return;
    }

    // Normal status change (no stock operations needed)
    executeStatusChange(orderId, newStatus, oldStatus, order);
  };

  /**
   * Execute the actual status change with audit logging and financial tracking.
   */
  const executeStatusChange = (orderId, newStatus, oldStatus, order, extraMeta = {}) => {
    const result = updateOrderStatus(orderId, newStatus, {
      performedBy: currentUser?.username || 'system',
      performedByRole: currentUser?.role || 'system',
      ...extraMeta,
    });

    if (result.success) {
      // Log audit event
      logDetailedAuditEvent({
        actionType: 'order.status_changed',
        module: 'orders',
        recordId: orderId,
        description: `Sipariş durumu değiştirildi: ${STATUS_LABELS[oldStatus] || oldStatus} → ${STATUS_LABELS[newStatus] || newStatus}`,
        oldValue: { status: oldStatus },
        newValue: { status: newStatus },
      });

      // Update financial record
      if (result.order) {
        upsertFinancialRecord(result.order);
      }

      addToast(`Sipariş durumu güncellendi: ${STATUS_LABELS[newStatus] || newStatus}`, 'success');
    } else {
      addToast(`Hata: ${result.error}`, 'error');
    }
  };

  /**
   * Confirm stock deduction for "preparing" status.
   */
  const confirmStockDeduction = () => {
    if (!stockConfirmOrder || !pendingStatusChange) return;

    const order = stockConfirmOrder;
    const items = (order.items || []).map(item => ({
      productId: item.id || item.productId,
      quantity: item.quantity || 1,
    }));

    // Attempt bulk stock deduction
    const result = bulkDeductStock(items);

    if (!result.success) {
      // Show detailed error about which products lack stock
      setStockError({
        order,
        errors: result.errors,
      });
      setStockConfirmOrder(null);
      return;
    }

    // Stock deducted successfully — now update order status
    const oldStatus = order.status;
    executeStatusChange(order.id, 'preparing', oldStatus, order, {
      stockDeducted: true,
    });

    // Log stock deduction audit event
    logDetailedAuditEvent({
      actionType: 'order.stock_deducted',
      module: 'orders',
      recordId: order.id,
      description: `Sipariş için stok düşürüldü: ${order.id} (${result.details.length} ürün)`,
      newValue: { stockDetails: result.details },
    });

    addToast(`Stok başarıyla düşürüldü (${result.details.length} ürün)`, 'success');
    setStockConfirmOrder(null);
    setPendingStatusChange(null);
  };

  /**
   * Confirm stock restoration for cancel/refund.
   */
  const confirmStockRestore = () => {
    if (!cancelConfirmOrder || !pendingStatusChange) return;

    const order = cancelConfirmOrder;
    const items = (order.items || []).map(item => ({
      productId: item.id || item.productId,
      quantity: item.quantity || 1,
    }));

    // Restore stock
    const result = bulkRestoreStock(items);

    // Update order status with stock restored flag
    const oldStatus = order.status;
    executeStatusChange(order.id, pendingStatusChange.newStatus, oldStatus, order, {
      stockRestored: true,
      refundAmount: pendingStatusChange.newStatus === 'refunded' ? order.total : undefined,
    });

    // Log stock restoration
    logDetailedAuditEvent({
      actionType: 'order.stock_restored',
      module: 'orders',
      recordId: order.id,
      description: `Sipariş iptali için stok geri eklendi: ${order.id}`,
      newValue: { stockDetails: result.details },
    });

    addToast('Stok başarıyla geri eklendi', 'success');
    setCancelConfirmOrder(null);
    setPendingStatusChange(null);
  };

  /**
   * Cancel/refund without restoring stock.
   */
  const skipStockRestore = () => {
    if (!cancelConfirmOrder || !pendingStatusChange) return;

    const order = cancelConfirmOrder;
    const oldStatus = order.status;
    executeStatusChange(order.id, pendingStatusChange.newStatus, oldStatus, order, {
      refundAmount: pendingStatusChange.newStatus === 'refunded' ? order.total : undefined,
    });

    setCancelConfirmOrder(null);
    setPendingStatusChange(null);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso">Siparişler</h1>
          <p className="text-warm-gray text-sm mt-1">{orders.length} sipariş</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
          <input
            type="text"
            placeholder="Sipariş ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-ivory border border-cream-dark/25 text-espresso text-sm focus:outline-none focus:border-gold/50 transition-all"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', ...ORDER_STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all ${
                statusFilter === status
                  ? 'bg-espresso text-cream'
                  : 'bg-ivory border border-cream-dark/20 text-walnut-light hover:bg-cream'
              }`}
            >
              {status === 'all' ? 'Tümü' : (STATUS_LABELS[status] || status)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      {filtered.length > 0 ? (
        <div className="bg-ivory rounded-2xl border border-cream-dark/15 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark/20 bg-cream-light/50">
                  <th className="text-left px-5 py-3.5 font-medium text-walnut text-xs tracking-wider uppercase">Sipariş</th>
                  <th className="text-left px-5 py-3.5 font-medium text-walnut text-xs tracking-wider uppercase">Müşteri</th>
                  <th className="text-left px-5 py-3.5 font-medium text-walnut text-xs tracking-wider uppercase">Tarih</th>
                  <th className="text-left px-5 py-3.5 font-medium text-walnut text-xs tracking-wider uppercase">Tutar</th>
                  <th className="text-left px-5 py-3.5 font-medium text-walnut text-xs tracking-wider uppercase">Stok</th>
                  <th className="text-left px-5 py-3.5 font-medium text-walnut text-xs tracking-wider uppercase">Durum</th>
                  <th className="text-right px-5 py-3.5 font-medium text-walnut text-xs tracking-wider uppercase"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="border-b border-cream-dark/10 hover:bg-cream-light/30 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-display font-semibold text-espresso">{order.id}</span>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-espresso">{order.customer?.firstName} {order.customer?.lastName}</p>
                      <p className="text-xs text-warm-gray">{order.customer?.email}</p>
                    </td>
                    <td className="px-5 py-4 text-warm-gray-dark">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-5 py-4 font-display font-semibold text-espresso">
                      ₺{(order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      {order.stockDeducted ? (
                        <div className="flex items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Lock className="w-2.5 h-2.5" />
                            Düşürüldü
                          </span>
                          {order.stockRestored && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-lime-50 text-lime-700 border border-lime-200">
                              <RotateCcw className="w-2.5 h-2.5" />
                              Geri
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-warm-gray">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`
                            pl-3 pr-8 py-1.5 rounded-full text-xs font-medium border appearance-none cursor-pointer
                            ${STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-700 border-gray-200'}
                          `}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-warm-gray hover:text-espresso hover:bg-cream transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-cream mx-auto flex items-center justify-center mb-4">
            <Package className="w-7 h-7 text-warm-gray" />
          </div>
          <p className="font-display text-lg text-espresso mb-1">Sipariş bulunamadı</p>
        </div>
      )}

      {/* ═══ Stock Deduction Confirmation Modal ═══ */}
      {stockConfirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" onClick={() => { setStockConfirmOrder(null); setPendingStatusChange(null); }} />
          <div className="relative bg-ivory rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-espresso">Stok Düşürme Onayı</h3>
                <p className="text-xs text-warm-gray">Sipariş: {stockConfirmOrder.id}</p>
              </div>
            </div>

            <p className="text-sm text-warm-gray-dark mb-4">
              Bu siparişi <strong>"Hazırlanıyor"</strong> durumuna geçirdiğinizde aşağıdaki ürünlerin stokları düşürülecektir:
            </p>

            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
              {(stockConfirmOrder.items || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-cream-light border border-cream-dark/15">
                  <div>
                    <p className="text-sm font-medium text-espresso">{typeof item.name === 'object' ? (item.name.tr || item.name.en) : (t(item.name) || item.name)}</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-700">x{item.quantity || 1}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStockConfirmOrder(null); setPendingStatusChange(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-cream-dark/25 text-warm-gray-dark text-sm font-medium hover:bg-cream transition-colors"
              >
                İptal
              </button>
              <button
                onClick={confirmStockDeduction}
                className="flex-1 px-4 py-2.5 rounded-xl bg-espresso text-cream text-sm font-medium hover:bg-walnut-light transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Onayla ve Düşür
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Stock Error Modal ═══ */}
      {stockError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" onClick={() => setStockError(null)} />
          <div className="relative bg-ivory rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-red-700">Yetersiz Stok!</h3>
                <p className="text-xs text-warm-gray">Sipariş: {stockError.order.id}</p>
              </div>
            </div>

            <p className="text-sm text-warm-gray-dark mb-4">
              Aşağıdaki ürünlerde yeterli stok bulunmadığı için sipariş "Hazırlanıyor" durumuna geçirilemez:
            </p>

            <div className="space-y-2 mb-6">
              {stockError.errors.map((err, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm font-medium text-red-800">{err.productName || err.productId}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Mevcut stok: <strong>{err.available}</strong> — İstenen: <strong>{err.requested}</strong>
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStockError(null)}
              className="w-full px-4 py-2.5 rounded-xl bg-espresso text-cream text-sm font-medium hover:bg-walnut-light transition-colors"
            >
              Anladım
            </button>
          </div>
        </div>
      )}

      {/* ═══ Cancel/Refund Confirmation Modal ═══ */}
      {cancelConfirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" onClick={() => { setCancelConfirmOrder(null); setPendingStatusChange(null); }} />
          <div className="relative bg-ivory rounded-2xl shadow-2xl w-full max-w-md p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-orange-700" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-espresso">Stok Geri Yükleme</h3>
                <p className="text-xs text-warm-gray">Sipariş: {cancelConfirmOrder.id}</p>
              </div>
            </div>

            <p className="text-sm text-warm-gray-dark mb-4">
              Bu sipariş için stok daha önce düşürülmüştü. Siparişi <strong>{pendingStatusChange?.newStatus === 'refunded' ? 'iade' : 'iptal'}</strong> ettiğinizde stok geri eklensin mi?
            </p>

            <div className="space-y-2 mb-6 max-h-48 overflow-y-auto">
              {(cancelConfirmOrder.items || []).map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-cream-light border border-cream-dark/15">
                  <p className="text-sm font-medium text-espresso">{typeof item.name === 'object' ? (item.name.tr || item.name.en) : (t(item.name) || item.name)}</p>
                  <span className="text-sm font-semibold text-orange-700">+{item.quantity || 1}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={skipStockRestore}
                className="flex-1 px-4 py-2.5 rounded-xl border border-cream-dark/25 text-warm-gray-dark text-sm font-medium hover:bg-cream transition-colors"
              >
                Stok Ekleme
              </button>
              <button
                onClick={confirmStockRestore}
                className="flex-1 px-4 py-2.5 rounded-xl bg-espresso text-cream text-sm font-medium hover:bg-walnut-light transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Stok Geri Ekle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Order Detail Modal ═══ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-ivory rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 md:p-8">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream transition-colors">
              <X className="w-4 h-4 text-walnut" />
            </button>

            <h2 className="font-display text-xl font-bold text-espresso mb-1">Sipariş Detayı</h2>
            <p className="text-sm text-warm-gray mb-4">{selectedOrder.id}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium border ${STATUS_COLORS[selectedOrder.status]}`}>
                {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
              </span>
              {selectedOrder.stockDeducted && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Lock className="w-3 h-3" />
                  Stok Düşürüldü
                </span>
              )}
              {selectedOrder.stockRestored && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-lime-50 text-lime-700 border border-lime-200">
                  <RotateCcw className="w-3 h-3" />
                  Stok Geri Eklendi
                </span>
              )}
            </div>

            {/* Stock Deduction Info */}
            {selectedOrder.stockDeducted && (
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 mb-4">
                <p className="text-xs text-indigo-700">
                  <strong>Stok Düşüren:</strong> {selectedOrder.stockDeductedBy || '—'} ({selectedOrder.stockDeductedByRole || '—'})
                </p>
                <p className="text-xs text-indigo-600 mt-1">
                  <strong>Tarih:</strong> {selectedOrder.stockDeductedAt ? new Date(selectedOrder.stockDeductedAt).toLocaleString('tr-TR') : '—'}
                </p>
              </div>
            )}

            {/* Customer Info */}
            <div className="space-y-3 mb-6 p-4 rounded-xl bg-cream-light border border-cream-dark/15">
              <h3 className="text-xs font-medium text-walnut tracking-wider uppercase">Müşteri</h3>
              <div className="flex items-center gap-2 text-sm text-walnut-light">
                <User className="w-3.5 h-3.5 text-warm-gray" />
                {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
              </div>
              <div className="flex items-center gap-2 text-sm text-walnut-light">
                <Mail className="w-3.5 h-3.5 text-warm-gray" />
                {selectedOrder.customer?.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-walnut-light">
                <Phone className="w-3.5 h-3.5 text-warm-gray" />
                {selectedOrder.customer?.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-walnut-light">
                <MapPin className="w-3.5 h-3.5 text-warm-gray" />
                {selectedOrder.customer?.address}, {selectedOrder.customer?.city} {selectedOrder.customer?.zip}
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xs font-medium text-walnut tracking-wider uppercase mb-3">Ürünler</h3>
              {selectedOrder.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-cream-light/50 border border-cream-dark/10">
                  <div>
                    <p className="text-sm font-medium text-espresso">{typeof item.name === 'object' ? (item.name.tr || item.name.en) : (t(item.name) || item.name)}</p>
                    <p className="text-xs text-warm-gray">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-espresso">₺{((item.price - (item.discount || 0)) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Status History */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xs font-medium text-walnut tracking-wider uppercase mb-3">Durum Geçmişi</h3>
                <div className="space-y-2">
                  {selectedOrder.statusHistory.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-cream-light/30 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full font-medium border ${STATUS_COLORS[entry.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {STATUS_LABELS[entry.status] || entry.status}
                        </span>
                        {entry.from && (
                          <span className="text-warm-gray">← {STATUS_LABELS[entry.from] || entry.from}</span>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-warm-gray-dark">{new Date(entry.timestamp).toLocaleString('tr-TR')}</p>
                        <p className="text-warm-gray">{entry.by}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4 border-t border-cream-dark/20">
              <span className="font-display text-lg font-semibold text-espresso">Toplam</span>
              <span className="font-display text-lg font-semibold text-espresso">₺{(selectedOrder.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
