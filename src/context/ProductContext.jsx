import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { logDetailedAuditEvent } = useAuth();
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({ limit: 100 }), // Get all for store
        api.getCategories(),
      ]);

      if (catRes.success) {
        setCategories(catRes.data);
      }

      if (prodRes.success) {
        const parsedProducts = prodRes.data.products.map(p => {
          let nameObj = p.name;
          let descObj = p.description;
          try { nameObj = JSON.parse(p.name); } catch { nameObj = p.name; }
          try { descObj = JSON.parse(p.description); } catch { descObj = p.description; }
          
          return {
            ...p,
            name: nameObj,
            description: descObj,
            image: p.images?.[0]?.url || '',
            images: p.images?.map(i => i.url) || [],
            category: p.categoryId,
          };
        });
        setProducts(parsedProducts);
      }
    } catch (err) {
      console.error('Failed to fetch store data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const saveProducts = useCallback((nextProducts) => {
    setProducts(nextProducts);
  }, []);

  const saveCategories = useCallback((nextCategories) => {
    setCategories(nextCategories);
  }, []);

  // --- Products CRUD with API ---
  const addProduct = useCallback(async (product) => {
    try {
      const payload = {
        name: JSON.stringify(product.name),
        description: JSON.stringify(product.description),
        price: product.price,
        discount: product.discount || 0,
        stock: product.stock || 0,
        categoryId: product.category,
        badge: product.badge || null,
        status: product.status || 'active',
        showInMenu: product.showInMenu !== false,
        availableForOnlineOrder: product.availableForOnlineOrder !== false,
        images: product.images ? product.images.map(img => ({ url: img })) : [],
      };

      const response = await api.admin.createProduct(payload);
      if (response.success) {
        await fetchProducts(); // Refresh list
        
        if (logDetailedAuditEvent) {
          logDetailedAuditEvent({
            actionType: 'product.created',
            module: 'products',
            recordId: response.data.id,
            description: `Yeni ürün oluşturuldu`,
          });
        }
        return response.data;
      }
    } catch (err) {
      console.error('Add product error:', err);
      throw err;
    }
  }, [fetchProducts, logDetailedAuditEvent]);

  const updateProduct = useCallback(async (id, updatedData) => {
    try {
      const payload = {};
      if (updatedData.name) payload.name = JSON.stringify(updatedData.name);
      if (updatedData.description) payload.description = JSON.stringify(updatedData.description);
      if (updatedData.price !== undefined) payload.price = updatedData.price;
      if (updatedData.discount !== undefined) payload.discount = updatedData.discount;
      if (updatedData.stock !== undefined) payload.stock = updatedData.stock;
      if (updatedData.category) payload.categoryId = updatedData.category;
      if (updatedData.badge !== undefined) payload.badge = updatedData.badge;
      if (updatedData.status) payload.status = updatedData.status;
      if (updatedData.showInMenu !== undefined) payload.showInMenu = updatedData.showInMenu;
      if (updatedData.availableForOnlineOrder !== undefined) payload.availableForOnlineOrder = updatedData.availableForOnlineOrder;
      
      if (updatedData.images) {
        payload.images = updatedData.images.map(img => ({ url: img }));
      }

      const response = await api.admin.updateProduct(id, payload);
      if (response.success) {
        await fetchProducts();
        
        if (logDetailedAuditEvent) {
          logDetailedAuditEvent({
            actionType: 'product.updated',
            module: 'products',
            recordId: id,
            description: `Ürün güncellendi`,
          });
        }
      }
    } catch (err) {
      console.error('Update product error:', err);
      throw err;
    }
  }, [fetchProducts, logDetailedAuditEvent]);

  const deleteProduct = useCallback(async (id) => {
    try {
      const response = await api.admin.deleteProduct(id);
      if (response.success) {
        await fetchProducts();
        if (logDetailedAuditEvent) {
          logDetailedAuditEvent({
            actionType: 'product.deleted',
            module: 'products',
            recordId: id,
            description: `Ürün silindi`,
          });
        }
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  }, [fetchProducts, logDetailedAuditEvent]);

  // ══════════════════════════════════════════
  // ── Stock Management Methods ──
  // ══════════════════════════════════════════

  /**
   * Deduct stock for a single product.
   * @returns {{ success: boolean, newStock?: number, error?: string }}
   */
  const deductStock = useCallback((productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, error: `Ürün bulunamadı: ${productId}` };
    if (product.stock < quantity) {
      const productName = typeof product.name === 'object' ? (product.name.tr || product.name.en || productId) : product.name;
      return {
        success: false,
        error: `Yetersiz stok: "${productName}" - Mevcut: ${product.stock}, İstenen: ${quantity}`,
        productName,
        available: product.stock,
        requested: quantity,
      };
    }

    const newStock = product.stock - quantity;
    const newProducts = products.map(p =>
      p.id === productId ? { ...p, stock: newStock } : p
    );
    saveProducts(newProducts);
    return { success: true, newStock };
  }, [products, saveProducts]);

  /**
   * Restore stock for a single product.
   * @returns {{ success: boolean, newStock?: number }}
   */
  const restoreStock = useCallback((productId, quantity) => {
    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, error: `Ürün bulunamadı: ${productId}` };

    const newStock = product.stock + quantity;
    const newProducts = products.map(p =>
      p.id === productId ? { ...p, stock: newStock } : p
    );
    saveProducts(newProducts);
    return { success: true, newStock };
  }, [products, saveProducts]);

  /**
   * Atomically deduct stock for multiple products (all-or-nothing).
   * @param {Array<{productId: string, quantity: number}>} items
   * @returns {{ success: boolean, errors?: Array, details?: Array }}
   */
  const bulkDeductStock = useCallback((items) => {
    // Phase 1: Validate ALL items have sufficient stock
    const errors = [];
    const productMap = {};

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        errors.push({ productId: item.productId, error: `Ürün bulunamadı: ${item.productId}` });
        continue;
      }
      const productName = typeof product.name === 'object' ? (product.name.tr || product.name.en || item.productId) : product.name;

      // Aggregate quantities for same product in same order
      if (!productMap[item.productId]) {
        productMap[item.productId] = { product, totalQuantity: 0, productName };
      }
      productMap[item.productId].totalQuantity += item.quantity;
    }

    for (const [productId, entry] of Object.entries(productMap)) {
      if (entry.product.stock < entry.totalQuantity) {
        errors.push({
          productId,
          productName: entry.productName,
          error: `Yetersiz stok: "${entry.productName}" - Mevcut: ${entry.product.stock}, İstenen: ${entry.totalQuantity}`,
          available: entry.product.stock,
          requested: entry.totalQuantity,
        });
      }
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Phase 2: Apply all deductions atomically (single state update + single localStorage write)
    const details = [];
    const newProducts = products.map(p => {
      if (productMap[p.id]) {
        const qty = productMap[p.id].totalQuantity;
        const newStock = p.stock - qty;
        details.push({
          productId: p.id,
          productName: productMap[p.id].productName,
          oldStock: p.stock,
          newStock,
          deducted: qty,
        });
        return { ...p, stock: newStock };
      }
      return p;
    });

    // Atomic write
    saveProducts(newProducts);
    return { success: true, details };
  }, [products, saveProducts]);

  /**
   * Atomically restore stock for multiple products.
   * @param {Array<{productId: string, quantity: number}>} items
   * @returns {{ success: boolean, details?: Array }}
   */
  const bulkRestoreStock = useCallback((items) => {
    const details = [];
    const productMap = {};

    for (const item of items) {
      if (!productMap[item.productId]) {
        productMap[item.productId] = 0;
      }
      productMap[item.productId] += item.quantity;
    }

    const newProducts = products.map(p => {
      if (productMap[p.id]) {
        const qty = productMap[p.id];
        const newStock = p.stock + qty;
        const productName = typeof p.name === 'object' ? (p.name.tr || p.name.en || p.id) : p.name;
        details.push({
          productId: p.id,
          productName,
          oldStock: p.stock,
          newStock,
          restored: qty,
        });
        return { ...p, stock: newStock };
      }
      return p;
    });

    saveProducts(newProducts);
    return { success: true, details };
  }, [products, saveProducts]);

  // --- Categories CRUD ---
  const addCategory = useCallback((category) => {
    const newCategory = { ...category, id: category.id || `cat_${Date.now()}` };
    const newCategories = [...categories, newCategory];
    saveCategories(newCategories);

    if (logDetailedAuditEvent) {
      logDetailedAuditEvent({
        actionType: 'category.created',
        module: 'categories',
        recordId: newCategory.id,
        description: `Yeni kategori oluşturuldu: ${category.label || category.name || newCategory.id}`,
        newValue: { id: newCategory.id, label: category.label },
      });
    }
  }, [categories, saveCategories, logDetailedAuditEvent]);

  const updateCategory = useCallback((id, updatedData) => {
    const oldCategory = categories.find(c => c.id === id);
    const newCategories = categories.map(c => c.id === id ? { ...c, ...updatedData } : c);
    saveCategories(newCategories);

    if (logDetailedAuditEvent && oldCategory) {
      logDetailedAuditEvent({
        actionType: 'category.updated',
        module: 'categories',
        recordId: id,
        description: `Kategori güncellendi: ${oldCategory.label || id}`,
        oldValue: { label: oldCategory.label },
        newValue: { label: updatedData.label },
      });
    }
  }, [categories, saveCategories, logDetailedAuditEvent]);

  const deleteCategory = useCallback((id) => {
    const deletedCategory = categories.find(c => c.id === id);
    const newCategories = categories.filter(c => c.id !== id);
    saveCategories(newCategories);

    if (logDetailedAuditEvent && deletedCategory) {
      logDetailedAuditEvent({
        actionType: 'category.deleted',
        module: 'categories',
        recordId: id,
        description: `Kategori silindi: ${deletedCategory.label || id}`,
        oldValue: { id, label: deletedCategory.label },
      });
    }
  }, [categories, saveCategories, logDetailedAuditEvent]);

  return (
    <ProductContext.Provider value={{
      products,
      categories,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      // Stock management
      deductStock,
      restoreStock,
      bulkDeductStock,
      bulkRestoreStock,
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
