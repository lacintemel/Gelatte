import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Plus, Search, SlidersHorizontal, ArrowLeft, Heart, Eye,
  Grid3X3, List, ChevronLeft, ChevronRight, Send, X, Filter,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useProducts } from '../context/ProductContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../context/LanguageContext';
import ShopNavbar from '../components/ShopNavbar';
import CartDrawer from '../components/CartDrawer';
import QuickViewModal from '../components/QuickViewModal';
import { CONTACT } from '../constants';

const ITEMS_PER_PAGE = 8;

/* ── Badge Styles ── */
const BADGE_STYLES = {
  'Signature': 'bg-espresso text-cream',
  'Best Seller': 'bg-gold text-espresso',
  'Fresh Daily': 'bg-mint text-espresso',
};

/* ── Grid Product Card ── */
function ProductCardGrid({ product, index, onQuickView }) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();
  const [ref, isVisible] = useScrollReveal(0.05);
  const [added, setAdded] = useState(false);
  const { t } = useLanguage();

  const wishlisted = isWishlisted(product.id);

  const badgeKey = product.badge ? `prod_${product.badge.toLowerCase().replace(' ', '_')}` : null;

  const handleAdd = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (product.availableForOnlineOrder === false) return;
    addItem(product);
    setAdded(true);
    addToast(`${t(product.name)} ${t('pd_added').replace('✓ ', '')}`, 'success');
    setTimeout(() => setAdded(false), 1200);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    addToast(
      wishlisted ? `Removed from wishlist` : `${t(product.name)} added to wishlist`,
      wishlisted ? 'info' : 'success'
    );
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  };

  return (
    <div
      ref={ref}
      className={`
        group bg-ivory rounded-2xl overflow-hidden
        shadow-[0_2px_16px_rgba(62,39,35,0.05)]
        hover:shadow-[0_8px_32px_rgba(62,39,35,0.1)]
        transition-all duration-500 hover:-translate-y-1
        border border-cream-dark/15
        ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}
      `}
      style={{ animationDelay: `${(index % 8) * 0.06}s` }}
    >
      {/* Image */}
      <Link to={`/shop/product/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-cream-light">
          <img
            src={product.images?.[0] || product.image}
            alt={t(product.name)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badge */}
          {product.badge && (
            <span className={`
              absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase
              ${BADGE_STYLES[product.badge] || 'bg-espresso text-cream'}
            `}>
              {t(badgeKey)}
            </span>
          )}

          {/* Unavailable Badge */}
          {product.availableForOnlineOrder === false && (
            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-warm-gray text-ivory">
              {t('prod_dine_in_only')}
            </span>
          )}

          {/* Hover Actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-400">
            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className={`
                w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300
                ${wishlisted
                  ? 'bg-red-50 text-red-500'
                  : 'bg-ivory/90 backdrop-blur-sm text-warm-gray hover:text-red-400'}
              `}
              aria-label="Toggle wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Quick View */}
            <button
              onClick={handleQuickView}
              className="w-9 h-9 rounded-full bg-ivory/90 backdrop-blur-sm flex items-center justify-center shadow-md text-warm-gray hover:text-espresso transition-colors"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Add to cart overlay */}
          {product.availableForOnlineOrder !== false && (
            <button
              onClick={handleAdd}
              className={`
                absolute bottom-3 right-3 rounded-full flex items-center justify-center
                shadow-lg transition-all duration-400 font-medium text-xs tracking-wider uppercase
                ${added
                  ? 'bg-mint text-espresso w-auto px-4 py-3 gap-2'
                  : 'bg-ivory text-espresso w-11 h-11 opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-cream hover:scale-110'
                }
              `}
              aria-label={`Add ${t(product.name)} to cart`}
            >
              {added ? (
                <>{t('shop_added')}</>
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 md:p-5">
        <p className="text-[11px] font-medium tracking-widest uppercase text-warm-gray mb-1.5">
          {(() => { const k = `shop_${product.category}`; const v = t(k); return v === k ? (product.categoryLabel || product.category) : v; })()}
        </p>
        <Link to={`/shop/product/${product.id}`} className="block group/title">
          <h3 className="font-display text-lg font-semibold text-espresso mb-1 group-hover/title:text-walnut-light transition-colors truncate">
            {t(product.name)}
          </h3>
        </Link>
        <p className="text-warm-gray text-sm mb-4 line-clamp-2 leading-relaxed">
          {t(product.description)}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-cream-dark/20">
          <div className="flex flex-col">
            {product.discount > 0 && (
              <span className="text-[10px] text-warm-gray line-through leading-none mb-0.5">
                ₺{product.price.toFixed(2)}
              </span>
            )}
            <span className="font-display text-lg font-semibold text-espresso leading-none">
              ₺{(product.price - (product.discount || 0)).toFixed(2)}
            </span>
          </div>
          {product.availableForOnlineOrder !== false ? (
            <button
              onClick={handleAdd}
              className="
                flex items-center gap-1.5 text-xs font-medium text-gold-dark hover:text-espresso
                tracking-wider uppercase transition-colors duration-300
              "
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              {t('shop_add')}
            </button>
          ) : (
            <span className="text-[10px] font-medium text-warm-gray tracking-wider uppercase">
              {t('prod_dine_in_only')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── List Product Card ── */
function ProductCardList({ product, onQuickView }) {
  const { addItem } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { addToast } = useToast();
  const [ref, isVisible] = useScrollReveal(0.05);
  const [added, setAdded] = useState(false);
  const { t } = useLanguage();

  const wishlisted = isWishlisted(product.id);
  const badgeKey = product.badge ? `prod_${product.badge.toLowerCase().replace(' ', '_')}` : null;

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    addToast(`${t(product.name)} ${t('pd_added').replace('✓ ', '')}`, 'success');
    setTimeout(() => setAdded(false), 1200);
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
    addToast(
      wishlisted ? `Removed from wishlist` : `${t(product.name)} added to wishlist`,
      wishlisted ? 'info' : 'success'
    );
  };

  return (
    <div
      ref={ref}
      className={`
        group flex bg-ivory rounded-2xl overflow-hidden
        shadow-[0_2px_16px_rgba(62,39,35,0.05)]
        hover:shadow-[0_8px_32px_rgba(62,39,35,0.1)]
        transition-all duration-500 border border-cream-dark/15
        ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}
      `}
    >
      {/* Image */}
      <Link to={`/shop/product/${product.id}`} className="w-36 md:w-48 shrink-0">
        <div className="relative h-full overflow-hidden bg-cream-light">
          <img
            src={product.images?.[0] || product.image}
            alt={t(product.name)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {product.badge && (
            <span className={`
              absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase
              ${BADGE_STYLES[product.badge] || 'bg-espresso text-cream'}
            `}>
              {t(badgeKey)}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-medium tracking-widest uppercase text-warm-gray mb-1">
            {(() => { const k = `shop_${product.category}`; const v = t(k); return v === k ? (product.categoryLabel || product.category) : v; })()}
          </p>
          <Link to={`/shop/product/${product.id}`}>
            <h3 className="font-display text-base md:text-lg font-semibold text-espresso mb-1 group-hover:text-walnut-light transition-colors">
              {t(product.name)}
            </h3>
          </Link>
          <p className="text-warm-gray-dark text-xs leading-relaxed line-clamp-2 mb-3">
            {t(product.description)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {product.discount > 0 && (
              <span className="text-xs text-warm-gray line-through leading-none mb-0.5">
                ₺{product.price.toFixed(2)}
              </span>
            )}
            <span className="font-display text-xl font-semibold text-espresso leading-none">
              ₺{(product.price - (product.discount || 0)).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleWishlist}
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all
                ${wishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'border-cream-dark/30 text-warm-gray hover:text-red-400'}`}
              aria-label="Toggle wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => onQuickView(product)}
              className="w-9 h-9 rounded-full flex items-center justify-center border border-cream-dark/30 text-warm-gray hover:text-espresso hover:border-espresso/30 transition-all"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleAdd}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium tracking-wider uppercase transition-all duration-300
                ${added
                  ? 'bg-mint text-espresso'
                  : 'bg-espresso text-cream hover:bg-walnut-light'}
              `}
            >
              {added ? t('shop_added') : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  {t('shop_add')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Pagination ── */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-10 md:mt-14">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-full flex items-center justify-center border border-cream-dark/25 text-walnut hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, i) => (
        page === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-warm-gray">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium tracking-wide
              transition-all duration-300
              ${currentPage === page
                ? 'bg-espresso text-cream shadow-md'
                : 'text-walnut-light hover:bg-cream border border-cream-dark/25'}
            `}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-full flex items-center justify-center border border-cream-dark/25 text-walnut hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ── Shop Page ── */
