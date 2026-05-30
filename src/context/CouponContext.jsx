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

  // Admin methods
  const addCoupon = useCallback(async (coupon) => {
    try {
      const response = await api.admin.createCoupon(coupon);
      if (response.success) {
        await fetchCoupons();
        return response.data;
      }
    } catch (err) {
      console.error('Add coupon error:', err);
      throw err;
    }
  }, [fetchCoupons]);

  const updateCoupon = useCallback(async (id, updates) => {
    try {
      const response = await api.admin.updateCoupon(id, updates);
      if (response.success) {
        await fetchCoupons();
        return response.data;
      }
    } catch (err) {
      console.error('Update coupon error:', err);
      throw err;
    }
  }, [fetchCoupons]);

  const deleteCoupon = useCallback(async (id) => {
    try {
      const response = await api.admin.deleteCoupon(id);
      if (response.success) {
        await fetchCoupons();
        return true;
      }
    } catch (err) {
      console.error('Delete coupon error:', err);
      throw err;
    }
  }, [fetchCoupons]);

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
