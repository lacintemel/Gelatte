import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const CouponContext = createContext(null);
const STORAGE_KEY = 'gelatte_coupons';

function loadCoupons() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getDefaultCoupons();
  } catch {
    return getDefaultCoupons();
  }
}

function getDefaultCoupons() {
  return [
    {
      id: 'cp_1',
      code: 'GELATTE10',
      type: 'percent',
      discount: 10,
      minOrder: 0,
      validFrom: '2025-01-01',
      validTo: '2027-12-31',
      maxUses: 999,
      currentUses: 0,
      active: true,
    },
    {
      id: 'cp_2',
      code: 'WELCOME',
      type: 'percent',
      discount: 10,
      minOrder: 15,
      validFrom: '2025-01-01',
      validTo: '2027-12-31',
      maxUses: 500,
      currentUses: 0,
      active: true,
    },
  ];
}

export function CouponProvider({ children }) {
  const [coupons, setCoupons] = useState(loadCoupons);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
  }, [coupons]);

  const addCoupon = useCallback((coupon) => {
    const newCoupon = {
      ...coupon,
      id: `cp_${Date.now()}`,
      currentUses: 0,
    };
    setCoupons((prev) => [...prev, newCoupon]);
  }, []);

  const updateCoupon = useCallback((id, updates) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteCoupon = useCallback((id) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const validateCoupon = useCallback(
    (code, orderTotal) => {
      const coupon = coupons.find(
        (c) => c.code.toUpperCase() === code.toUpperCase()
      );

      if (!coupon) return { valid: false, error: 'cp_invalid' };
      if (!coupon.active) return { valid: false, error: 'cp_invalid' };

      const now = new Date();
      const validFrom = new Date(coupon.validFrom);
      const validTo = new Date(coupon.validTo);
      if (now < validFrom || now > validTo)
        return { valid: false, error: 'cp_expired' };

      if (coupon.currentUses >= coupon.maxUses)
        return { valid: false, error: 'cp_expired' };

      if (orderTotal < coupon.minOrder)
        return { valid: false, error: 'cp_min_not_met' };

      return { valid: true, coupon };
    },
    [coupons]
  );

  const applyCoupon = useCallback(
    (code) => {
      setCoupons((prev) =>
        prev.map((c) =>
          c.code.toUpperCase() === code.toUpperCase()
            ? { ...c, currentUses: c.currentUses + 1 }
            : c
        )
      );
    },
    []
  );

  const calculateDiscount = useCallback((coupon, orderTotal) => {
    if (coupon.type === 'percent') {
      return (orderTotal * coupon.discount) / 100;
    }
    return Math.min(coupon.discount, orderTotal);
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
