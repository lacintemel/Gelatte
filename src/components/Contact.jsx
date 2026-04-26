import { MapPin, Phone, Mail, Clock, ArrowRight } from 'lucide-react';
import { CONTACT } from '../constants';
import { useScrollReveal } from '../hooks/useScrollReveal';
import SectionHeading from './SectionHeading';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

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

export default function Contact() {
  const [refLeft, isVisLeft] = useScrollReveal(0.2);
  const [refRight, isVisRight] = useScrollReveal(0.3);
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-24 md:py-32 bg-ivory">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading
          eyebrow={t('cont_eyebrow')}
          title={t('cont_title')}
          subtitle={t('cont_sub')}
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mt-16 md:mt-20">
          {/* Info Side */}
          <div
            ref={refLeft}
            className={`space-y-12 ${isVisLeft ? 'animate-fade-in-up' : 'opacity-0'}`}
          >
            <div className="space-y-8">
              {/* Address */}
              <div className="flex gap-5 group">
                <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-mint-subtle">
                  <MapPin className="w-5 h-5 text-espresso" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold text-espresso mb-2">
                    {t('cont_address')}
                  </h4>
                  <p className="text-warm-gray-dark leading-relaxed">
                    {CONTACT.address}
                  </p>
                </div>
              </div>

              {/* Contact Details */}
              <div className="flex gap-5 group">
                <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-mint-subtle">
                  <Phone className="w-5 h-5 text-espresso" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold text-espresso mb-2">
                    {t('cont_phone')} & {t('cont_email')}
                  </h4>
                  <p className="text-warm-gray-dark mb-1">
                    <a href={`tel:${CONTACT.phone}`} className="hover:text-gold transition-colors">{CONTACT.phone}</a>
                  </p>
                  <p className="text-warm-gray-dark">
                    <a href={`mailto:${CONTACT.email}`} className="hover:text-gold transition-colors">{CONTACT.email}</a>
                  </p>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex gap-5 group">
                <div className="w-12 h-12 rounded-full bg-cream flex items-center justify-center shrink-0 transition-colors duration-300 group-hover:bg-mint-subtle">
                  <Clock className="w-5 h-5 text-espresso" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold text-espresso mb-2">
                    {t('cont_hours')}
                  </h4>
                  <div className="space-y-2 text-warm-gray-dark">
                    <div className="flex justify-between gap-8 border-b border-cream-dark/30 pb-2">
                      <span className="font-medium">{t('cont_everyday')}</span>
                      <span>{CONTACT.hours}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-cream-dark/50">
              <h4 className="font-display text-lg font-semibold text-espresso mb-6">
                {t('cont_follow')}
              </h4>
              <div className="flex gap-4">
                {[
                  { icon: InstagramIcon, href: CONTACT.social.instagram, label: 'Instagram' },
                  { icon: FacebookIcon, href: CONTACT.social.facebook, label: 'Facebook' },
                  { icon: TwitterIcon, href: CONTACT.social.twitter, label: 'Twitter' },
                ].map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-espresso text-cream flex items-center justify-center hover:bg-gold hover:text-espresso hover:-translate-y-1 transition-all duration-300"
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link
                to="/shop"
                className="
                  inline-flex items-center gap-3 px-8 py-4 rounded-full
                  bg-espresso text-cream font-medium tracking-wider uppercase text-sm
                  hover:bg-walnut-light hover:shadow-lg transition-all duration-300 group
                "
              >
                {t('cont_order_cta')}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* Map Side */}
          <div
            ref={refRight}
            className={`
              h-[400px] lg:h-auto min-h-[400px] rounded-3xl overflow-hidden shadow-xl
              ${isVisRight ? 'animate-fade-in-up' : 'opacity-0'}
            `}
            style={{ animationDelay: '0.2s' }}
          >
            <iframe
              src={CONTACT.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="GELATTE Store Location"
              className="w-full h-full grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
