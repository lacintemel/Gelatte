import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const toNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

function parseLocalizedJson(value) {
  if (value && typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeCartProduct(product, quantity = 1, cartItemId = null) {
  const imageUrls = Array.isArray(product.images)
    ? product.images
        .map((image) => (typeof image === 'string' ? image : image?.url))
        .filter(Boolean)
    : [];

  return {
    ...product,
    name: parseLocalizedJson(product.name),
    description: parseLocalizedJson(product.description),
    price: toNumber(product.price),
    discount: toNumber(product.discount),
    stock: toNumber(product.stock),
    cartItemId,
    id: product.id,
    quantity: toNumber(quantity, 1),
    image: imageUrls[0] || product.image || '',
    images: imageUrls,
    category: product.categoryId || product.category,
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { currentUser } = useAuth(); // Re-fetch cart when user logs in/out

  const fetchCart = useCallback(async () => {
    try {
      const response = await api.getCart();
      if (response.success && response.data?.items) {
        // Map backend CartItem structure to frontend format
        const mappedItems = response.data.items.map(cartItem => {
          const product = cartItem.product || {};
          return normalizeCartProduct(product, cartItem.quantity, cartItem.id);
        });
        setItems(mappedItems);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, currentUser]);

  const addItem = useCallback(async (product) => {
    // Optimistic update for UI responsiveness
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, normalizeCartProduct(product)];
    });
    setIsDrawerOpen(true);

    try {
      await api.addToCart(product.id, 1);
      fetchCart(); // Ensure synced with backend cartItemId
    } catch (err) {
      console.error('Failed to add item to backend cart:', err);
      fetchCart(); // Revert on failure
    }
  }, [fetchCart]);

  const removeItem = useCallback(async (productId) => {
    const item = items.find(i => i.id === productId);
    if (!item) return;

    // Optimistic
    setItems((prev) => prev.filter((i) => i.id !== productId));

    try {
      if (item.cartItemId) {
        await api.removeCartItem(item.cartItemId);
      }
    } catch (err) {
      console.error('Failed to remove item from backend cart:', err);
      fetchCart(); // Revert
    }
  }, [items, fetchCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    const item = items.find(i => i.id === productId);
    if (!item) return;

    if (quantity <= 0) {
      return removeItem(productId);
    }

    // Optimistic
    setItems((prev) => prev.map((i) => (i.id === productId ? { ...i, quantity } : i)));

    try {
      if (item.cartItemId) {
        await api.updateCartItem(item.cartItemId, quantity);
      }
    } catch (err) {
      console.error('Failed to update backend cart item quantity:', err);
      fetchCart(); // Revert
    }
  }, [items, removeItem, fetchCart]);

  const clearCart = useCallback(async () => {
    setItems([]); // Optimistic
    try {
      await api.clearCart();
    } catch (err) {
      console.error('Failed to clear backend cart:', err);
      fetchCart(); // Revert
    }
  }, [fetchCart]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.price - (item.discount || 0)) * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
