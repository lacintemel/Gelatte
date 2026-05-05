import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export default function AdminCategories() {
  const { categories, addCategory, updateCategory, deleteCategory } = useProducts();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [newCatData, setNewCatData] = useState({ id: '', label: '' });
  const [editCatData, setEditCatData] = useState({ label: '' });

  const handleAdd = () => {
    if (!newCatData.id.trim() || !newCatData.label.trim()) return;
    
    // Ensure ID is lowercase and has no spaces
    const cleanId = newCatData.id.toLowerCase().replace(/\s+/g, '-');
    addCategory({ id: cleanId, label: newCatData.label });
    setNewCatData({ id: '', label: '' });
    setIsAdding(false);
  };

  const handleUpdate = (id) => {
    if (!editCatData.label.trim()) return;
    updateCategory(id, { label: editCatData.label });
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (id === 'all') {
      alert("Cannot delete the 'All' category.");
      return;
    }
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-espresso">Categories</h1>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-espresso text-cream px-5 py-2.5 rounded-xl font-medium tracking-wide flex items-center gap-2 hover:bg-walnut-light transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <div className="bg-ivory rounded-2xl shadow-sm border border-cream-dark/25 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-champagne/50 text-warm-gray text-xs uppercase tracking-wider">
              <th className="p-4 font-medium w-1/3">ID</th>
              <th className="p-4 font-medium w-1/3">Label (Name)</th>
              <th className="p-4 font-medium w-1/3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-dark/25">
            {isAdding && (
              <tr className="bg-champagne/30">
                <td className="p-4">
                  <input
                    type="text"
                    placeholder="e.g. ice-cream"
                    value={newCatData.id}
                    onChange={(e) => setNewCatData({ ...newCatData, id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-cream-dark/25 focus:outline-none focus:border-gold/50"
                  />
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    placeholder="e.g. Ice Cream"
                    value={newCatData.label}
                    onChange={(e) => setNewCatData({ ...newCatData, label: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-cream-dark/25 focus:outline-none focus:border-gold/50"
                  />
                </td>
                <td className="p-4 text-right space-x-2">
                  <button 
                    onClick={handleAdd}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setIsAdding(false)}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            )}
            
            {categories.map(category => (
              <tr key={category.id} className="hover:bg-champagne/30 transition-colors">
                <td className="p-4 text-sm text-warm-gray font-mono">
                  {category.id}
                </td>
                <td className="p-4">
                  {editingId === category.id ? (
                    <input
                      type="text"
                      value={editCatData.label}
                      onChange={(e) => setEditCatData({ label: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-cream-dark/25 focus:outline-none focus:border-gold/50"
                      autoFocus
                    />
                  ) : (
                    <span className="font-medium text-espresso">{category.label || category.name}</span>
                  )}
                </td>
                <td className="p-4 text-right space-x-2">
                  {editingId === category.id ? (
                    <>
                      <button 
                        onClick={() => handleUpdate(category.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setEditingId(category.id);
                          setEditCatData({ label: category.label || category.name || '' });
                        }}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-champagne text-warm-gray hover:text-espresso hover:bg-cream transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {category.id !== 'all' && (
                        <button 
                          onClick={() => handleDelete(category.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
            {categories.length === 0 && !isAdding && (
              <tr>
                <td colSpan="3" className="p-8 text-center text-warm-gray">
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
