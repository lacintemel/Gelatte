import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Sun, Moon, User, LogIn } from 'lucide-react';
import { BRAND } from '../constants';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

const SHOP_NAV_LINKS = [
  { label: 'Home', key: 'nav_home', to: '/' },
  { label: 'Shop', key: 'nav_shop', to: '/shop' },
];

export default function ShopNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, setIsDrawerOpen } = useCart();
  const location = useLocation();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, currentUser } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
            {t('nav_shop')}
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
              {t(link.key)}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:block">
            <LanguageSwitcher scrolled={true} />
          </div>

          {/* Dark Mode Toggle (Desktop) */}
          <button
            onClick={toggleTheme}
            className="hidden lg:flex w-9 h-9 rounded-full items-center justify-center bg-ivory/50 text-espresso border border-cream-dark/40 hover:bg-cream transition-all duration-300"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Account / Login (Desktop) */}
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            className="hidden sm:flex w-9 h-9 rounded-full items-center justify-center bg-ivory/50 text-espresso border border-cream-dark/40 hover:bg-cream transition-all duration-300"
            title={isAuthenticated ? currentUser?.name : 'Login'}
          >
            {isAuthenticated ? <User className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
          </Link>

          {/* Cart Button (Desktop) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="
              relative hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium tracking-wider uppercase
              bg-espresso text-cream hover:bg-walnut-light hover:shadow-lg
              transition-all duration-300 group
            "
          >
            <ShoppingBag className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="hidden sm:inline">{t('nav_cart')}</span>
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold text-espresso text-[10px] font-bold flex items-center justify-center animate-scale-in">
                {totalItems}
              </span>
            )}
          </button>

          {/* Mobile actions */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-espresso hover:bg-cream transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link
              to={isAuthenticated ? '/account' : '/login'}
              className="p-2 rounded-lg text-espresso hover:bg-cream transition-colors"
            >
              {isAuthenticated ? <User className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
            </Link>
            {/* Cart Icon — replaces three-dot / hamburger menu on mobile */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="relative p-2 rounded-lg text-espresso hover:bg-cream transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] min-h-[18px] rounded-full bg-gold text-espresso text-[9px] font-bold flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
