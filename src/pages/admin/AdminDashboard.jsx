import React, { useMemo } from 'react';
import { useProducts } from '../../context/ProductContext';
import { useOrders } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import { Package, AlertCircle, ShoppingCart, DollarSign, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

/* ── Mini Bar Chart ── */
function MiniBarChart({ data, maxValue, color = 'bg-gold' }) {
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((value, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className={`w-full rounded-t-sm ${color} transition-all duration-700`}
            style={{ height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`, minHeight: value > 0 ? '4px' : '2px' }}
          />
        </div>
      ))}
    </div>
  );
}

/* ── Category Donut (CSS-only) ── */
function CategoryDonut({ categories, products }) {
  const categoryColors = ['#C8A96E', '#A8C5B8', '#4E342E', '#D4BC8A', '#8FB3A3', '#5D4037', '#EDE5D8', '#3E2723'];
  const data = categories
    .filter(c => c.id !== 'all')
    .map((cat, i) => ({
      name: cat.label || cat.id,
      count: products.filter(p => p.category === cat.id).length,
      color: categoryColors[i % categoryColors.length],
    }))
    .filter(d => d.count > 0);

  const total = data.reduce((s, d) => s + d.count, 0);

  // Compute segments before render to avoid mutating a local variable inside the JSX .map() loop
  const segments = [];
  let currentOffset = 0;
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const pct = total > 0 ? (d.count / total) * 100 : 0;
    segments.push({
      ...d,
      pct,
      offset: currentOffset,
    });
    currentOffset += pct;
  }

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="18" cy="18" r="15.9"
              fill="none"
              stroke={seg.color}
              strokeWidth="3.5"
              strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
              strokeDashoffset={-seg.offset}
              className="transition-all duration-700"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-lg font-bold text-espresso">{total}</span>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-xs text-warm-gray-dark truncate">{d.name} ({d.count})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { products, categories } = useProducts();
  const { orders, stats: orderStats } = useOrders();
  const { t } = useLanguage();
  const { isSuperAdmin, currentUser } = useAuth();

  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  // Weekly revenue mock data from orders
  const weeklyRevenue = useMemo(() => {
    const days = Array(7).fill(0);
    const now = new Date();
    orders.forEach(o => {
      if (o.status === 'cancelled') return;
      const orderDate = new Date(o.createdAt);
      const diffDays = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        days[6 - diffDays] += o.total || 0;
      }
    });
    return days;
  }, [orders]);

  const dayLabels = useMemo(() => {
    const labels = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(days[d.getDay()]);
    }
    return labels;
  }, []);

  // Build stats based on role
  const stats = [];

  // Everyone sees products and orders
  stats.push(
    { label: 'Toplam Ürün', value: products.length, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: t('adm_orders_count'), value: orderStats.totalOrders, icon: ShoppingCart, color: 'text-purple-500', bg: 'bg-purple-50', link: '/admin/orders' },
  );

  // Only superadmin sees revenue
  if (isSuperAdmin) {
    stats.push(
      { label: t('adm_revenue'), value: `₺${orderStats.totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50' },
    );
  }

  // Everyone sees out of stock
  stats.push(
    { label: 'Stok Tükenen', value: outOfStockProducts, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-espresso">Dashboard</h1>
        <p className="text-warm-gray text-sm mt-1">
          Hoş geldiniz, <span className="font-medium text-espresso">{currentUser?.username || currentUser?.name}</span>
          {!isSuperAdmin && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wider uppercase bg-blue-100 text-blue-800">
              Personel
            </span>
          )}
        </p>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 mb-8`}>
        {stats.map((stat, idx) => {
          const Wrapper = stat.link ? Link : 'div';
          const wrapperProps = stat.link ? { to: stat.link } : {};
          return (
            <Wrapper key={idx} {...wrapperProps} className="bg-ivory p-6 rounded-2xl shadow-sm border border-cream-dark/25 flex items-center hover:shadow-md transition-all">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 ${stat.bg}`}>
                <stat.icon className={`w-7 h-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-warm-gray mb-1">{stat.label}</p>
                <h3 className="font-display text-2xl font-bold text-espresso">{stat.value}</h3>
              </div>
            </Wrapper>
          );
        })}
      </div>

      {/* Charts Row - Only show revenue chart for superadmin */}
      <div className={`grid grid-cols-1 ${isSuperAdmin ? 'lg:grid-cols-2' : ''} gap-6 mb-8`}>
        {/* Weekly Revenue Chart - SuperAdmin only */}
        {isSuperAdmin && (
          <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-espresso">{t('adm_daily_sales')}</h2>
              <span className="text-xs text-warm-gray px-3 py-1 bg-cream-light rounded-full">{t('adm_weekly')}</span>
            </div>
            <MiniBarChart data={weeklyRevenue} maxValue={Math.max(...weeklyRevenue, 1)} color="bg-gold" />
            <div className="flex justify-between mt-2">
              {dayLabels.map((d, i) => (
                <span key={i} className="text-[10px] text-warm-gray flex-1 text-center">{d}</span>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-cream-dark/15 flex items-center justify-between">
              <span className="text-sm text-warm-gray">{t('adm_weekly')} {t('adm_revenue')}</span>
              <span className="font-display text-xl font-bold text-espresso">₺{weeklyRevenue.reduce((a, b) => a + b, 0).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Category Distribution */}
        <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-lg font-bold text-espresso">{t('adm_category_dist')}</h2>
            <BarChart3 className="w-5 h-5 text-warm-gray" />
          </div>
          <CategoryDonut categories={categories} products={products} />
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-cream-dark/25 flex justify-between items-center">
          <h2 className="font-display text-xl font-bold text-espresso">{t('adm_recent_orders')}</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-gold hover:text-espresso transition-colors">
            Tümünü Gör
          </Link>
        </div>
        <div className="divide-y divide-cream-dark/25">
          {orders.slice(0, 5).map(order => (
            <div key={order.id} className="p-4 px-6 flex items-center justify-between hover:bg-champagne/50 transition-colors">
              <div>
                <h4 className="font-medium text-espresso">{order.id}</h4>
                <p className="text-xs text-warm-gray">{order.customer?.firstName} {order.customer?.lastName} · {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                  order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  order.status === 'preparing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-cream-light text-warm-gray border-cream-dark/20'
                }`}>
                  {t(`ord_${order.status}`)}
                </span>
                {/* Only show order totals for superadmin */}
                {isSuperAdmin && (
                  <p className="font-display font-semibold text-espresso">₺{(order.total || 0).toFixed(2)}</p>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="p-8 text-center text-warm-gray">{t('ord_no_orders')}</div>
          )}
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 overflow-hidden">
        <div className="px-6 py-5 border-b border-cream-dark/25 flex justify-between items-center">
          <h2 className="font-display text-xl font-bold text-espresso">Son Ürünler</h2>
          <Link to="/admin/products" className="text-sm font-medium text-gold hover:text-espresso transition-colors">
            Tümünü Gör
          </Link>
        </div>
        <div className="divide-y divide-cream-dark/25">
          {products.slice(0, 5).map(product => (
            <div key={product.id} className="p-4 px-6 flex items-center justify-between hover:bg-champagne/50 transition-colors">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-cream overflow-hidden mr-4 border border-cream-dark/20">
                  <img src={product.images ? product.images[0] : product.image} alt={t(product.name)} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-medium text-espresso">{t(product.name)}</h4>
                  <p className="text-xs text-warm-gray uppercase tracking-wider">{product.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-espresso">₺{product.price.toFixed(2)}</p>
                <p className={`text-xs mt-1 ${product.stock > 5 ? 'text-green-500' : product.stock > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                  {product.stock} stok
                </p>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="p-8 text-center text-warm-gray">Ürün bulunamadı.</div>
          )}
        </div>
      </div>
    </div>
  );
}