export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Advanced filters
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [selectedBadge, setSelectedBadge] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);

  const { totalItems, totalPrice, setIsDrawerOpen } = useCart();
  const { t } = useLanguage();
  const { products, categories: SHOP_CATEGORIES } = useProducts();

  // Debounced search
  const searchTimerRef = useRef(null);
  useEffect(() => {
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(searchTimerRef.current);
  }, [searchQuery]);

  // Price bounds
  const priceBounds = useMemo(() => {
    if (!products.length) return [0, 50];
    const prices = products.map(p => p.price - (p.discount || 0));
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [products]);

  // Sync priceRange with priceBounds when products load
  useEffect(() => {
    setPriceRange(priceBounds);
  }, [priceBounds]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (priceRange[0] > priceBounds[0] || priceRange[1] < priceBounds[1]) count++;
    if (selectedBadge !== 'all') count++;
    if (inStockOnly) count++;
    return count;
  }, [priceRange, priceBounds, selectedBadge, inStockOnly]);

  const filteredProducts = useMemo(() => {
    let currentProducts = products.filter(p => p.status !== 'inactive');

    if (activeCategory !== 'all') {
      currentProducts = currentProducts.filter((p) => p.category === activeCategory);
    }

    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      currentProducts = currentProducts.filter(
        (p) =>
          (t(p.name) || '').toLowerCase().includes(q) ||
          (t(p.description) || '').toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Price range filter
    currentProducts = currentProducts.filter((p) => {
      const effectivePrice = p.price - (p.discount || 0);
      return effectivePrice >= priceRange[0] && effectivePrice <= priceRange[1];
    });

    // Badge filter
    if (selectedBadge !== 'all') {
      currentProducts = currentProducts.filter((p) => p.badge === selectedBadge);
    }

    // Stock filter
    if (inStockOnly) {
      currentProducts = currentProducts.filter((p) => (p.stock || 0) > 0);
    }

    if (sortBy === 'price-asc') currentProducts = [...currentProducts].sort((a, b) => (a.price - (a.discount||0)) - (b.price - (b.discount||0)));
    if (sortBy === 'price-desc') currentProducts = [...currentProducts].sort((a, b) => (b.price - (b.discount||0)) - (a.price - (a.discount||0)));
    if (sortBy === 'name') currentProducts = [...currentProducts].sort((a, b) => (t(a.name) || '').localeCompare(t(b.name) || ''));

    return currentProducts;
  }, [products, activeCategory, debouncedSearch, sortBy, priceRange, selectedBadge, inStockOnly]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-champagne">
      <ShopNavbar />
      <CartDrawer />

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      {/* Hero Banner */}
      <section className="relative pt-24 pb-16 md:pt-28 md:pb-20 bg-ivory overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-mint/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-5 md:px-8 relative">
          {/* Breadcrumb */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-warm-gray text-sm hover:text-espresso transition-colors mb-6 group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            {t('shop_back')}
          </Link>

          <div className="max-w-2xl">
            <span className="font-accent text-base tracking-[0.2em] uppercase text-gold mb-3 block">
              {t('shop_collection')}
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-espresso leading-tight mb-4">
              {t('shop_title')}
            </h1>
            <p className="text-warm-gray-dark text-base md:text-lg leading-relaxed">
              {t('shop_desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-14">
        {/* Search & Sort Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray" />
            <input
              type="text"
              placeholder={t('shop_search')}
              value={searchQuery}
              onChange={handleSearchChange}
              className="
                w-full pl-11 pr-4 py-3 rounded-xl bg-ivory border border-cream-dark/25
                text-espresso text-sm placeholder:text-warm-gray-light
                focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/10
                transition-all duration-300
              "
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium tracking-wide transition-all duration-300
              ${showFilters || activeFilterCount > 0
                ? 'bg-espresso text-cream border-espresso'
                : 'bg-ivory border-cream-dark/25 text-walnut-light hover:bg-cream'}
            `}
          >
            <Filter className="w-4 h-4" />
            {t('shop_filters')}
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-gold text-espresso text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort */}
          <div className="relative">
            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray pointer-events-none" />
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="
                pl-11 pr-8 py-3 rounded-xl bg-ivory border border-cream-dark/25
                text-espresso text-sm appearance-none cursor-pointer
                focus:outline-none focus:border-gold/50 focus:ring-2 focus:ring-gold/10
                transition-all duration-300
              "
            >
              <option value="default">{t('shop_sort_default')}</option>
              <option value="price-asc">{t('shop_sort_price_asc')}</option>
              <option value="price-desc">{t('shop_sort_price_desc')}</option>
              <option value="name">{t('shop_sort_name')}</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center gap-1 bg-ivory rounded-xl border border-cream-dark/25 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'grid' ? 'bg-espresso text-cream shadow-sm' : 'text-warm-gray hover:text-espresso'
              }`}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                viewMode === 'list' ? 'bg-espresso text-cream shadow-sm' : 'text-warm-gray hover:text-espresso'
              }`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        {/* Advanced Filter Panel */}
        {showFilters && (
          <div className="mb-8 p-5 md:p-6 rounded-2xl bg-ivory border border-cream-dark/20 shadow-sm animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-lg font-semibold text-espresso">{t('shop_filters')}</h3>
              <button
                onClick={() => {
                  setPriceRange([priceBounds[0], priceBounds[1]]);
                  setSelectedBadge('all');
                  setInStockOnly(false);
                }}
                className="text-xs font-medium text-gold-dark hover:text-espresso tracking-wider uppercase transition-colors"
              >
                {t('shop_filter_reset')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-3">
                  {t('shop_filter_price')}
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray text-xs">₺</span>
                    <input
                      type="number"
                      min={priceBounds[0]}
                      max={priceRange[1]}
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full pl-8 pr-2 py-2.5 rounded-lg bg-cream-light border border-cream-dark/25 text-espresso text-sm focus:outline-none focus:border-gold/50 transition-all"
                      placeholder={t('shop_filter_min')}
                    />
                  </div>
                  <span className="text-warm-gray text-sm">—</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray text-xs">₺</span>
                    <input
                      type="number"
                      min={priceRange[0]}
                      max={priceBounds[1]}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full pl-8 pr-2 py-2.5 rounded-lg bg-cream-light border border-cream-dark/25 text-espresso text-sm focus:outline-none focus:border-gold/50 transition-all"
                      placeholder={t('shop_filter_max')}
                    />
                  </div>
                </div>
                <div className="mt-2">
                  <input
                    type="range"
                    min={priceBounds[0]}
                    max={priceBounds[1]}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-gold h-1.5 rounded-full appearance-none bg-cream-dark cursor-pointer"
                  />
                </div>
              </div>

              {/* Badge Filter */}
              <div>
                <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-3">
                  {t('shop_filter_badge')}
                </label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'Signature', 'Best Seller', 'Fresh Daily'].map((badge) => (
                    <button
                      key={badge}
                      onClick={() => setSelectedBadge(badge)}
                      className={`
                        px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-300
                        ${selectedBadge === badge
                          ? 'bg-espresso text-cream shadow-sm'
                          : 'bg-cream-light text-walnut-light border border-cream-dark/20 hover:bg-cream'}
                      `}
                    >
                      {badge === 'all' ? t('shop_filter_all_badges') : t(`prod_${badge.toLowerCase().replace(' ', '_')}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock Toggle */}
              <div>
                <label className="block text-xs font-medium text-walnut tracking-wide uppercase mb-3">
                  {t('shop_filter_in_stock')}
                </label>
                <button
                  onClick={() => setInStockOnly(!inStockOnly)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300 w-full
                    ${inStockOnly
                      ? 'bg-mint/10 border-mint/30 text-mint-dark'
                      : 'bg-cream-light border-cream-dark/20 text-warm-gray'}
                  `}
                >
                  <div className={`
                    w-10 h-5 rounded-full relative transition-all duration-300
                    ${inStockOnly ? 'bg-mint' : 'bg-cream-dark'}
                  `}>
                    <div className={`
                      absolute top-0.5 w-4 h-4 rounded-full bg-ivory shadow-sm transition-all duration-300
                      ${inStockOnly ? 'left-[22px]' : 'left-0.5'}
                    `} />
                  </div>
                  <span className="text-sm font-medium">{t('shop_filter_in_stock')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Results count */}
          <span className="text-sm text-warm-gray hidden md:block ml-auto">
            {filteredProducts.length} {t('shop_products')}
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide -mx-1 px-1">
          {SHOP_CATEGORIES.map((cat) => {
            const transKey = `shop_${cat.slug || cat.id}`;
            const translated = t(transKey);
            const displayName = translated === transKey ? (cat.label || cat.name || cat.id) : translated;
            
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`
                  px-5 py-2.5 rounded-full text-sm font-medium tracking-wide whitespace-nowrap
                  transition-all duration-300 shrink-0
                  ${activeCategory === cat.id
                    ? 'bg-espresso text-cream shadow-md'
                    : 'bg-ivory text-walnut-light border border-cream-dark/25 hover:bg-cream hover:border-cream-dark/40'
                  }
                `}
              >
                {displayName}
              </button>
            );
          })}
        </div>

        {/* Product Grid / List */}
        {paginatedProducts.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {paginatedProducts.map((product, i) => (
                  <ProductCardGrid
                    key={product.id}
                    product={product}
                    index={i}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {paginatedProducts.map((product) => (
                  <ProductCardList
                    key={product.id}
                    product={product}
                    onQuickView={setQuickViewProduct}
                  />
                ))}
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-cream mx-auto flex items-center justify-center mb-5">
              <Search className="w-8 h-8 text-warm-gray" />
            </div>
            <p className="font-display text-xl text-espresso mb-2">{t('shop_no_products')}</p>
            <p className="text-warm-gray text-sm">
              {t('shop_try_different')}
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); setCurrentPage(1); }}
              className="mt-4 text-sm text-gold-dark hover:text-espresso transition-colors underline underline-offset-4"
            >
              {t('shop_clear_filters')}
            </button>
          </div>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="bg-ivory py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-espresso p-8 md:p-14">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-60 h-60 bg-gold/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-mint/8 rounded-full blur-3xl" />

            <div className="relative max-w-xl mx-auto text-center">
              <span className="font-accent text-sm tracking-[0.2em] uppercase text-gold mb-3 block">
                {t('shop_newsletter_eyebrow')}
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-ivory mb-3">
                {t('shop_newsletter_title')}
              </h2>
              <p className="text-cream/60 text-sm leading-relaxed mb-8">
                {t('shop_newsletter_desc')}
              </p>

              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder={t('shop_newsletter_placeholder')}
                  className="
                    flex-1 px-5 py-4 rounded-xl bg-walnut-light/50 border border-cream/10
                    text-ivory text-sm placeholder:text-cream/40
                    focus:outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/10
                    transition-all
                  "
                />
                <button className="px-6 py-4 rounded-xl bg-gold text-espresso font-medium text-sm tracking-wider uppercase hover:bg-gold-light transition-colors flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('shop_subscribe')}</span>
                </button>
              </div>

              <p className="text-cream/30 text-xs mt-4">
                {t('shop_newsletter_code').split('code')[0]}<span className="font-semibold text-gold/60">GELATTE10</span>{t('shop_newsletter_code').split('code')[1]}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Cart Button (Mobile) */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="
            lg:hidden fixed bottom-6 right-6 z-50
            flex items-center gap-3 px-6 py-4 rounded-full
            bg-espresso text-cream shadow-2xl shadow-espresso/30
            animate-scale-in hover:bg-walnut-light transition-colors
          "
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="font-medium text-sm">
            {totalItems} item{totalItems !== 1 ? 's' : ''} · ₺{totalPrice.toFixed(2)}
          </span>
        </button>
      )}

      {/* Footer */}
      <footer className="bg-espresso text-cream/60 py-12">
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link to="/" className="font-display text-2xl font-bold text-ivory tracking-[0.08em] block mb-3">
                GELATTE
              </Link>
              <p className="text-cream/40 text-sm leading-relaxed">
                Premium artisan gelato, specialty coffee, and luxury desserts.
              </p>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="font-display text-sm font-semibold text-ivory uppercase tracking-wider mb-4">{t('nav_shop')}</h4>
              <ul className="space-y-2.5">
                {SHOP_CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
                  const transKey = `shop_${cat.slug || cat.id}`;
                  const translated = t(transKey);
                  const displayName = translated === transKey ? (cat.label || cat.name || cat.id) : translated;
                  return (
                    <li key={cat.id}>
                      <button
                        onClick={() => { handleCategoryChange(cat.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="text-sm text-cream/50 hover:text-gold transition-colors"
                      >
                        {displayName}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="font-display text-sm font-semibold text-ivory uppercase tracking-wider mb-4">{t('shop_help')}</h4>
              <ul className="space-y-2.5">
                {[
                  { key: 'shop_delivery' },
                  { key: 'shop_returns' },
                  { key: 'shop_faqs' },
                  { key: 'shop_contact_us' }
                ].map((item) => (
                  <li key={item.key}>
                    <span className="text-sm text-cream/50 hover:text-gold transition-colors cursor-pointer">{t(item.key)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-sm font-semibold text-ivory uppercase tracking-wider mb-4">{t('nav_contact')}</h4>
              <div className="space-y-2.5 text-sm text-cream/50">
                <p>{CONTACT.address}</p>
                <p className="text-gold/70">{CONTACT.email}</p>
                <p>{CONTACT.phone}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs tracking-wide text-cream/30">
              © {new Date().getFullYear()} GELATTE. {t('foot_rights')}
            </p>
            <a href="https://www.lacintemel.com" target="_blank" rel="noopener noreferrer" className="text-xs tracking-wide text-gold-light hover:text-gold transition-colors">
              {t('foot_created_by')}
            </a>
            <div className="flex gap-6">
              {[
                { key: 'shop_privacy' },
                { key: 'shop_terms' },
                { key: 'shop_cookies' }
              ].map((item) => (
                <span key={item.key} className="text-xs text-cream/30 hover:text-cream/60 transition-colors cursor-pointer">
                  {t(item.key)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
