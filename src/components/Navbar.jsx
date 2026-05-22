import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Menu, X, Sun, Moon } from 'lucide-react';
import { BRAND, NAV_LINKS, EXTERNAL_MENU_URL } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll on mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      id="navbar"
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-500
        ${scrolled
          ? 'glass shadow-[0_4px_30px_rgba(62,39,35,0.08)] py-3'
          : 'bg-transparent py-5'
        }
      `}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#home"
          className="flex items-center gap-2 group"
          id="logo-link"
        >
          <span className={`
            font-display text-2xl md:text-3xl font-bold tracking-[0.08em] transition-colors duration-300
            ${scrolled ? 'text-espresso' : 'text-ivory'}
            group-hover:text-gold
          `}>
            GELATTE
          </span>
          <span className={`
            hidden sm:block font-accent text-xs tracking-[0.15em] uppercase mt-1.5 transition-colors duration-300
            ${scrolled ? 'text-warm-gray' : 'text-cream/70'}
          `}>
            {BRAND.tagline}
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-8" id="desktop-nav">
          {NAV_LINKS.map((link) => (
            link.external ? (
              <a
                key={link.href}
                href={EXTERNAL_MENU_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  whitespace-nowrap relative font-body text-xs xl:text-sm tracking-[0.08em] uppercase transition-colors duration-300
                  after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px]
                  after:bg-gold after:transition-all after:duration-300 hover:after:w-full
                  ${scrolled
                    ? 'text-walnut-light hover:text-espresso'
                    : 'text-cream/90 hover:text-ivory'
                  }
                `}
              >
                {t(`nav_${link.label.toLowerCase()}`)}
              </a>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className={`
                  whitespace-nowrap relative font-body text-xs xl:text-sm tracking-[0.08em] uppercase transition-colors duration-300
                  after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-[1.5px]
                  after:bg-gold after:transition-all after:duration-300 hover:after:w-full
                  ${scrolled
                    ? 'text-walnut-light hover:text-espresso'
                    : 'text-cream/90 hover:text-ivory'
                  }
                `}
              >
                {t(`nav_${link.label.toLowerCase()}`)}
              </a>
            )
          ))}
        </nav>

        {/* Right Side */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden lg:block">
            <LanguageSwitcher scrolled={scrolled} />
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`hidden lg:flex w-9 h-9 rounded-full items-center justify-center border transition-all duration-300 ${
              scrolled
                ? 'bg-ivory/50 text-espresso border-cream-dark/40 hover:bg-cream'
                : 'bg-black/10 text-ivory border-ivory/30 hover:bg-black/20 hover:border-ivory/50'
            }`}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Cart / Shop Button — now links to internal /shop page */}
          <Link
            to="/shop"
            id="cart-button"
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium tracking-wider uppercase
              transition-all duration-300 group
              ${scrolled
                ? 'bg-espresso text-cream hover:bg-walnut-light hover:shadow-lg'
                : 'bg-ivory/15 text-ivory border border-ivory/30 hover:bg-ivory/25 hover:border-ivory/50'
              }
            `}
          >
            <ShoppingBag className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <span className="hidden sm:inline">{t('nav_shop')}</span>
          </Link>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300
                ${scrolled ? 'text-espresso hover:bg-cream' : 'text-ivory hover:bg-ivory/10'}
              `}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`p-2 rounded-lg transition-colors duration-300
                ${scrolled ? 'text-espresso hover:bg-cream' : 'text-ivory hover:bg-ivory/10'}
              `}
              id="mobile-menu-button"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          lg:hidden fixed inset-0 top-0 z-40 transition-all duration-500
          ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        id="mobile-menu"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-espresso/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />

        {/* Panel */}
        <div
          className={`
            absolute right-0 top-0 h-full w-[80%] max-w-sm bg-ivory shadow-2xl
            transform transition-transform duration-500 ease-out
            ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <div className="flex flex-col h-full pt-20 pb-8 px-8 overflow-y-auto">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 text-espresso hover:bg-cream rounded-lg transition-colors"
                aria-label="Close mobile menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col gap-1" id="mobile-nav">
              {NAV_LINKS.map((link, i) => (
                link.external ? (
                  <a
                    key={link.href}
                    href={EXTERNAL_MENU_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className={`
                      font-display text-xl text-walnut py-3 border-b border-cream-dark/50
                      hover:text-gold hover:pl-2 transition-all duration-300
                      ${mobileOpen ? 'animate-slide-right' : 'opacity-0'}
                    `}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {t(`nav_${link.label.toLowerCase()}`)}
                  </a>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      font-display text-xl text-walnut py-3 border-b border-cream-dark/50
                      hover:text-gold hover:pl-2 transition-all duration-300
                      ${mobileOpen ? 'animate-slide-right' : 'opacity-0'}
                    `}
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    {t(`nav_${link.label.toLowerCase()}`)}
                  </a>
                )
              ))}
            </nav>
            
            <LanguageSwitcher isMobile={true} />

            <div className="mt-8 mb-auto">
              <Link
                to="/shop"
                onClick={() => setMobileOpen(false)}
                id="mobile-order-button"
                className="
                  flex items-center justify-center gap-3 w-full py-4 rounded-xl
                  bg-espresso text-cream font-medium tracking-wider uppercase text-sm
                  hover:bg-walnut-light transition-colors duration-300
                "
              >
                <ShoppingBag className="w-5 h-5" />
                {t('shop_and_order')}
              </Link>

              <p className="text-center text-warm-gray text-xs mt-6 font-accent tracking-widest uppercase">
                {BRAND.tagline}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
