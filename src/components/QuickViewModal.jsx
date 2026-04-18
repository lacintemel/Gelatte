import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Heart, Eye, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

export default function QuickViewModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  if (!product) return null;

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    addToast(`${product.name} (×${quantity}) added to cart`, 'success');
    onClose();
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    addToast(
      wishlisted ? `Removed from wishlist` : `${product.name} added to wishlist`,
      wishlisted ? 'info' : 'success'
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-espresso/50 backdrop-blur-sm animate-modal-overlay"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto bg-ivory rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-ivory/90 backdrop-blur-sm flex items-center justify-center hover:bg-cream transition-colors shadow-md"
            aria-label="Close quick view"
          >
            <X className="w-5 h-5 text-espresso" />
          </button>

          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative w-full md:w-1/2 aspect-square bg-cream-light shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <span className={`
                  absolute top-4 left-4 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase
                  ${product.badge === 'Best Seller' ? 'bg-gold text-espresso' :
                    product.badge === 'Fresh Daily' ? 'bg-mint text-espresso' :
                    'bg-espresso text-cream'}
                `}>
                  {product.badge}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
              <p className="text-[11px] font-medium tracking-widest uppercase text-warm-gray mb-2">
                {product.category}
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-espresso mb-3 leading-tight">
                {product.name}
              </h2>
              <p className="text-warm-gray-dark text-sm leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="font-display text-3xl font-bold text-espresso">
                  €{product.price.toFixed(2)}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium text-walnut tracking-wide">Qty</span>
                <div className="flex items-center gap-1 bg-cream-light rounded-full border border-cream-dark/30 px-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-cream transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-walnut" />
                  </button>
                  <span className="w-10 text-center text-base font-semibold text-espresso">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-cream transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-walnut" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handleAddToCart}
                  className="
                    flex-1 flex items-center justify-center gap-2 py-4 rounded-xl
                    bg-espresso text-cream font-medium text-sm tracking-wider uppercase
                    hover:bg-walnut-light transition-all duration-300
                  "
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Cart
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className={`
                    w-14 h-14 rounded-xl flex items-center justify-center border transition-all duration-300
                    ${wishlisted
                      ? 'bg-red-50 border-red-200 text-red-500'
                      : 'bg-cream-light border-cream-dark/30 text-warm-gray hover:text-red-400 hover:border-red-200'}
                  `}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* View Full Details */}
              <Link
                to={`/shop/product/${product.id}`}
                onClick={onClose}
                className="
                  flex items-center justify-center gap-2 mt-4 py-3 text-sm font-medium
                  text-gold-dark hover:text-espresso tracking-wide transition-colors group
                "
              >
                View Full Details
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
