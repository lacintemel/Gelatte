import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SHOP_PRODUCTS as INITIAL_PRODUCTS, SHOP_CATEGORIES as INITIAL_CATEGORIES } from '../data/shopProducts';
import { useAuth } from './AuthContext';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { logDetailedAuditEvent, currentUser } = useAuth();

  useEffect(() => {
    const storedProducts = localStorage.getItem('gelatte_products');
    const storedCategories = localStorage.getItem('gelatte_categories');

    if (storedProducts) {
      // Migrate existing products to add new flags if missing
      const parsed = JSON.parse(storedProducts);
      const migrated = parsed.map(p => ({
        ...p,
        showInMenu: p.showInMenu !== undefined ? p.showInMenu : true,
        availableForOnlineOrder: p.availableForOnlineOrder !== undefined ? p.availableForOnlineOrder : true,
      }));
      setProducts(migrated);
    } else {
      // Map initial products to include new fields like stock, discount, status, availability
      const initialized = INITIAL_PRODUCTS.map(p => ({
        ...p,
        stock: 10,
        discount: 0,
        status: 'active',
        showInMenu: true,
        availableForOnlineOrder: true,
        images: [p.image] // Support multiple images
      }));
      setProducts(initialized);
      localStorage.setItem('gelatte_products', JSON.stringify(initialized));
    }

    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      setCategories(INITIAL_CATEGORIES);
      localStorage.setItem('gelatte_categories', JSON.stringify(INITIAL_CATEGORIES));
    }
  }, []);

  const saveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem('gelatte_products', JSON.stringify(newProducts));
  };

  const saveCategories = (newCategories) => {
    setCategories(newCategories);
    localStorage.setItem('gelatte_categories', JSON.stringify(newCategories));
  };

  // --- Products CRUD with audit logging ---
  const addProduct = useCallback((product) => {
    const newProduct = { ...product, id: `prod_${Date.now()}` };
    const newProducts = [newProduct, ...products];
    saveProducts(newProducts);

    if (logDetailedAuditEvent) {
      logDetailedAuditEvent({
        actionType: 'product.created',
        module: 'products',
        recordId: newProduct.id,
        description: `Yeni ürün oluşturuldu: ${typeof product.name === 'object' ? (product.name.tr || product.name.en || '') : product.name}`,
        newValue: { id: newProduct.id, name: product.name, price: product.price, stock: product.stock },
      });
    }

    return newProduct;
  }, [products, logDetailedAuditEvent]);

  const updateProduct = useCallback((id, updatedData) => {
    const oldProduct = products.find(p => p.id === id);
    const newProducts = products.map(p => p.id === id ? { ...p, ...updatedData } : p);
    saveProducts(newProducts);

    // Log detailed changes for tracked fields
    if (logDetailedAuditEvent && oldProduct) {
      const trackedFields = ['price', 'discount', 'stock', 'status', 'name'];
      const changes = {};
      const oldValues = {};

      for (const field of trackedFields) {
        if (updatedData[field] !== undefined && JSON.stringify(updatedData[field]) !== JSON.stringify(oldProduct[field])) {
          changes[field] = updatedData[field];
          oldValues[field] = oldProduct[field];
        }
      }

      if (Object.keys(changes).length > 0) {
        // Log specific action types for price and stock changes
        if (changes.price !== undefined || changes.discount !== undefined) {
          logDetailedAuditEvent({
            actionType: 'product.price_changed',
            module: 'products',
            recordId: id,
            description: `Ürün fiyatı güncellendi: ${typeof oldProduct.name === 'object' ? (oldProduct.name.tr || oldProduct.name.en || id) : oldProduct.name}`,
            oldValue: { price: oldProduct.price, discount: oldProduct.discount },
            newValue: { price: updatedData.price ?? oldProduct.price, discount: updatedData.discount ?? oldProduct.discount },
          });
        }

        if (changes.stock !== undefined) {
          logDetailedAuditEvent({
            actionType: 'product.stock_changed',
            module: 'products',
            recordId: id,
            description: `Ürün stok güncellendi: ${typeof oldProduct.name === 'object' ? (oldProduct.name.tr || oldProduct.name.en || id) : oldProduct.name}`,
            oldValue: { stock: oldProduct.stock },
            newValue: { stock: updatedData.stock },
          });
        }

        // General product update log
        logDetailedAuditEvent({
          actionType: 'product.updated',
          module: 'products',
          recordId: id,
          description: `Ürün güncellendi: ${Object.keys(changes).join(', ')}`,
          oldValue: oldValues,
          newValue: changes,
        });
      }
    }
  }, [products, logDetailedAuditEvent]);

  const deleteProduct = useCallback((id) => {
    const deletedProduct = products.find(p => p.id === id);
    const newProducts = products.filter(p => p.id !== id);
    saveProducts(newProducts);

    if (logDetailedAuditEvent && deletedProduct) {
      logDetailedAuditEvent({
        actionType: 'product.deleted',
        module: 'products',
        recordId: id,
        description: `Ürün silindi: ${typeof deletedProduct.name === 'object' ? (deletedProduct.name.tr || deletedProduct.name.en || id) : deletedProduct.name}`,
        oldValue: { id, name: deletedProduct.name, price: deletedProduct.price },
      });
    }
  }, [products, logDetailedAuditEvent]);

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
  }, [products]);

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
  }, [products]);

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
  }, [products]);

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
  }, [products]);

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
  }, [categories, logDetailedAuditEvent]);

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
  }, [categories, logDetailedAuditEvent]);

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
  }, [categories, logDetailedAuditEvent]);

  return (
    <ProductContext.Provider value={{
      products,
      categories,
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
