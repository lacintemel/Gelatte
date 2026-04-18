import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, CreditCard, Truck, Check, ChevronRight,
  MapPin, Mail, Phone, User, Lock, Calendar, Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const STEPS = [
  { id: 1, label: 'Review', icon: ShoppingBag },
  { id: 2, label: 'Shipping', icon: Truck },
  { id: 3, label: 'Payment', icon: CreditCard },
  { id: 4, label: 'Confirm', icon: Check },
];

/* ── Step Indicator ── */
function StepIndicator({ currentStep }) {
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
                {step.label}
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
  return (
    <div className="animate-fade-in-up">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-espresso mb-6">Review Your Order</h2>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-cream mx-auto flex items-center justify-center mb-5">
            <ShoppingBag className="w-8 h-8 text-warm-gray" />
          </div>
          <p className="font-display text-lg text-espresso mb-2">Your cart is empty</p>
          <p className="text-warm-gray text-sm mb-6">Add some items before checking out</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-espresso text-cream text-sm font-medium tracking-wider uppercase hover:bg-walnut-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          {/* Items */}
          <div className="space-y-3 mb-8">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-ivory border border-cream-dark/20">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-cream-light">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-sm font-semibold text-espresso truncate">{item.name}</h4>
                  <p className="text-warm-gray text-xs mt-0.5">Qty: {item.quantity}</p>
                </div>
                <span className="font-display text-sm font-semibold text-espresso shrink-0">
                  €{(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Promo Code */}
          <div className="flex gap-3 mb-8">
            <input
              type="text"
              placeholder="Promo code"
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
              {promoApplied ? '✓ Applied' : 'Apply'}
            </button>
          </div>

          {/* Summary */}
          <div className="space-y-3 p-6 rounded-xl bg-ivory border border-cream-dark/20 mb-8">
            <div className="flex justify-between text-sm text-warm-gray-dark">
              <span>Subtotal</span>
              <span>€{totalPrice.toFixed(2)}</span>
            </div>
            {promoApplied && (
              <div className="flex justify-between text-sm text-mint-dark font-medium">
                <span>Promo Discount (10%)</span>
                <span>-€{(totalPrice * 0.1).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-warm-gray-dark">
              <span>Delivery</span>
              <span className="text-mint-dark font-medium">Free</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-cream-dark/20">
              <span className="font-display text-lg font-semibold text-espresso">Total</span>
              <span className="font-display text-lg font-semibold text-espresso">
                €{(promoApplied ? totalPrice * 0.9 : totalPrice).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={onNext}
            className="w-full py-4 rounded-xl bg-espresso text-cream font-medium text-sm tracking-wider uppercase hover:bg-walnut-light transition-colors flex items-center justify-center gap-2"
          >
            Continue to Shipping
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
}

/* ── Step 2: Shipping ── */
function ShippingStep({ form, setForm, errors, onNext, onBack }) {
  const fields = [
    { key: 'firstName', label: 'First Name', placeholder: 'John', icon: User, half: true },
    { key: 'lastName', label: 'Last Name', placeholder: 'Doe', icon: User, half: true },
    { key: 'email', label: 'Email Address', placeholder: 'john@example.com', icon: Mail, type: 'email' },
    { key: 'phone', label: 'Phone Number', placeholder: '+1 234 567 890', icon: Phone, type: 'tel' },
    { key: 'address', label: 'Street Address', placeholder: '123 Main Street', icon: MapPin },
    { key: 'city', label: 'City', placeholder: 'Milan', icon: MapPin, half: true },
    { key: 'zip', label: 'Zip Code', placeholder: '20121', icon: MapPin, half: true },
  ];

  return (
    <div className="animate-fade-in-up">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-espresso mb-2">Shipping Details</h2>
      <p className="text-warm-gray text-sm mb-8">Where should we deliver your order?</p>

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
          <p className="text-sm font-semibold text-espresso">Express Delivery</p>
          <p className="text-xs text-warm-gray">Estimated 30-45 minutes · Free for orders over €20</p>
        </div>
        <span className="text-sm font-semibold text-mint-dark">Free</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-xl border border-cream-dark/30 text-walnut text-sm font-medium tracking-wider uppercase hover:bg-cream transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-4 rounded-xl bg-espresso text-cream font-medium text-sm tracking-wider uppercase hover:bg-walnut-light transition-colors flex items-center justify-center gap-2"
        >
          Continue to Payment
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* ── Step 3: Payment ── */
function PaymentStep({ payment, setPayment, payErrors, onNext, onBack }) {
  return (
    <div className="animate-fade-in-up">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-espresso mb-2">Payment Details</h2>
      <p className="text-warm-gray text-sm mb-8">Your payment information is secure and encrypted.</p>

      <div className="p-6 rounded-xl bg-ivory border border-cream-dark/20 mb-8">
        {/* Card Number */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">Card Number</label>
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-light" />
            <input
              type="text"
              placeholder="1234  5678  9012  3456"
              value={payment.cardNumber}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                const formatted = v.replace(/(.{4})/g, '$1  ').trim();
                setPayment({ ...payment, cardNumber: formatted });
              }}
              className={`form-input pl-11 tracking-widest ${payErrors.cardNumber ? 'error' : ''}`}
            />
          </div>
          {payErrors.cardNumber && <p className="text-red-500 text-xs mt-1.5 ml-1">{payErrors.cardNumber}</p>}
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">Cardholder Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-light" />
            <input
              type="text"
              placeholder="John Doe"
              value={payment.cardName}
              onChange={(e) => setPayment({ ...payment, cardName: e.target.value })}
              className={`form-input pl-11 ${payErrors.cardName ? 'error' : ''}`}
            />
          </div>
          {payErrors.cardName && <p className="text-red-500 text-xs mt-1.5 ml-1">{payErrors.cardName}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Expiry */}
          <div>
            <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">Expiry Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-light" />
              <input
                type="text"
                placeholder="MM / YY"
                value={payment.expiry}
                onChange={(e) => {
                  let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                  if (v.length > 2) v = v.slice(0, 2) + ' / ' + v.slice(2);
                  setPayment({ ...payment, expiry: v });
                }}
                className={`form-input pl-11 tracking-widest ${payErrors.expiry ? 'error' : ''}`}
              />
            </div>
            {payErrors.expiry && <p className="text-red-500 text-xs mt-1.5 ml-1">{payErrors.expiry}</p>}
          </div>
          {/* CVV */}
          <div>
            <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-2">CVV</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-light" />
              <input
                type="text"
                placeholder="•••"
                value={payment.cvv}
                maxLength={4}
                onChange={(e) => setPayment({ ...payment, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                className={`form-input pl-11 tracking-widest ${payErrors.cvv ? 'error' : ''}`}
              />
            </div>
            {payErrors.cvv && <p className="text-red-500 text-xs mt-1.5 ml-1">{payErrors.cvv}</p>}
          </div>
        </div>
      </div>

      {/* Security Note */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-cream-light border border-cream-dark/15 mb-8">
        <Lock className="w-4 h-4 text-warm-gray shrink-0" />
        <p className="text-xs text-warm-gray-dark">
          Your payment is secured with 256-bit SSL encryption. We never store your full card details.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-4 rounded-xl border border-cream-dark/30 text-walnut text-sm font-medium tracking-wider uppercase hover:bg-cream transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-4 rounded-xl bg-espresso text-cream font-medium text-sm tracking-wider uppercase hover:bg-walnut-light transition-colors flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Place Order
        </button>
      </div>
    </div>
  );
}

/* ── Step 4: Confirmation ── */
function ConfirmationStep({ orderNumber }) {
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
        Order Confirmed
      </span>
      <h2 className="font-display text-3xl md:text-4xl font-bold text-espresso mb-4">
        Thank You!
      </h2>
      <p className="text-warm-gray-dark text-base max-w-md mx-auto mb-3 leading-relaxed">
        Your order has been placed successfully. We're preparing your items with care.
      </p>

      <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-cream-light border border-cream-dark/20 mb-10">
        <Package className="w-5 h-5 text-gold-dark" />
        <div className="text-left">
          <p className="text-xs text-warm-gray">Order Number</p>
          <p className="font-display text-base font-bold text-espresso tracking-wider">{orderNumber}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
        <Link
          to="/shop"
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-espresso text-cream font-medium text-sm tracking-wider uppercase hover:bg-walnut-light transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Continue Shopping
        </Link>
        <Link
          to="/"
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border border-cream-dark/30 text-walnut text-sm font-medium tracking-wider uppercase hover:bg-cream transition-colors"
        >
          Back to Home
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

  const [step, setStep] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  // Shipping form
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', zip: '',
  });
  const [errors, setErrors] = useState({});

  // Payment form
  const [payment, setPayment] = useState({
    cardNumber: '', cardName: '', expiry: '', cvv: '',
  });
  const [payErrors, setPayErrors] = useState({});

  const applyPromo = () => {
    if (promoCode.trim() === 'GELATTE10' || promoCode.trim() === 'WELCOME') {
      setPromoApplied(true);
      addToast('Promo code applied! 10% discount', 'success');
    } else {
      addToast('Invalid promo code', 'warning');
    }
  };

  const validateShipping = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.phone.trim()) errs.phone = 'Required';
    if (!form.address.trim()) errs.address = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    if (!form.zip.trim()) errs.zip = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePayment = () => {
    const errs = {};
    const rawCard = payment.cardNumber.replace(/\s/g, '');
    if (!rawCard) errs.cardNumber = 'Required';
    else if (rawCard.length < 16) errs.cardNumber = 'Enter a valid 16-digit card number';
    if (!payment.cardName.trim()) errs.cardName = 'Required';
    const rawExpiry = payment.expiry.replace(/\s|\//g, '');
    if (!rawExpiry) errs.expiry = 'Required';
    else if (rawExpiry.length < 4) errs.expiry = 'Invalid';
    if (!payment.cvv) errs.cvv = 'Required';
    else if (payment.cvv.length < 3) errs.cvv = 'Invalid';
    setPayErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (from) => {
    if (from === 1) {
      if (items.length === 0) return;
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (from === 2) {
      if (validateShipping()) {
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else if (from === 3) {
      if (validatePayment()) {
        const num = 'GL-' + Date.now().toString(36).toUpperCase().slice(-6) + Math.random().toString(36).toUpperCase().slice(2, 5);
        setOrderNumber(num);
        clearCart();
        setStep(4);
        addToast('Order placed successfully!', 'success');
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
            <span className="text-sm font-medium tracking-wide">Back to Shop</span>
          </Link>
          <Link to="/" className="font-display text-2xl font-bold text-espresso tracking-[0.08em]">
            GELATTE
          </Link>
          <div className="flex items-center gap-2 text-sm text-warm-gray">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline tracking-wide">Secure Checkout</span>
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
            payment={payment}
            setPayment={setPayment}
            payErrors={payErrors}
            onNext={() => handleNext(3)}
            onBack={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        )}

        {step === 4 && <ConfirmationStep orderNumber={orderNumber} />}
      </div>
    </div>
  );
}
