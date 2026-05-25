import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, Truck, Check, ChevronRight,
  MapPin, Mail, Phone, User, Lock, Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useOrders } from '../context/OrderContext';
import { useCoupons } from '../context/CouponContext';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { id: 1, labelKey: 'ch_step_review', icon: ShoppingBag },
  { id: 2, labelKey: 'ch_step_shipping', icon: Truck },
  { id: 3, labelKey: 'ch_step_payment', icon: CreditCard },
  { id: 4, labelKey: 'ch_step_confirm', icon: Check },
];

/* ── Step Indicator ── */
function StepIndicator({ currentStep }) {
  const { t } = useLanguage();
  
  return (
    <div className="flex items-center justify-center gap-0 max-w-lg mx-auto mb-10 md:mb-14">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[11px] font-medium tracking-wider uppercase hidden sm:block
                ${isActive ? 'text-espresso' : isCompleted ? 'text-mint-dark' : 'text-warm-gray-light'}`}>
                {t(step.labelKey)}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-connector mx-2 mt-[-20px] sm:mt-[-24px] ${isCompleted ? 'active' : ''}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Step 1: Order Review ── */
function ReviewStep({ items, totalPrice, promoCode, setPromoCode, promoApplied, applyPromo, onNext }) {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in-up">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-espresso mb-6">{t('ch_review_title')}</h2>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-cream mx-auto flex items-center justify-center mb-5">
            <ShoppingBag className="w-8 h-8 text-warm-gray" />
          </div>
          <p className="font-display text-lg text-espresso mb-2">{t('ch_cart_empty')}</p>
          <p className="text-warm-gray text-sm mb-6">{t('ch_cart_empty_desc')}</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-espresso text-cream text-sm font-medium tracking-wider uppercase hover:bg-walnut-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('ch_continue_shopping')}
          </Link>
        </div>
      ) : (
        <>
          {/* Items */}
          <div className="space-y-3 mb-8">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-ivory border border-cream-dark/20">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-cream-light">
                  <img src={item.images?.[0] || item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-sm font-semibold text-espresso truncate">{t(item.name)}</h4>
                  <p className="text-warm-gray text-xs mt-0.5">{t('pd_qty')}: {item.quantity}</p>
                </div>
                <span className="font-display text-sm font-semibold text-espresso shrink-0">
                  ₺{((item.price - (item.discount || 0)) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Promo Code */}
          <div className="flex gap-3 mb-8">
            <input
              type="text"
              placeholder={t('ch_promo_placeholder')}
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="form-input flex-1"
              disabled={promoApplied}
            />
            <button
              onClick={applyPromo}
              disabled={promoApplied || !promoCode.trim()}
              className={`px-6 py-3 rounded-xl text-sm font-medium tracking-wider uppercase transition-all
                ${promoApplied
                  ? 'bg-mint/20 text-mint-dark border border-mint/30'
                  : 'bg-espresso text-cream hover:bg-walnut-light disabled:opacity-40 disabled:cursor-not-allowed'}`}
            >
              {promoApplied ? t('ch_applied') : t('ch_apply')}
            </button>
          </div>

          {/* Summary */}
          <div className="space-y-3 p-6 rounded-xl bg-ivory border border-cream-dark/20 mb-8">
            <div className="flex justify-between text-sm text-warm-gray-dark">
              <span>{t('ch_subtotal')}</span>
              <span>₺{totalPrice.toFixed(2)}</span>
            </div>
            {promoApplied && (
              <div className="flex justify-between text-sm text-mint-dark font-medium">
                <span>{t('ch_promo_discount')}</span>
                <span>-₺{(totalPrice * 0.1).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-warm-gray-dark">
              <span>{t('ch_delivery')}</span>
              <span className="text-mint-dark font-medium">{t('ch_free')}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-cream-dark/20">
              <span className="font-display text-lg font-semibold text-espresso">{t('ch_total')}</span>
              <span className="font-display text-lg font-semibold text-espresso">
                ₺{(promoApplied ? totalPrice * 0.9 : totalPrice).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full py-4 rounded-xl bg-espresso text-cream font-medium text-sm tracking-wider uppercase hover:bg-walnut-light transition-colors flex items-center justify-center gap-2"
          >
            {t('ch_continue_shipping')}
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}

/* ── Step 2: Shipping ── */
function ShippingStep({ form, setForm, errors, onNext, onBack }) {
  const { t } = useLanguage();

  const fields = [
    { key: 'firstName', label: t('ch_first_name'), placeholder: 'John', icon: User, half: true },
    { key: 'lastName', label: t('ch_last_name'), placeholder: 'Doe', icon: User, half: true },
    { key: 'email', label: t('ch_email_label'), placeholder: 'john@example.com', icon: Mail, type: 'email' },
    { key: 'phone', label: t('ch_phone_label'), placeholder: '234 567 890', icon: Phone, type: 'tel' },
    { key: 'address', label: t('ch_address_label'), placeholder: '123 Main Street', icon: MapPin },
    { key: 'city', label: t('ch_city'), placeholder: 'Milan', icon: MapPin, half: true },
    { key: 'zip', label: t('ch_zip'), placeholder: '20121', icon: MapPin, half: true },
  ];

  return (
    <div className="animate-fade-in-up">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-espresso mb-2">{t('ch_shipping_title')}</h2>
      <p className="text-warm-gray text-sm mb-8">{t('ch_shipping_desc')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {fields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key} className={field.half ? '' : 'sm:col-span-2'}>
              <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">
                {field.label}
              </label>
              <div className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-light" />
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  value={form[field.key] || ''}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className={`form-input pl-11 ${errors[field.key] ? 'error' : ''}`}
                />
              </div>
              {errors[field.key] && (
                <p className="text-red-500 text-xs mt-1.5 ml-1">{errors[field.key]}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Delivery Option */}
      <div className="p-5 rounded-xl bg-mint/5 border border-mint/20 flex items-center gap-4 mb-8">
        <div className="w-10 h-10 rounded-full bg-mint/15 flex items-center justify-center shrink-0">
          <Truck className="w-5 h-5 text-mint-dark" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-espresso">{t('ch_express')}</p>
          <p className="text-xs text-warm-gray">{t('ch_express_desc')}</p>
        </div>
        <span className="text-sm font-semibold text-mint-dark">{t('ch_free')}</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-xl border border-cream-dark/30 text-walnut text-sm font-medium tracking-wider uppercase hover:bg-cream transition-colors"
        >
          {t('ch_back')}
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-4 rounded-xl bg-espresso text-cream font-medium text-sm tracking-wider uppercase hover:bg-walnut-light transition-colors flex items-center justify-center gap-2"
        >
          {t('ch_continue_payment')}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Step 3: Payment (PayTR Hosted iframe) ── */
function PaymentStep({ iframeToken, paymentLoading, paymentError, onBack, onRetry }) {
  const { t } = useLanguage();

  return (
    <div className="animate-fade-in-up">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-espresso mb-2">{t('ch_payment_title')}</h2>
      <p className="text-warm-gray text-sm mb-8">
        {t('ch_payment_secure_desc') || 'Complete your payment securely. Your card details are handled by our payment provider and never stored on our servers.'}
      </p>

      {/* PayTR iframe container */}
      {paymentLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-10 h-10 border-3 border-cream-dark/30 border-t-espresso rounded-full animate-spin" />
          <p className="text-warm-gray text-sm">{t('ch_loading_payment') || 'Loading secure payment form...'}</p>
        </div>
      )}

      {paymentError && (
        <div className="p-6 rounded-xl bg-red-50 border border-red-200 mb-8 text-center">
          <p className="text-red-700 text-sm mb-4">{paymentError}</p>
          <button
            onClick={onRetry}
            className="px-6 py-3 rounded-xl bg-espresso text-cream text-sm font-medium tracking-wider uppercase hover:bg-walnut-light transition-colors"
          >
            {t('pay_try_again') || 'Try Again'}
          </button>
        </div>
      )}

      {iframeToken && !paymentLoading && (
        <div className="rounded-xl overflow-hidden border border-cream-dark/20 mb-8">
          <iframe
            src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
            id="paytriframe"
            frameBorder="0"
            scrolling="yes"
            style={{ width: '100%', minHeight: '460px' }}
            title="Secure Payment"
          />
        </div>
      )}

      {/* Security Note */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-cream-light border border-cream-dark/15 mb-8">
        <Lock className="w-4 h-4 text-warm-gray shrink-0" />
        <p className="text-xs text-warm-gray-dark">
          {t('ch_security_note') || 'Your payment is processed securely via PayTR. We never see or store your card details.'}
        </p>
      </div>

      <button
        onClick={onBack}
        className="px-6 py-4 rounded-xl border border-cream-dark/30 text-walnut text-sm font-medium tracking-wider uppercase hover:bg-cream transition-colors"
      >
        {t('ch_back')}
      </button>
    </div>
  );
}

/* ── Step 4: Confirmation ── */
function ConfirmationStep({ orderNumber }) {
  const { t } = useLanguage();

  return (
    <div className="animate-scale-in text-center py-8 md:py-16">
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
        {t('ch_confirmed')}
      </span>
      <h2 className="font-display text-3xl md:text-4xl font-bold text-espresso mb-4">
        {t('ch_thank_you')}
      </h2>
      <p className="text-warm-gray-dark text-base max-w-md mx-auto mb-3 leading-relaxed">
        {t('ch_confirmed_desc')}
      </p>

      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-cream-light border border-cream-dark/20 mb-10">
        <Package className="w-5 h-5 text-gold-dark" />
        <div className="text-left">
          <p className="text-xs text-warm-gray">{t('ch_order_number')}</p>
          <p className="font-display text-base font-bold text-espresso tracking-wider">{orderNumber}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
        <Link
          to="/shop"
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-espresso text-cream font-medium text-sm tracking-wider uppercase hover:bg-walnut-light transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          {t('ch_continue_shopping')}
        </Link>
        <Link
          to="/"
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border border-cream-dark/30 text-walnut text-sm font-medium tracking-wider uppercase hover:bg-cream transition-colors"
        >
          {t('ch_back_home')}
        </Link>
      </div>
    </div>
  );
}

/* ── Checkout Page ── */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const { addOrder } = useOrders();
  const { validateCoupon, applyCoupon, calculateDiscount } = useCoupons();
  const { currentUser, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [orderNumber, setOrderNumber] = useState('');

  // Shipping form — pre-fill from logged-in user
  const [form, setForm] = useState({
    firstName: currentUser?.name?.split(' ')[0] || '',
    lastName: currentUser?.name?.split(' ').slice(1).join(' ') || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    zip: currentUser?.zip || '',
  });
  const [errors, setErrors] = useState({});

  // PayTR payment iframe state (replaces raw card form)
  const [iframeToken, setIframeToken] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const applyPromo = () => {
    const result = validateCoupon(promoCode.trim(), totalPrice);
    if (result.valid) {
      setPromoApplied(true);
      setAppliedCoupon(result.coupon);
      const disc = calculateDiscount(result.coupon, totalPrice);
      addToast(`Promo code applied! ₺${disc.toFixed(2)} discount`, 'success');
    } else {
      addToast(t(result.error), 'warning');
    }
  };

  const validateShipping = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = t('ch_required');
    if (!form.lastName.trim()) errs.lastName = t('ch_required');
    if (!form.email.trim()) errs.email = t('ch_required');
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = t('ch_invalid_email');
    if (!form.phone.trim()) errs.phone = t('ch_required');
    if (!form.address.trim()) errs.address = t('ch_required');
    if (!form.city.trim()) errs.city = t('ch_required');
    if (!form.zip.trim()) errs.zip = t('ch_required');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Initialize PayTR payment via backend API
  const initializePayment = async () => {
    setPaymentLoading(true);
    setPaymentError(null);
    setIframeToken(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            productId: i.id,
            quantity: i.quantity,
          })),
          shipping: form,
          couponCode: appliedCoupon?.code || null,
          idempotencyKey: `checkout_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        }),
      });

      const data = await response.json();

      if (data.success && data.data?.iframeToken) {
        setIframeToken(data.data.iframeToken);
        setOrderNumber(data.data.orderNumber);

        // Also create order in local context for backwards compatibility
        addOrder({
          items: items.map(i => ({ id: i.id, name: i.name, price: i.price, discount: i.discount || 0, quantity: i.quantity, image: i.images?.[0] || i.image })),
          customer: form,
          subtotal: totalPrice,
          discountAmount: data.data.discountAmount || 0,
          couponCode: appliedCoupon?.code || null,
          total: data.data.total || totalPrice,
        });

        if (appliedCoupon) applyCoupon(appliedCoupon.code);
      } else {
        setPaymentError(data.message || 'Failed to initialize payment. Please try again.');
      }
    } catch (err) {
      // If the backend is not yet running, fall back to a demo confirmation
      console.warn('Checkout API unavailable, using demo mode:', err.message);
      const discountAmount = appliedCoupon ? calculateDiscount(appliedCoupon, totalPrice) : 0;
      const finalTotal = totalPrice - discountAmount;

      const order = addOrder({
        items: items.map(i => ({ id: i.id, name: i.name, price: i.price, discount: i.discount || 0, quantity: i.quantity, image: i.images?.[0] || i.image })),
        customer: form,
        subtotal: totalPrice,
        discountAmount,
        couponCode: appliedCoupon?.code || null,
        total: finalTotal,
      });

      if (appliedCoupon) applyCoupon(appliedCoupon.code);
      setOrderNumber(order.id);
      clearCart();
      setStep(4);
      addToast('Order placed successfully! (Demo mode)', 'success');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleNext = (from) => {
    if (from === 1) {
      if (items.length === 0) return;
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (from === 2) {
      if (validateShipping()) {
        setStep(3);
        initializePayment();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-champagne">
      {/* Simple Checkout Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-ivory/95 backdrop-blur-md border-b border-cream-dark/20 py-4">
        <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between">
          <Link to="/shop" className="flex items-center gap-2 text-warm-gray hover:text-espresso transition-colors group">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-medium tracking-wide">{t('ch_back_shop')}</span>
          </Link>
          <Link to="/" className="font-display text-2xl font-bold text-espresso tracking-[0.08em]">
            GELATTE
          </Link>
          <div className="flex items-center gap-2 text-sm text-warm-gray">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline tracking-wide">{t('ch_secure')}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-5 md:px-8 pt-28 md:pt-32 pb-16 md:pb-24">
        {step < 4 && <StepIndicator currentStep={step} />}

        {step === 1 && (
          <ReviewStep
            items={items}
            totalPrice={totalPrice}
            promoCode={promoCode}
            setPromoCode={setPromoCode}
            promoApplied={promoApplied}
            applyPromo={applyPromo}
            onNext={() => handleNext(1)}
          />
        )}

        {step === 2 && (
          <ShippingStep
            form={form}
            setForm={setForm}
            errors={errors}
            onNext={() => handleNext(2)}
            onBack={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        )}

        {step === 3 && (
          <PaymentStep
            iframeToken={iframeToken}
            paymentLoading={paymentLoading}
            paymentError={paymentError}
            onBack={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onRetry={() => initializePayment()}
          />
        )}

        {step === 4 && <ConfirmationStep orderNumber={orderNumber} />}
      </div>
    </div>
  );
}
