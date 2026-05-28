import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

const CouponContext = createContext(null);

export function CouponProvider({ children }) {
  const [coupons, setCoupons] = useState([]);
  const { currentUser } = useAuth();
  
  // Only admins can fetch all coupons
  const fetchCoupons = useCallback(async () => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
      setCoupons([]);
      return;
    }
    
    try {
      // Assuming api.admin.getCoupons exists if we added admin routes for it
      // Since it might not exist yet, we wrap in try-catch.
      if (api.admin.getCoupons) {
        const response = await api.admin.getCoupons();
        if (response.success) {
          setCoupons(response.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const validateCoupon = useCallback(async (code, orderTotal) => {
    try {
      const response = await api.validateCoupon(code, orderTotal);
      if (response.success) {
        return { valid: true, coupon: response.data.coupon, discount: response.data.discount };
      }
      return { valid: false, error: response.error || 'cp_invalid' };
    } catch (err) {
      return { valid: false, error: err.data?.error || 'cp_invalid' };
    }
  }, []);

  const calculateDiscount = useCallback((coupon, orderTotal) => {
    if (!coupon) return 0;
    if (coupon.type === 'percent') {
      return (orderTotal * coupon.discount) / 100;
    }
    return Math.min(coupon.discount, orderTotal);
  }, []);

  // Admin methods - these would need backend implementation if they don't exist
  const addCoupon = useCallback(async (coupon) => {
    // Left for future backend implementation if needed
  }, []);

  const updateCoupon = useCallback(async (id, updates) => {
    // Left for future backend implementation if needed
  }, []);

  const deleteCoupon = useCallback(async (id) => {
    // Left for future backend implementation if needed
  }, []);

  const applyCoupon = useCallback((code) => {
    // The backend increments usage during checkout, no frontend state mutation needed
  }, []);

  return (
    <CouponContext.Provider
      value={{
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        validateCoupon,
        applyCoupon,
        calculateDiscount,
      }}
    >
      {children}
    </CouponContext.Provider>
  );
}

export function useCoupons() {
  const context = useContext(CouponContext);
  if (!context) throw new Error('useCoupons must be used within a CouponProvider');
  return context;
}
