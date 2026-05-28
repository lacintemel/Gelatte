import { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, ArrowDownRight, ArrowUpRight, Calendar, Filter, BarChart3, Package, CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';
import { useFinancials } from '../../context/FinancialContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const PAYMENT_METHOD_LABELS = {
  online: 'Online Ödeme',
  credit_card: 'Kredi Kartı',
  cash: 'Nakit',
  bank_transfer: 'Banka Transferi',
  debit_card: 'Banka Kartı',
};

const PAYMENT_METHOD_COLORS = {
  online: 'bg-blue-500',
  credit_card: 'bg-purple-500',
  cash: 'bg-emerald-500',
  bank_transfer: 'bg-amber-500',
  debit_card: 'bg-indigo-500',
};

function formatCurrency(amount) {
  return `₺${(amount || 0).toFixed(2)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('tr-TR');
}

function getToday() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/* ─────────────────────────────────────────────
   Summary Card
   ───────────────────────────────────────────── */
function SummaryCard({ icon: Icon, label, value, iconColor = 'text-green-500', iconBg = 'bg-green-50', trend, trendUp }) {
  return (
    <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 p-6 flex items-center gap-4 hover:shadow-md transition-all">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className={`w-7 h-7 ${iconColor}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-warm-gray mb-1 truncate">{label}</p>
        <h3 className="font-display text-2xl font-bold text-espresso truncate">{value}</h3>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
            {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sales Table
   ───────────────────────────────────────────── */
function SalesTable({ rows, dateLabel = 'Tarih' }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="p-8 text-center text-warm-gray">
        <BarChart3 className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>Bu dönem için kayıt bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-cream-light/50">
            <th className="text-left px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold">{dateLabel}</th>
            <th className="text-right px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold">Sipariş</th>
            <th className="text-right px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold">Gelir</th>
            <th className="text-right px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold hidden md:table-cell">İndirimler</th>
            <th className="text-right px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold hidden md:table-cell">Vergi</th>
            <th className="text-right px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold hidden lg:table-cell">İadeler</th>
            <th className="text-right px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold">Net Gelir</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cream-dark/15">
          {rows.map((row, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-cream-light/50' : 'bg-transparent'}>
              <td className="px-4 py-3 text-espresso font-medium">{row.label}</td>
              <td className="px-4 py-3 text-right text-espresso">{row.orderCount}</td>
              <td className="px-4 py-3 text-right font-display font-semibold text-green-700">{formatCurrency(row.totalRevenue)}</td>
              <td className="px-4 py-3 text-right text-warm-gray hidden md:table-cell">{formatCurrency(row.totalDiscounts)}</td>
              <td className="px-4 py-3 text-right text-warm-gray hidden md:table-cell">{formatCurrency(row.totalTax)}</td>
              <td className="px-4 py-3 text-right text-red-500 hidden lg:table-cell">{formatCurrency(row.totalRefunds)}</td>
              <td className="px-4 py-3 text-right font-display font-bold text-espresso">{formatCurrency(row.netRevenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═════════════════════════════════════════════
   Main Page Component
   ═════════════════════════════════════════════ */
export default function AdminFinancialHistory() {
  const { isSuperAdmin } = useAuth();
  const {
    records,
    overallSummary,
    getDailySales,
    getWeeklySales,
    getMonthlySales,
    getYearlySales,
    getDailyBreakdown,
    getMonthlyBreakdown,
    getSalesByProduct,
    getSalesByPaymentMethod,
    getRecordsByDateRange,
    aggregateSales,
  } = useFinancials();

  const [activeTab, setActiveTab] = useState('daily');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // ── Access Check ──
  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 p-12 text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-espresso mb-2">Erişim Reddedildi</h2>
          <p className="text-warm-gray">Bu sayfaya erişim yetkiniz bulunmamaktadır. Yalnızca süper yöneticiler finansal geçmişi görüntüleyebilir.</p>
        </div>
      </div>
    );
  }

  // ── Dates ──
  const today = getToday();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  // ── Summary Values ──
  const todaySales = getDailySales(today);
  const monthSales = getMonthlySales(currentYear, currentMonth);

  // ── Time Period Data ──
  const timePeriodRows = useMemo(() => {
    if (activeTab === 'daily') {
      const from = new Date(today);
      from.setDate(from.getDate() - 29);
      const breakdown = getDailyBreakdown(from, today);
      return breakdown.map(day => ({
        ...day,
        label: new Date(day.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
      })).reverse();
    }

    if (activeTab === 'weekly') {
      const weeks = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay() + 1);
        const data = getWeeklySales(weekStart);
        weeks.push({
          ...data,
          label: `${new Date(data.from).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} – ${new Date(data.to).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}`,
        });
      }
      return weeks.reverse();
    }

    if (activeTab === 'monthly') {
      const breakdown = getMonthlyBreakdown(currentYear);
      return breakdown.map(m => ({
        ...m,
        label: `${MONTH_NAMES[m.month - 1]} ${m.year}`,
      }));
    }

    if (activeTab === 'yearly') {
      const years = [];
      for (let y = currentYear; y >= currentYear - 2; y--) {
        const data = getYearlySales(y);
        years.push({ ...data, label: `${y}` });
      }
      return years;
    }

    return [];
  }, [activeTab, today, currentYear, getDailyBreakdown, getWeeklySales, getMonthlyBreakdown, getYearlySales]);

  // ── Custom Date Range ──
  const customRangeData = useMemo(() => {
    if (!dateFrom || !dateTo) return null;
    const rangeRecords = getRecordsByDateRange(new Date(dateFrom), new Date(dateTo));
    return aggregateSales(rangeRecords);
  }, [dateFrom, dateTo, getRecordsByDateRange, aggregateSales]);

  // ── Sales by Product ──
  const productSales = useMemo(() => getSalesByProduct(), [getSalesByProduct]);

  // ── Sales by Payment Method ──
  const paymentMethodSales = useMemo(() => getSalesByPaymentMethod(), [getSalesByPaymentMethod]);

  // ── Cancelled / Refunded Records ──
  const cancelledRefundedRecords = useMemo(() => {
    return records.filter(r => r.isCancelled || r.isRefunded)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [records]);

  const tabs = [
    { key: 'daily', label: 'Günlük' },
    { key: 'weekly', label: 'Haftalık' },
    { key: 'monthly', label: 'Aylık' },
    { key: 'yearly', label: 'Yıllık' },
  ];

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-espresso">Finansal Geçmiş</h1>
        <p className="text-warm-gray text-sm mt-1">
          Gelir, gider, iade ve kâr detaylarını görüntüleyin.
        </p>
      </div>

      {/* ══════════════════════════════════════════
          1. Summary Cards
          ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <SummaryCard
          icon={DollarSign}
          label="Toplam Gelir"
          value={formatCurrency(overallSummary.totalRevenue)}
          iconColor="text-green-500"
          iconBg="bg-green-50"
        />
        <SummaryCard
          icon={TrendingUp}
          label="Net Kâr"
          value={formatCurrency(overallSummary.netRevenue)}
          iconColor="text-blue-500"
          iconBg="bg-blue-50"
        />
        <SummaryCard
          icon={ArrowUpRight}
          label="Bugünkü Satış"
          value={formatCurrency(todaySales.totalRevenue)}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50"
        />
        <SummaryCard
          icon={Calendar}
          label="Bu Ayın Satışı"
          value={formatCurrency(monthSales.totalRevenue)}
          iconColor="text-purple-500"
          iconBg="bg-purple-50"
        />
        <SummaryCard
          icon={RefreshCw}
          label="İadeler"
          value={formatCurrency(overallSummary.totalRefunds)}
          iconColor="text-red-500"
          iconBg="bg-red-50"
        />
        <SummaryCard
          icon={ShoppingCart}
          label="Ort. Sipariş"
          value={formatCurrency(overallSummary.avgOrderValue)}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
        />
      </div>

      {/* ══════════════════════════════════════════
          2. Time Period Tabs + Sales Table
          ══════════════════════════════════════════ */}
      <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 overflow-hidden mb-8">
        {/* Tab Bar */}
        <div className="px-6 pt-5 pb-0 border-b border-cream-dark/25">
          <div className="flex items-center justify-between mb-0">
            <h2 className="font-display text-xl font-bold text-espresso flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-warm-gray" />
              Satış Analizi
            </h2>
          </div>
          <div className="flex gap-1 mt-4">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all border-b-2 ${
                  activeTab === tab.key
                    ? 'bg-cream-light/70 text-espresso border-espresso'
                    : 'text-warm-gray border-transparent hover:text-espresso hover:bg-cream-light/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sales Table */}
        <SalesTable
          rows={timePeriodRows}
          dateLabel={
            activeTab === 'daily' ? 'Tarih' :
            activeTab === 'weekly' ? 'Hafta' :
            activeTab === 'monthly' ? 'Ay' : 'Yıl'
          }
        />
      </div>

      {/* ══════════════════════════════════════════
          3. Date Range Filter
          ══════════════════════════════════════════ */}
      <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 p-6 mb-8">
        <h2 className="font-display text-xl font-bold text-espresso flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-warm-gray" />
          Özel Tarih Aralığı
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs text-walnut uppercase tracking-wider font-semibold mb-1.5">Başlangıç</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-dark/25 bg-cream-light/30 text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
          <div className="flex-1 w-full">
            <label className="block text-xs text-walnut uppercase tracking-wider font-semibold mb-1.5">Bitiş</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-cream-dark/25 bg-cream-light/30 text-espresso text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); }}
            className="px-5 py-2.5 bg-espresso text-cream rounded-xl hover:bg-walnut-light transition-colors text-sm font-medium whitespace-nowrap"
          >
            Temizle
          </button>
        </div>

        {/* Custom Range Results */}
        {customRangeData && (
          <div className="mt-6 pt-6 border-t border-cream-dark/15">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-xs text-warm-gray mb-1">Sipariş</p>
                <p className="font-display text-lg font-bold text-espresso">{customRangeData.orderCount}</p>
              </div>
              <div>
                <p className="text-xs text-warm-gray mb-1">Gelir</p>
                <p className="font-display text-lg font-bold text-green-700">{formatCurrency(customRangeData.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-xs text-warm-gray mb-1">Net Gelir</p>
                <p className="font-display text-lg font-bold text-espresso">{formatCurrency(customRangeData.netRevenue)}</p>
              </div>
              <div>
                <p className="text-xs text-warm-gray mb-1">İndirimler</p>
                <p className="font-display text-lg font-bold text-warm-gray">{formatCurrency(customRangeData.totalDiscounts)}</p>
              </div>
              <div>
                <p className="text-xs text-warm-gray mb-1">İadeler</p>
                <p className="font-display text-lg font-bold text-red-500">{formatCurrency(customRangeData.totalRefunds)}</p>
              </div>
              <div>
                <p className="text-xs text-warm-gray mb-1">Ort. Sipariş</p>
                <p className="font-display text-lg font-bold text-espresso">{formatCurrency(customRangeData.avgOrderValue)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          4. Sales by Product
          ══════════════════════════════════════════ */}
      <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-cream-dark/25">
          <h2 className="font-display text-xl font-bold text-espresso flex items-center gap-2">
            <Package className="w-5 h-5 text-warm-gray" />
            Ürün Bazlı Satışlar
          </h2>
        </div>

        {productSales.length === 0 ? (
          <div className="p-8 text-center text-warm-gray">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Henüz ürün satış kaydı bulunmuyor.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream-light/50">
                  <th className="text-left px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold">Ürün</th>
                  <th className="text-right px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold">Satılan Adet</th>
                  <th className="text-right px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold">Gelir</th>
                  <th className="text-right px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold hidden sm:table-cell">Ort. Fiyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-dark/15">
                {productSales.map((product, idx) => (
                  <tr key={product.productId || idx} className={idx % 2 === 0 ? 'bg-cream-light/50' : 'bg-transparent'}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <div className="w-10 h-10 rounded-lg bg-cream overflow-hidden border border-cream-dark/20 shrink-0">
                            <img src={product.image} alt={product.productName} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-cream-light flex items-center justify-center border border-cream-dark/20 shrink-0">
                            <Package className="w-5 h-5 text-warm-gray/50" />
                          </div>
                        )}
                        <span className="text-espresso font-medium truncate">{product.productName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-espresso font-display font-semibold">{product.unitsSold}</td>
                    <td className="px-4 py-3 text-right font-display font-semibold text-green-700">{formatCurrency(product.totalRevenue)}</td>
                    <td className="px-4 py-3 text-right text-warm-gray hidden sm:table-cell">{formatCurrency(product.avgPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          5. Sales by Payment Method
          ══════════════════════════════════════════ */}
      <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 p-6 mb-8">
        <h2 className="font-display text-xl font-bold text-espresso flex items-center gap-2 mb-6">
          <CreditCard className="w-5 h-5 text-warm-gray" />
          Ödeme Yöntemine Göre Satışlar
        </h2>

        {paymentMethodSales.length === 0 ? (
          <div className="p-8 text-center text-warm-gray">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Henüz ödeme kaydı bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paymentMethodSales.map((pm, idx) => (
              <div key={pm.method} className="bg-cream-light/50 rounded-xl p-5 border border-cream-dark/15">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-espresso text-sm">
                    {PAYMENT_METHOD_LABELS[pm.method] || pm.method}
                  </h3>
                  <span className="text-xs text-warm-gray bg-cream rounded-full px-2.5 py-0.5">
                    {pm.orderCount} sipariş
                  </span>
                </div>
                <p className="font-display text-xl font-bold text-espresso mb-3">
                  {formatCurrency(pm.totalRevenue)}
                </p>
                {/* Percentage Bar */}
                <div className="w-full bg-cream rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${PAYMENT_METHOD_COLORS[pm.method] || 'bg-gold'}`}
                    style={{ width: `${pm.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-warm-gray mt-1.5 text-right">%{pm.percentage.toFixed(1)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          6. Cancelled / Refunded Orders
          ══════════════════════════════════════════ */}
      <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-cream-dark/25">
          <h2 className="font-display text-xl font-bold text-espresso flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            İptal ve İade Edilen Siparişler
          </h2>
        </div>

        {cancelledRefundedRecords.length === 0 ? (
          <div className="p-8 text-center text-warm-gray">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>İptal veya iade edilen sipariş bulunmuyor.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-light/50">
                    <th className="text-left px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold">Sipariş No</th>
                    <th className="text-left px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold">Müşteri</th>
                    <th className="text-right px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold">Tutar</th>
                    <th className="text-right px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold">İade Tutarı</th>
                    <th className="text-center px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold">Durum</th>
                    <th className="text-right px-4 py-3 text-walnut text-xs uppercase tracking-wider font-semibold">Tarih</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-dark/15">
                  {cancelledRefundedRecords.map((record, idx) => (
                    <tr key={record.id} className={idx % 2 === 0 ? 'bg-cream-light/50' : 'bg-transparent'}>
                      <td className="px-4 py-3 text-espresso font-medium font-mono text-xs">{record.orderNumber}</td>
                      <td className="px-4 py-3 text-espresso">{record.customerName}</td>
                      <td className="px-4 py-3 text-right font-display font-semibold text-espresso">{formatCurrency(record.totalAmount)}</td>
                      <td className="px-4 py-3 text-right font-display font-semibold text-red-500">
                        {record.isRefunded ? formatCurrency(record.refundAmount) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {record.isCancelled && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                            İptal
                          </span>
                        )}
                        {record.isRefunded && !record.isCancelled && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            İade
                          </span>
                        )}
                        {record.isCancelled && record.isRefunded && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 ml-1">
                            İade
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-warm-gray text-xs">
                        {formatDate(record.cancelledAt || record.refundedAt || record.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-cream-dark/15">
              {cancelledRefundedRecords.map(record => (
                <div key={record.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-espresso font-medium">{record.orderNumber}</span>
                    <div className="flex gap-1.5">
                      {record.isCancelled && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
                          İptal
                        </span>
                      )}
                      {record.isRefunded && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          İade
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-espresso mb-1">{record.customerName}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-display font-semibold text-espresso">{formatCurrency(record.totalAmount)}</span>
                      {record.isRefunded && (
                        <span className="text-sm font-display font-semibold text-red-500">-{formatCurrency(record.refundAmount)}</span>
                      )}
                    </div>
                    <span className="text-xs text-warm-gray">
                      {formatDate(record.cancelledAt || record.refundedAt || record.updatedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
