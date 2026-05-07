import React, { useState, useMemo } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminProducts() {
  const { products, deleteProduct, categories } = useProducts();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const nameStr = (t(p.name) || '').toLowerCase();
      const matchesSearch = nameStr.includes(searchQuery.toLowerCase()) || 
                           p.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, categoryFilter]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="font-display text-3xl font-bold text-espresso">Products</h1>
        <Link 
          to="/admin/products/new" 
          className="bg-espresso text-cream px-5 py-2.5 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 hover:bg-walnut-light transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-cream-dark/25 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-champagne border border-cream-dark/25 focus:outline-none focus:ring-2 focus:ring-gold/50 cursor-pointer min-w-[160px]"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.label || c.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-champagne/50 text-warm-gray text-xs uppercase tracking-wider">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-dark/25">
              {filteredProducts.map(product => {
                const finalPrice = product.price - (product.discount || 0);
                return (
                  <tr key={product.id} className="hover:bg-champagne/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-cream flex-shrink-0 flex items-center justify-center overflow-hidden border border-cream-dark/20">
                          {product.images?.[0] || product.image ? (
                            <img src={product.images?.[0] || product.image} alt={t(product.name)} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-warm-gray/50" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-espresso">{t(product.name)}</p>
                          <p className="text-xs text-warm-gray">ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-warm-gray capitalize">
                      {product.category}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-espresso">€{finalPrice.toFixed(2)}</div>
                      {product.discount > 0 && (
                        <div className="text-xs text-warm-gray line-through">€{product.price.toFixed(2)}</div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock > 10 ? 'bg-green-100 text-green-700' :
                        product.stock > 0 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                        product.status === 'active' ? 'bg-mint text-espresso' : 'bg-warm-gray/20 text-warm-gray-dark'
                      }`}>
                        {product.status || 'active'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link 
                        to={`/admin/products/${product.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-champagne text-warm-gray hover:text-espresso hover:bg-cream transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-warm-gray">
                    No products found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
