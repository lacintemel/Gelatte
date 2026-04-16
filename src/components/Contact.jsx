import { MapPin, Phone, Clock, Mail, Globe } from 'lucide-react';
import { CONTACT, SHOP_URL } from '../constants';
import { useScrollReveal } from '../hooks/useScrollReveal';
import SectionHeading from './SectionHeading';

/* Inline SVG social icons since lucide-react does not include branded icons */
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
const TiktokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.86a8.26 8.26 0 004.81 1.54V6.95a4.83 4.83 0 01-1.05-.26z"/>
  </svg>
);

const SOCIAL_LINKS = [
  { Icon: InstagramIcon, href: CONTACT.social.instagram, label: 'Instagram' },
  { Icon: FacebookIcon, href: CONTACT.social.facebook, label: 'Facebook' },
  { Icon: TwitterIcon, href: CONTACT.social.twitter, label: 'Twitter' },
  { Icon: TiktokIcon, href: CONTACT.social.tiktok, label: 'TikTok' },
];

export default function Contact() {
  const [refInfo, visInfo] = useScrollReveal(0.1);
  const [refMap, visMap] = useScrollReveal(0.1);

  return (
    <section id="contact" className="py-24 md:py-32 bg-ivory">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading
          eyebrow="Visit Us"
          title="Find Our Boutique"
          subtitle="We'd love to welcome you. Visit our boutique for a premium dessert experience or order online for delivery."
        />

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Contact Info */}
          <div
            ref={refInfo}
            className={`space-y-8 ${visInfo ? 'animate-slide-left' : 'opacity-0'}`}
          >
            {/* Address */}
            <div className="flex gap-5 items-start group">
              <div className="w-12 h-12 rounded-xl bg-mint-subtle flex items-center justify-center shrink-0 group-hover:bg-mint-light transition-colors duration-300">
                <MapPin className="w-5 h-5 text-mint-dark" />
              </div>
              <div>
                <h4 className="font-display text-lg font-semibold text-espresso mb-1">Address</h4>
                <p className="text-warm-gray-dark leading-relaxed">{CONTACT.address}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex gap-5 items-start group">
              <div className="w-12 h-12 rounded-xl bg-mint-subtle flex items-center justify-center shrink-0 group-hover:bg-mint-light transition-colors duration-300">
                <Phone className="w-5 h-5 text-mint-dark" />
              </div>
              <div>
                <h4 className="font-display text-lg font-semibold text-espresso mb-1">Phone</h4>
                <a href={`tel:${CONTACT.phone}`} className="text-warm-gray-dark hover:text-gold transition-colors">
                  {CONTACT.phone}
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-5 items-start group">
              <div className="w-12 h-12 rounded-xl bg-mint-subtle flex items-center justify-center shrink-0 group-hover:bg-mint-light transition-colors duration-300">
                <Mail className="w-5 h-5 text-mint-dark" />
              </div>
              <div>
                <h4 className="font-display text-lg font-semibold text-espresso mb-1">Email</h4>
                <a href={`mailto:${CONTACT.email}`} className="text-warm-gray-dark hover:text-gold transition-colors">
                  {CONTACT.email}
                </a>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-5 items-start group">
              <div className="w-12 h-12 rounded-xl bg-mint-subtle flex items-center justify-center shrink-0 group-hover:bg-mint-light transition-colors duration-300">
                <Clock className="w-5 h-5 text-mint-dark" />
              </div>
              <div>
                <h4 className="font-display text-lg font-semibold text-espresso mb-1">Working Hours</h4>
                <div className="space-y-1.5">
                  {CONTACT.hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-8 text-warm-gray-dark text-sm">
                      <span className="font-medium text-walnut-light">{h.days}</span>
                      <span>{h.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="pt-6 border-t border-cream-dark/40">
              <h4 className="font-display text-lg font-semibold text-espresso mb-4">Follow Us</h4>
              <div className="flex gap-3">
                {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="
                      w-11 h-11 rounded-full bg-cream flex items-center justify-center
                      text-walnut hover:bg-espresso hover:text-cream
                      transition-all duration-300 hover:scale-110
                    "
                  >
                    <Icon />
                  </a>
                ))}
              </div>
            </div>

            {/* Order CTA */}
            <a
              href={SHOP_URL}
              target="_blank"
              rel="noopener noreferrer"
              id="contact-order-cta"
              className="
                inline-flex items-center gap-3 px-8 py-4 rounded-full
                bg-espresso text-cream font-medium text-sm tracking-wider uppercase
                hover:bg-walnut-light hover:shadow-xl transition-all duration-300
              "
            >
              Order Online for Delivery
            </a>
          </div>

          {/* Map */}
          <div
            ref={refMap}
            className={`${visMap ? 'animate-slide-right' : 'opacity-0'}`}
          >
            <div className="rounded-2xl overflow-hidden shadow-xl h-full min-h-[400px] lg:min-h-[500px] border border-cream-dark/20">
              <iframe
                src={CONTACT.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '400px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="GELATTE location map"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
