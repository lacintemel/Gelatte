import { ArrowUp } from 'lucide-react';
import { BRAND, NAV_LINKS, CONTACT, SHOP_URL } from '../constants';

/* Inline SVG social icons */
const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
);
const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
);
const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const SOCIAL_LINKS = [
  { Icon: InstagramIcon, href: CONTACT.social.instagram, label: 'Instagram' },
  { Icon: FacebookIcon, href: CONTACT.social.facebook, label: 'Facebook' },
  { Icon: TwitterIcon, href: CONTACT.social.twitter, label: 'Twitter' },
];

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-espresso text-cream/80 relative overflow-hidden">
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Decorative glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-32 bg-mint/5 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 pt-20 pb-8 relative">
        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <a href="#home" className="inline-block mb-5">
              <span className="font-display text-3xl font-bold text-ivory tracking-[0.08em]">
                GELATTE
              </span>
            </a>
            <p className="font-accent text-sm tracking-[0.15em] uppercase text-gold-light mb-4">
              {BRAND.tagline}
            </p>
            <p className="text-cream/60 text-sm leading-relaxed max-w-xs">
              {BRAND.description}
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="
                    w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center
                    hover:bg-mint/30 hover:text-ivory transition-all duration-300
                  "
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-base font-semibold text-ivory mb-6 tracking-wide">
              Navigation
            </h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-cream/60 hover:text-gold transition-colors duration-300 hover:pl-1"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-base font-semibold text-ivory mb-6 tracking-wide">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-cream/60">
              <li>{CONTACT.address}</li>
              <li>
                <a href={`tel:${CONTACT.phone}`} className="hover:text-gold transition-colors">
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`} className="hover:text-gold transition-colors">
                  {CONTACT.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Order column */}
          <div>
            <h4 className="font-display text-base font-semibold text-ivory mb-6 tracking-wide">
              Order Online
            </h4>
            <p className="text-sm text-cream/60 leading-relaxed mb-5">
              Can't visit us in person? Order your favourite gelato, pastries, and coffees online for
              delivery or pickup.
            </p>
            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="footer-order-cta"
              className="
                inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium
                bg-ivory/10 text-ivory border border-ivory/20
                hover:bg-gold hover:text-espresso hover:border-gold
                transition-all duration-300 tracking-wider uppercase
              "
            >
              Shop Now
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-ivory/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-cream/40 tracking-wide">
            © {new Date().getFullYear()} GELATTE. All rights reserved. Crafted with passion.
          </p>

          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="
              w-10 h-10 rounded-full bg-ivory/10 flex items-center justify-center
              hover:bg-gold hover:text-espresso transition-all duration-300
              hover:-translate-y-1
            "
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
