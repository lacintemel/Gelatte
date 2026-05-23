import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, Package, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const { clearCart } = useCart();
  const orderNumber = searchParams.get('order') || '';

  // Clear the cart on successful payment
  useEffect(() => {
    clearCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-champagne flex items-center justify-center px-5">
      <div className="max-w-md w-full text-center animate-scale-in">
        {/* Animated checkmark */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle
              cx="50" cy="50" r="45" fill="none"
              stroke="#A8C5B8" strokeWidth="3"
              className="animate-circle-grow"
            />
            <path
              d="M30 52 L44 66 L70 38" fill="none"
              stroke="#2C1810" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              className="animate-check-draw"
            />
          </svg>
        </div>

        <span className="font-accent text-sm tracking-[0.2em] uppercase text-gold mb-3 block">
          {t('ch_confirmed') || 'Payment Confirmed'}
        </span>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-espresso mb-4">
          {t('ch_thank_you') || 'Thank You!'}
        </h1>
        <p className="text-warm-gray-dark text-base max-w-sm mx-auto mb-3 leading-relaxed">
          {t('ch_confirmed_desc') || 'Your order has been placed successfully. You will receive a confirmation email shortly.'}
        </p>

        {orderNumber && (
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-cream-light border border-cream-dark/20 mb-10">
            <Package className="w-5 h-5 text-gold-dark" />
            <div className="text-left">
              <p className="text-xs text-warm-gray">{t('ch_order_number') || 'Order Number'}</p>
              <p className="font-display text-base font-bold text-espresso tracking-wider">{orderNumber}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
          <Link
            to="/shop"
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-espresso text-cream font-medium text-sm tracking-wider uppercase hover:bg-walnut-light transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            {t('ch_continue_shopping') || 'Continue Shopping'}
          </Link>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border border-cream-dark/30 text-walnut text-sm font-medium tracking-wider uppercase hover:bg-cream transition-colors"
          >
            <Home className="w-4 h-4" />
            {t('ch_back_home') || 'Back Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}
