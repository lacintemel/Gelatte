import React from 'react';
import { useProducts } from '../../context/ProductContext';
import { Package, FolderTree, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminDashboard() {
  const { products, categories } = useProducts();
  const { t } = useLanguage();

  const activeProducts = products.filter(p => p.status === 'active').length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Products', value: activeProducts, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Categories', value: categories.length, icon: FolderTree, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Out of Stock', value: outOfStockProducts, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-espresso mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-ivory p-6 rounded-2xl shadow-sm border border-cream-dark/25 flex items-center">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 ${stat.bg}`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-warm-gray mb-1">{stat.label}</p>
              <h3 className="font-display text-2xl font-bold text-espresso">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 overflow-hidden">
        <div className="px-6 py-5 border-b border-cream-dark/25 flex justify-between items-center">
          <h2 className="font-display text-xl font-bold text-espresso">Recent Products</h2>
          <Link to="/admin/products" className="text-sm font-medium text-gold hover:text-espresso transition-colors">
            View All
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
                <p className="font-semibold text-espresso">€{product.price.toFixed(2)}</p>
                <p className={`text-xs mt-1 ${product.stock > 5 ? 'text-green-500' : product.stock > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                  {product.stock} in stock
                </p>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="p-8 text-center text-warm-gray">No products found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
