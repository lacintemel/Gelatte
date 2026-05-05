import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Trash2, Truck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export default function CartDrawer() {
  const {
    items,
    totalItems,
    totalPrice,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { addToast } = useToast();
  const [orderNote, setOrderNote] = useState('');
  const { t } = useLanguage();

  const handleRemoveItem = (item) => {
    removeItem(item.id);
    addToast(`${t(item.name)} removed from cart`, 'info');
  };

  const handleClearCart = () => {
    clearCart();
    addToast('Cart cleared', 'info');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 z-[60] bg-espresso/50 backdrop-blur-sm transition-opacity duration-400
          ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* Drawer */}
      <div
        className={`
          fixed right-0 top-0 h-full w-full sm:w-[420px] z-[70] bg-ivory shadow-2xl
          transform transition-transform duration-500 ease-out flex flex-col
          ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-cream-dark/30">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-espresso" />
            <h2 className="font-display text-xl font-semibold text-espresso">
              {t('cart_title')}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-espresso text-cream text-xs font-semibold">
              {totalItems}
            </span>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="w-9 h-9 rounded-full hover:bg-cream flex items-center justify-center transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-walnut" />
          </button>
        </div>

        {/* Delivery Banner */}
        {totalItems > 0 && (
          <div className="mx-6 mt-4 px-4 py-3 rounded-xl bg-mint/8 border border-mint/15 flex items-center gap-3">
            <Truck className="w-4 h-4 text-mint-dark shrink-0" />
            <p className="text-xs text-walnut-light">
              {totalPrice >= 20
                ? <span className="font-semibold text-mint-dark">{t('cart_free_delivery')}</span>
                : <>€{(20 - totalPrice).toFixed(2)} {t('cart_more_for_free')}</>
              }
            </p>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mb-5">
                <ShoppingBag className="w-8 h-8 text-warm-gray" />
              </div>
              <p className="font-display text-lg text-espresso mb-2">{t('cart_empty')}</p>
              <p className="text-warm-gray text-sm mb-6">
                {t('cart_empty_desc')}
              </p>
              <Link
                to="/shop"
                onClick={() => setIsDrawerOpen(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-espresso text-cream text-sm font-medium tracking-wider uppercase hover:bg-walnut-light transition-colors"
              >
                {t('cart_browse')}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl bg-cream-light/60 hover:bg-cream-light transition-colors group"
                >
                  {/* Image */}
                  <Link
                    to={`/shop/product/${item.id}`}
                    onClick={() => setIsDrawerOpen(false)}
                    className="w-20 h-20 rounded-lg overflow-hidden shrink-0 img-hover-zoom"
                  >
                    <img
                      src={item.images?.[0] || item.image}
                      alt={t(item.name)}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to={`/shop/product/${item.id}`}
                        onClick={() => setIsDrawerOpen(false)}
                      >
                        <h4 className="font-display text-sm font-semibold text-espresso leading-tight truncate hover:text-walnut-light transition-colors">
                          {t(item.name)}
                        </h4>
                      </Link>
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="shrink-0 w-7 h-7 rounded-full hover:bg-cream flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        aria-label={`Remove ${t(item.name)}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-warm-gray hover:text-red-500" />
                      </button>
                    </div>

                    <p className="text-warm-gray text-xs mt-0.5">
                      €{(item.price - (item.discount || 0)).toFixed(2)} {t('cart_each')}
                      {item.discount > 0 && <span className="ml-1 line-through text-[10px]">€{item.price.toFixed(2)}</span>}
                    </p>

                    <div className="flex items-center justify-between mt-2.5">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-0.5 bg-ivory rounded-full border border-cream-dark/30">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-cream transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3 text-walnut" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-espresso">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-cream transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3 text-walnut" />
                        </button>
                      </div>

                      {/* Line total */}
                      <span className="font-display text-sm font-semibold text-espresso">
                        €{((item.price - (item.discount || 0)) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Order Notes */}
              <div className="pt-4 border-t border-cream-dark/15">
                <label className="flex items-center gap-2 text-xs font-medium text-walnut tracking-wide uppercase mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  {t('cart_notes')}
                </label>
                <textarea
                  placeholder={t('cart_notes_placeholder')}
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  rows={2}
                  className="
                    w-full px-4 py-3 rounded-xl bg-ivory border border-cream-dark/25
                    text-espresso text-sm placeholder:text-warm-gray-light resize-none
                    focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/10
                    transition-all duration-300
                  "
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-cream-dark/30 px-6 py-5 space-y-4">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-warm-gray-dark">
                <span>{t('cart_subtotal')} ({totalItems} {t('shop_products')})</span>
                <span>€{totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-warm-gray-dark">
                <span>{t('cart_delivery')}</span>
                <span className="text-mint-dark font-medium">
                  {totalPrice >= 20 ? t('cart_free') : '€2.50'}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-cream-dark/20">
                <span className="font-display text-lg font-semibold text-espresso">{t('cart_total')}</span>
                <span className="font-display text-lg font-semibold text-espresso">
                  €{(totalPrice >= 20 ? totalPrice : totalPrice + 2.50).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <Link
              to="/checkout"
              onClick={() => setIsDrawerOpen(false)}
              className="
                w-full py-4 rounded-xl bg-espresso text-cream font-medium text-sm
                tracking-wider uppercase hover:bg-walnut-light transition-colors duration-300
                flex items-center justify-center gap-2
              "
            >
              <ShoppingBag className="w-4 h-4" />
              {t('cart_checkout')}
            </Link>

            <button
              onClick={handleClearCart}
              className="
                w-full py-2.5 text-sm text-warm-gray hover:text-espresso
                transition-colors duration-300 tracking-wide
              "
            >
              {t('cart_clear')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
