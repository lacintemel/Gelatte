import { ArrowUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BRAND, NAV_LINKS, CONTACT, EXTERNAL_MENU_URL } from '../constants';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-espresso text-ivory relative overflow-hidden pt-24 pb-8">
      {/* Background elements */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <a href="#home" className="inline-block mb-6 group" onClick={scrollToTop}>
              <span className="font-display text-3xl font-bold tracking-[0.08em] group-hover:text-gold transition-colors">
                GELATTE
              </span>
              <span className="block font-accent text-xs tracking-[0.15em] uppercase text-gold-light mt-2">
                {BRAND.tagline}
              </span>
            </a>
            <p className="text-cream/60 leading-relaxed font-body text-sm max-w-sm mb-8">
              {t('hero_sub')}
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-display text-lg font-semibold mb-6 tracking-wide text-gold-light">
              {t('foot_nav')}
            </h4>
            <ul className="space-y-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.external ? EXTERNAL_MENU_URL : link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="text-cream/60 hover:text-ivory text-sm uppercase tracking-wider transition-colors inline-flex items-center gap-2 group"
                  >
                    <span className="w-0 h-[1px] bg-gold transition-all duration-300 group-hover:w-4" />
                    {t(`nav_${link.label.toLowerCase()}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3 lg:col-start-8">
            <h4 className="font-display text-lg font-semibold mb-6 tracking-wide text-gold-light">
              {t('foot_contact')}
            </h4>
            <ul className="space-y-4 text-sm text-cream/60">
              <li>
                <p className="mb-1 text-ivory font-medium">{t('cont_address')}</p>
                <p>{CONTACT.address}</p>
              </li>
              <li>
                <p className="mb-1 text-ivory font-medium">{t('cont_phone')}</p>
                <a href={`tel:${CONTACT.phone}`} className="hover:text-gold transition-colors">
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <p className="mb-1 text-ivory font-medium">{t('cont_email')}</p>
                <a href={`mailto:${CONTACT.email}`} className="hover:text-gold transition-colors">
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Order Online Callout */}
          <div className="lg:col-span-3 lg:col-start-11">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-mint-light/10 rounded-bl-full transition-transform duration-500 group-hover:scale-110" />
              
              <h4 className="font-display text-xl font-semibold mb-3">
                {t('foot_order_title')}
              </h4>
              <p className="text-sm text-cream/60 mb-6 leading-relaxed">
                {t('foot_order_desc')}
              </p>
              
              <Link
                to="/shop"
                className="
                  inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wider
                  text-gold hover:text-gold-light transition-colors
                "
              >
                {t('foot_shop_now')}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-cream/10 text-xs text-cream/40 uppercase tracking-widest text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} GELATTE. {t('foot_rights')}</p>
          <p className="text-gold-light font-medium tracking-[0.2em]">{t('foot_created_by')}</p>
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 hover:text-ivory transition-colors"
            aria-label="Scroll to top"
          >
            <span>Top</span>
            <div className="w-8 h-8 rounded-full border border-cream/20 flex items-center justify-center">
              <ArrowUp className="w-3 h-3" />
            </div>
          </button>
        </div>
      </div>
    </footer>
  );
}
