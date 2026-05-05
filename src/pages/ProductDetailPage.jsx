import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ShoppingBag, Heart, Plus, Minus, Star, Truck, Shield, RotateCcw, ChevronRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useProducts } from '../context/ProductContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../context/LanguageContext';
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
  const { t } = useLanguage();

  const handleAdd = () => {
    addItem(product);
    addToast(`${product.name} ${t('pd_added').replace('✓ ', '')}`, 'success');
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
            src={product.images?.[0] || product.image}
            alt={t(product.name)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {product.badge && (
            <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase ${BADGE_STYLES[product.badge] || 'bg-espresso text-cream'}`}>
              {t(`prod_${product.badge.toLowerCase().replace(' ', '_')}`)}
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <p className="text-[10px] font-medium tracking-widest uppercase text-warm-gray mb-1">{t(`shop_${product.category}`)}</p>
        <Link to={`/shop/product/${product.id}`} className="block group/title">
          <h3 className="font-display text-lg font-semibold text-espresso mb-1 group-hover/title:text-walnut-light transition-colors truncate">
            {t(product.name)}
          </h3>
        </Link>
        <div className="flex items-center justify-between pt-2 border-t border-cream-dark/20 mt-2">
          <div className="flex flex-col">
            {product.discount > 0 && (
              <span className="text-[10px] text-warm-gray line-through leading-none mb-0.5">
                €{product.price.toFixed(2)}
              </span>
            )}
            <span className="font-display text-lg font-semibold text-espresso leading-none">
              €{(product.price - (product.discount || 0)).toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 text-xs font-medium text-gold-dark hover:text-espresso tracking-wider uppercase transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            {t('shop_add')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Product Detail Page ── */
export default function ProductDetailPage() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();
  const { t } = useLanguage();
  const { products } = useProducts();

  const product = products.find((p) => p.id === id);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id && p.status !== 'inactive')
      .slice(0, 4);
  }, [product, products]);

  if (!product) {
    return (
      <div className="min-h-screen bg-champagne">
        <ShopNavbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 pt-28">
          <div className="w-20 h-20 rounded-full bg-cream flex items-center justify-center mb-5">
            <ShoppingBag className="w-8 h-8 text-warm-gray" />
          </div>
          <h1 className="font-display text-2xl text-espresso mb-2">{t('pd_not_found')}</h1>
          <p className="text-warm-gray text-sm mb-6">{t('pd_not_found_desc')}</p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-espresso text-cream text-sm font-medium tracking-wider uppercase hover:bg-walnut-light transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('pd_back_shop')}
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
    addToast(`${t(product.name)} (×${quantity}) ${t('pd_added').replace('✓ ', '')}`, 'success');
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product.id);
    addToast(
      wishlisted ? `Removed from wishlist` : `${t(product.name)} added to wishlist`,
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
          <Link to="/" className="hover:text-espresso transition-colors">{t('nav_home')}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/shop" className="hover:text-espresso transition-colors">{t('nav_shop')}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-espresso font-medium truncate max-w-[200px]">{t(product.name)}</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 pb-16 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden bg-cream-light aspect-square shadow-[0_4px_30px_rgba(62,39,35,0.08)]">
            <img
              src={product.images?.[0] || product.image}
              alt={t(product.name)}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className={`absolute top-5 left-5 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase ${BADGE_STYLES[product.badge] || 'bg-espresso text-cream'}`}>
                {t(`prod_${product.badge.toLowerCase().replace(' ', '_')}`)}
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
              {t(`shop_${product.category}`)}
            </p>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-espresso leading-tight mb-4">
              {t(product.name)}
            </h1>

            {/* Stars */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold fill-current" />
                ))}
              </div>
              <span className="text-sm text-warm-gray">(4.9 · 128 {t('pd_reviews')})</span>
            </div>

            <div className="luxury-divider-wide mb-6" />

            <p className="text-walnut-light text-base leading-relaxed mb-8">
              {product.description}. Every order is prepared fresh with premium ingredients, ensuring
              an exceptional experience with every bite.
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              {product.discount > 0 && (
                <span className="font-display text-2xl font-bold text-warm-gray line-through">
                  €{product.price.toFixed(2)}
                </span>
              )}
              <span className="font-display text-4xl font-bold text-espresso">
                €{(product.price - (product.discount || 0)).toFixed(2)}
              </span>
              <span className="text-sm text-warm-gray">{t('pd_incl_tax')}</span>
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
                  <>{t('pd_added')}</>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    {t('pd_add_to_cart')} · €{((product.price - (product.discount || 0)) * quantity).toFixed(2)}
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
                <span className="text-[11px] font-medium text-walnut-light tracking-wide">{t('pd_free_delivery')}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gold-dark" />
                </div>
                <span className="text-[11px] font-medium text-walnut-light tracking-wide">{t('pd_quality')}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 text-warm-gray-dark" />
                </div>
                <span className="text-[11px] font-medium text-walnut-light tracking-wide">{t('pd_fresh')}</span>
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
                {t('pd_also_like')}
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-espresso">
                {t('pd_related')}
              </h2>
            </div>
            <Link
              to="/shop"
              className="hidden md:flex items-center gap-2 text-sm font-medium text-gold-dark hover:text-espresso tracking-wide transition-colors group"
            >
              {t('pd_view_all')}
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
          <div className="text-center md:text-right">
            <p className="text-xs tracking-wide">
              © {new Date().getFullYear()} GELATTE. {t('foot_rights')}
            </p>
            <p className="text-xs tracking-wide text-gold-light mt-1">
              {t('foot_created_by')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
