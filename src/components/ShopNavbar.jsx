import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, ArrowLeft } from 'lucide-react';
import { BRAND } from '../constants';
import { useCart } from '../context/CartContext';

const SHOP_NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
];

export default function ShopNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, setIsDrawerOpen } = useCart();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled
          ? 'glass shadow-[0_4px_30px_rgba(62,39,35,0.08)] py-3'
          : 'bg-ivory/95 backdrop-blur-md py-4 border-b border-cream-dark/20'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            <span className="font-display text-2xl md:text-3xl font-bold text-espresso tracking-[0.08em] group-hover:text-gold transition-colors duration-300">
              GELATTE
            </span>
          </Link>
          <span className="hidden md:block text-warm-gray-light text-xl font-thin">|</span>
          <span className="hidden md:block font-accent text-sm tracking-[0.15em] uppercase text-warm-gray">
            Shop
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {SHOP_NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`
                relative font-body text-sm tracking-[0.08em] uppercase transition-colors duration-300
                after:content-[''] after:absolute after:-bottom-1 after:left-0 after:h-[1.5px]
                after:bg-gold after:transition-all after:duration-300
                ${location.pathname === link.to
                  ? 'text-espresso after:w-full'
                  : 'text-walnut-light hover:text-espresso after:w-0 hover:after:w-full'
                }
              `}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="
              relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium tracking-wider uppercase
              bg-espresso text-cream hover:bg-walnut-light hover:shadow-lg
              transition-all duration-300 group
            "
          >
            <ShoppingBag className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold text-espresso text-[10px] font-bold flex items-center justify-center animate-scale-in">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile menu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-lg text-espresso hover:bg-cream transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          lg:hidden fixed inset-0 top-0 z-40 transition-all duration-500
          ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div className="absolute inset-0 bg-espresso/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
        <div
          className={`
            absolute right-0 top-0 h-full w-[80%] max-w-sm bg-ivory shadow-2xl
            transform transition-transform duration-500 ease-out
            ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <div className="flex flex-col h-full pt-24 pb-8 px-8">
            <nav className="flex flex-col gap-1">
              {SHOP_NAV_LINKS.map((link, i) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="font-display text-xl text-walnut py-3 border-b border-cream-dark/50 hover:text-gold hover:pl-2 transition-all duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto">
              <button
                onClick={() => { setMobileOpen(false); setIsDrawerOpen(true); }}
                className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-espresso text-cream font-medium tracking-wider uppercase text-sm"
              >
                <ShoppingBag className="w-5 h-5" />
                View Cart ({totalItems})
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
