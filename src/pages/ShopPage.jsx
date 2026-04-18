import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Plus, Search, SlidersHorizontal, ArrowLeft, Heart, Eye,
  Grid3X3, List, ChevronLeft, ChevronRight, Send,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { SHOP_CATEGORIES, SHOP_PRODUCTS } from '../data/shopProducts';
import { useScrollReveal } from '../hooks/useScrollReveal';
import ShopNavbar from '../components/ShopNavbar';
import CartDrawer from '../components/CartDrawer';
import QuickViewModal from '../components/QuickViewModal';

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

  const wishlisted = isWishlisted(product.id);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    addToast(`${product.name} added to cart`, 'success');
    setTimeout(() => setAdded(false), 1200);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    addToast(
      wishlisted ? `Removed from wishlist` : `${product.name} added to wishlist`,
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
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          {/* Badge */}
          {product.badge && (
            <span className={`
              absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase
              ${BADGE_STYLES[product.badge] || 'bg-espresso text-cream'}
            `}>
              {product.badge}
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
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <>✓ Added</>
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 md:p-5">
        <p className="text-[11px] font-medium tracking-widest uppercase text-warm-gray mb-1.5">
          {product.category}
        </p>
        <Link to={`/shop/product/${product.id}`}>
          <h3 className="font-display text-base md:text-lg font-semibold text-espresso mb-1.5 leading-tight group-hover:text-walnut-light transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-warm-gray-dark text-xs leading-relaxed mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-cream-dark/20">
          <span className="font-display text-lg font-semibold text-espresso">
            €{product.price.toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            className="
              flex items-center gap-1.5 text-xs font-medium text-gold-dark hover:text-espresso
              tracking-wider uppercase transition-colors duration-300
            "
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Add
          </button>
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

  const wishlisted = isWishlisted(product.id);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    addToast(`${product.name} added to cart`, 'success');
    setTimeout(() => setAdded(false), 1200);
  };

  const handleWishlist = () => {
    toggleWishlist(product.id);
    addToast(
      wishlisted ? `Removed from wishlist` : `${product.name} added to wishlist`,
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
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {product.badge && (
            <span className={`
              absolute top-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wider uppercase
              ${BADGE_STYLES[product.badge] || 'bg-espresso text-cream'}
            `}>
              {product.badge}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-medium tracking-widest uppercase text-warm-gray mb-1">
            {product.category}
          </p>
          <Link to={`/shop/product/${product.id}`}>
            <h3 className="font-display text-base md:text-lg font-semibold text-espresso mb-1 group-hover:text-walnut-light transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-warm-gray-dark text-xs leading-relaxed line-clamp-2 mb-3">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-display text-xl font-semibold text-espresso">
            €{product.price.toFixed(2)}
          </span>
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
              {added ? '✓ Added' : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Add
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
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { totalItems, totalPrice, setIsDrawerOpen } = useCart();

  const filteredProducts = useMemo(() => {
    let products = SHOP_PRODUCTS;

    // Filter by category
    if (activeCategory !== 'all') {
      products = products.filter((p) => p.category === activeCategory);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'price-asc') products = [...products].sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') products = [...products].sort((a, b) => b.price - a.price);
    if (sortBy === 'name') products = [...products].sort((a, b) => a.name.localeCompare(b.name));

    return products;
  }, [activeCategory, searchQuery, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
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
            Back to Home
          </Link>

          <div className="max-w-2xl">
            <span className="font-accent text-base tracking-[0.2em] uppercase text-gold mb-3 block">
              Our Collection
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-espresso leading-tight mb-4">
              Shop GELATTE
            </h1>
            <p className="text-warm-gray-dark text-base md:text-lg leading-relaxed">
              Browse our full collection of artisan gelato, specialty coffees, fresh pastries,
              and luxury desserts — all available for delivery or pickup.
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
              placeholder="Search products..."
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
              <option value="default">Sort: Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
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

          {/* Results count */}
          <span className="text-sm text-warm-gray hidden md:block ml-auto">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide -mx-1 px-1">
          {SHOP_CATEGORIES.map((cat) => (
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
              {cat.label}
            </button>
          ))}
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
            <p className="font-display text-xl text-espresso mb-2">No products found</p>
            <p className="text-warm-gray text-sm">
              Try a different search or category filter
            </p>
            <button
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); setCurrentPage(1); }}
              className="mt-4 text-sm text-gold-dark hover:text-espresso transition-colors underline underline-offset-4"
            >
              Clear all filters
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
                Stay Updated
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-ivory mb-3">
                Get 10% Off Your First Order
              </h2>
              <p className="text-cream/60 text-sm leading-relaxed mb-8">
                Subscribe to our newsletter for exclusive offers, new arrivals, and your welcome discount.
              </p>

              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="
                    flex-1 px-5 py-4 rounded-xl bg-walnut-light/50 border border-cream/10
                    text-ivory text-sm placeholder:text-cream/40
                    focus:outline-none focus:border-gold/40 focus:ring-2 focus:ring-gold/10
                    transition-all
                  "
                />
                <button className="px-6 py-4 rounded-xl bg-gold text-espresso font-medium text-sm tracking-wider uppercase hover:bg-gold-light transition-colors flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Subscribe</span>
                </button>
              </div>

              <p className="text-cream/30 text-xs mt-4">
                Use code <span className="font-semibold text-gold/60">GELATTE10</span> at checkout
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
            {totalItems} item{totalItems !== 1 ? 's' : ''} · €{totalPrice.toFixed(2)}
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
              <h4 className="font-display text-sm font-semibold text-ivory uppercase tracking-wider mb-4">Shop</h4>
              <ul className="space-y-2.5">
                {SHOP_CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => { handleCategoryChange(cat.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="text-sm text-cream/50 hover:text-gold transition-colors"
                    >
                      {cat.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="font-display text-sm font-semibold text-ivory uppercase tracking-wider mb-4">Help</h4>
              <ul className="space-y-2.5">
                {['Delivery Info', 'Returns Policy', 'FAQs', 'Contact Us'].map((item) => (
                  <li key={item}>
                    <span className="text-sm text-cream/50 hover:text-gold transition-colors cursor-pointer">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-sm font-semibold text-ivory uppercase tracking-wider mb-4">Contact</h4>
              <div className="space-y-2.5 text-sm text-cream/50">
                <p>42 Via della Dolcezza</p>
                <p>Milan 20121, Italy</p>
                <p className="text-gold/70">hello@gelatte.com</p>
                <p>+39 02 1234 5678</p>
              </div>
            </div>
          </div>

          <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs tracking-wide text-cream/30">
              © {new Date().getFullYear()} GELATTE. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <span key={item} className="text-xs text-cream/30 hover:text-cream/60 transition-colors cursor-pointer">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
