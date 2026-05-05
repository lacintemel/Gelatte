import React, { createContext, useContext, useState, useEffect } from 'react';
import { SHOP_PRODUCTS as INITIAL_PRODUCTS, SHOP_CATEGORIES as INITIAL_CATEGORIES } from '../data/shopProducts';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const storedProducts = localStorage.getItem('gelatte_products');
    const storedCategories = localStorage.getItem('gelatte_categories');

    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      // Map initial products to include new fields like stock, discount, status
      const initialized = INITIAL_PRODUCTS.map(p => ({
        ...p,
        stock: 10,
        discount: 0,
        status: 'active',
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

  // --- Products CRUD ---
  const addProduct = (product) => {
    const newProducts = [{ ...product, id: `prod_${Date.now()}` }, ...products];
    saveProducts(newProducts);
  };

  const updateProduct = (id, updatedData) => {
    const newProducts = products.map(p => p.id === id ? { ...p, ...updatedData } : p);
    saveProducts(newProducts);
  };

  const deleteProduct = (id) => {
    const newProducts = products.filter(p => p.id !== id);
    saveProducts(newProducts);
  };

  // --- Categories CRUD ---
  const addCategory = (category) => {
    const newCategories = [...categories, { ...category, id: category.id || `cat_${Date.now()}` }];
    saveCategories(newCategories);
  };

  const updateCategory = (id, updatedData) => {
    const newCategories = categories.map(c => c.id === id ? { ...c, ...updatedData } : c);
    saveCategories(newCategories);
  };

  const deleteCategory = (id) => {
    const newCategories = categories.filter(c => c.id !== id);
    saveCategories(newCategories);
  };

  return (
    <ProductContext.Provider value={{
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
