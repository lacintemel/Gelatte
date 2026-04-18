import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, Heart, Plus, Minus, Star, Truck, Shield, RotateCcw, ChevronRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { SHOP_PRODUCTS } from '../data/shopProducts';
import { useScrollReveal } from '../hooks/useScrollReveal';
import ShopNavbar from '../components/ShopNavbar';
import CartDrawer from '../components/CartDrawer';

const BADGE_STYLES = {
  'Signature': 'bg-espresso text-cream',
  'Best Seller': 'bg-gold text-espresso',
  'Fresh Daily': 'bg-mint text-espresso',
};

/* ── Related Product Card ── */
function RelatedCard({ product }) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [ref, isVisible] = useScrollReveal(0.1);

  const handleAdd = () => {
    addItem(product);
    addToast(`${product.name} added to cart`, 'success');
  };

  return (
    <div
      ref={ref}
      className={`group bg-ivory rounded-2xl overflow-hidden shadow-[0_2px_16px_rgba(62,39,35,0.05)]
        hover:shadow-[0_8px_32px_rgba(62,39,35,0.1)] transition-all duration-500 hover:-translate-y-1
        border border-cream-dark/15 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
    >
      <Link to={`/shop/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-cream-light">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {product.badge && (
            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${BADGE_STYLES[product.badge] || 'bg-espresso text-cream'}`}>
              {product.badge}
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-[10px] font-medium tracking-widest uppercase text-warm-gray mb-1">{product.category}</p>
        <Link to={`/shop/product/${product.id}`}>
          <h3 className="font-display text-base font-semibold text-espresso mb-1 leading-tight group-hover:text-walnut-light transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-2 border-t border-cream-dark/20 mt-2">
          <span className="font-display text-lg font-semibold text-espresso">€{product.price.toFixed(2)}</span>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-xs font-medium text-gold-dark hover:text-espresso tracking-wider uppercase transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Product Detail Page ── */
export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();

  const product = SHOP_PRODUCTS.find((p) => p.id === id);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return SHOP_PRODUCTS
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-champagne">
        <ShopNavbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 pt-28">
          <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mb-5">
            <ShoppingBag className="w-8 h-8 text-warm-gray" />
          </div>
          <h1 className="font-display text-2xl text-espresso mb-2">Product Not Found</h1>
          <p className="text-warm-gray text-sm mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-espresso text-cream text-sm font-medium tracking-wider uppercase hover:bg-walnut-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    setAdded(true);
    addToast(`${product.name} (×${quantity}) added to cart`, 'success');
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    addToast(
      wishlisted ? `Removed from wishlist` : `${product.name} added to wishlist`,
      wishlisted ? 'info' : 'success'
    );
  };

  return (
    <div className="min-h-screen bg-champagne">
      <ShopNavbar />
      <CartDrawer />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-24 md:pt-28 pb-4">
        <nav className="flex items-center gap-2 text-sm text-warm-gray">
          <Link to="/" className="hover:text-espresso transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/shop" className="hover:text-espresso transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-espresso font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden bg-cream-light aspect-square shadow-[0_4px_30px_rgba(62,39,35,0.08)]">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className={`absolute top-5 left-5 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase ${BADGE_STYLES[product.badge] || 'bg-espresso text-cream'}`}>
                {product.badge}
              </span>
            )}
            {/* Wishlist */}
            <button
              onClick={handleToggleWishlist}
              className={`
                absolute top-5 right-5 w-12 h-12 rounded-full flex items-center justify-center
                shadow-lg transition-all duration-300
                ${wishlisted
                  ? 'bg-red-50 text-red-500'
                  : 'bg-ivory/90 backdrop-blur-sm text-warm-gray hover:text-red-400'}
              `}
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <p className="text-xs font-medium tracking-widest uppercase text-warm-gray mb-3">
              {product.category}
            </p>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-espresso leading-tight mb-4">
              {product.name}
            </h1>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold fill-current" />
                ))}
              </div>
              <span className="text-sm text-warm-gray">(4.9 · 128 reviews)</span>
            </div>

            <div className="luxury-divider-wide mb-6" />

            <p className="text-walnut-light text-base leading-relaxed mb-8">
              {product.description}. Every order is prepared fresh with premium ingredients, ensuring
              an exceptional experience with every bite.
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="font-display text-4xl font-bold text-espresso">
                €{product.price.toFixed(2)}
              </span>
              <span className="text-sm text-warm-gray">incl. tax</span>
            </div>

            {/* Quantity + Add */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 bg-cream-light rounded-xl border border-cream-dark/30 px-2 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-cream transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4 text-walnut" />
                </button>
                <span className="w-12 text-center text-lg font-semibold text-espresso">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-cream transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4 text-walnut" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={added}
                className={`
                  flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-medium text-sm
                  tracking-wider uppercase transition-all duration-400
                  ${added
                    ? 'bg-mint text-espresso'
                    : 'bg-espresso text-cream hover:bg-walnut-light hover:shadow-lg'}
                `}
              >
                {added ? (
                  <>✓ Added to Cart</>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    Add to Cart · €{(product.price * quantity).toFixed(2)}
                  </>
                )}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-cream-dark/20">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-mint/10 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-mint-dark" />
                </div>
                <span className="text-[11px] font-medium text-walnut-light tracking-wide">Free Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gold-dark" />
                </div>
                <span className="text-[11px] font-medium text-walnut-light tracking-wide">Quality Assured</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-warm-gray-dark" />
                </div>
                <span className="text-[11px] font-medium text-walnut-light tracking-wide">Fresh Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 md:px-8 pb-16 md:pb-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="font-accent text-sm tracking-[0.15em] uppercase text-gold block mb-1">
                You may also like
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-espresso">
                Related Products
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-gold-dark hover:text-espresso tracking-wide transition-colors group"
            >
              View All
              <ArrowLeft className="w-4 h-4 rotate-180 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <RelatedCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-espresso text-cream/60 py-10">
        <div className="max-w-7xl mx-auto px-5 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="font-display text-xl font-bold text-ivory tracking-[0.08em]">
            GELATTE
          </Link>
          <p className="text-xs tracking-wide">
            © {new Date().getFullYear()} GELATTE. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
