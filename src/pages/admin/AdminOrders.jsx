import { useState, useMemo } from 'react';
import { Package, ChevronDown, Search, Eye, X, MapPin, Phone, Mail, User } from 'lucide-react';
import { useOrders } from '../../context/OrderContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

const STATUS_COLORS = {
  new: 'bg-amber-50 text-amber-700 border-amber-200',
  preparing: 'bg-blue-50 text-blue-700 border-blue-200',
  ready: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function AdminOrders() {
  const { orders, updateOrderStatus, ORDER_STATUSES } = useOrders();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    addToast(`Order status updated to ${t(`ord_${newStatus}`)}`, 'success');
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso">{t('ord_title')}</h1>
          <p className="text-warm-gray text-sm mt-1">{orders.length} {t('ord_title').toLowerCase()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
          <input
            type="text"
            placeholder="Search orders..."
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
              {status === 'all' ? t('ord_all') : t(`ord_${status}`)}
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
                  <th className="text-left px-5 py-3.5 font-medium text-walnut text-xs tracking-wider uppercase">{t('ord_order')}</th>
                  <th className="text-left px-5 py-3.5 font-medium text-walnut text-xs tracking-wider uppercase">{t('ord_customer')}</th>
                  <th className="text-left px-5 py-3.5 font-medium text-walnut text-xs tracking-wider uppercase">{t('ord_date')}</th>
                  <th className="text-left px-5 py-3.5 font-medium text-walnut text-xs tracking-wider uppercase">{t('ord_total')}</th>
                  <th className="text-left px-5 py-3.5 font-medium text-walnut text-xs tracking-wider uppercase">{t('ord_status')}</th>
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
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 font-display font-semibold text-espresso">
                      ₺{(order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="relative inline-block">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`
                            pl-3 pr-8 py-1.5 rounded-full text-xs font-medium border appearance-none cursor-pointer
                            ${STATUS_COLORS[order.status]}
                          `}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{t(`ord_${s}`)}</option>
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
          <p className="font-display text-lg text-espresso mb-1">{t('ord_no_orders')}</p>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-espresso/40 backdrop-blur-sm animate-modal-overlay" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-ivory rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6 md:p-8 animate-modal-content">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center hover:bg-cream transition-colors">
              <X className="w-4 h-4 text-walnut" />
            </button>

            <h2 className="font-display text-xl font-bold text-espresso mb-1">{t('ord_details')}</h2>
            <p className="text-sm text-warm-gray mb-6">{selectedOrder.id}</p>

            <div className={`inline-flex px-3 py-1.5 rounded-full text-xs font-medium border mb-6 ${STATUS_COLORS[selectedOrder.status]}`}>
              {t(`ord_${selectedOrder.status}`)}
            </div>

            {/* Customer Info */}
            <div className="space-y-3 mb-6 p-4 rounded-xl bg-cream-light border border-cream-dark/15">
              <h3 className="text-xs font-medium text-walnut tracking-wider uppercase">{t('ord_customer')}</h3>
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
              <h3 className="text-xs font-medium text-walnut tracking-wider uppercase mb-3">{t('ord_items')}</h3>
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 rounded-lg bg-cream-light/50 border border-cream-dark/10">
                  <div>
                    <p className="text-sm font-medium text-espresso">{t(item.name)}</p>
                    <p className="text-xs text-warm-gray">x{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-espresso">₺{((item.price - (item.discount || 0)) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4 border-t border-cream-dark/20">
              <span className="font-display text-lg font-semibold text-espresso">{t('ord_total')}</span>
              <span className="font-display text-lg font-semibold text-espresso">₺{(selectedOrder.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
