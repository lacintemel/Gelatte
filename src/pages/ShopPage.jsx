import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Plus, Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { SHOP_CATEGORIES, SHOP_PRODUCTS } from '../data/shopProducts';
import { useScrollReveal } from '../hooks/useScrollReveal';
import ShopNavbar from '../components/ShopNavbar';
import CartDrawer from '../components/CartDrawer';

/* ── Badge Styles ── */
const BADGE_STYLES = {
  'Signature': 'bg-espresso text-cream',
  'Best Seller': 'bg-gold text-espresso',
  'Fresh Daily': 'bg-mint text-espresso',
};

/* ── Product Card ── */
function ProductCard({ product, index }) {
  const { addItem } = useCart();
  const [ref, isVisible] = useScrollReveal(0.05);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
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

      {/* Content */}
      <div className="p-4 md:p-5">
        <p className="text-[11px] font-medium tracking-widest uppercase text-warm-gray mb-1.5">
          {product.category}
        </p>
        <h3 className="font-display text-base md:text-lg font-semibold text-espresso mb-1.5 leading-tight group-hover:text-walnut-light transition-colors">
          {product.name}
        </h3>
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

/* ── Shop Page ── */
export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const { totalItems, setIsDrawerOpen } = useCart();

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

  return (
    <div className="min-h-screen bg-champagne">
      <ShopNavbar />
      <CartDrawer />

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
              onChange={(e) => setSearchQuery(e.target.value)}
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
              onChange={(e) => setSortBy(e.target.value)}
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
              onClick={() => setActiveCategory(cat.id)}
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

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
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
              onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
              className="mt-4 text-sm text-gold-dark hover:text-espresso transition-colors underline underline-offset-4"
            >
              Clear all filters
            </button>
          </div>
        )}
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
            {totalItems} item{totalItems !== 1 ? 's' : ''} · €{useCart().totalPrice.toFixed(2)}
          </span>
        </button>
      )}

      {/* Footer */}
      <footer className="bg-espresso text-cream/60 py-10 mt-10">
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
