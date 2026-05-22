import { useScrollReveal } from '../hooks/useScrollReveal';
import SectionHeading from './SectionHeading';
import { useLanguage } from '../context/LanguageContext';
import { PRODUCTS } from '../constants';

const BADGE_STYLES = {
  'Signature': 'bg-espresso text-cream',
  'Best Seller': 'bg-gold text-espresso',
  'Fresh Daily': 'bg-mint text-espresso',
};

function ProductCard({ product, index, t }) {
  const [ref, isVisible] = useScrollReveal(0.1);

  // Map badge text for translations (e.g., 'Signature' -> 'prod_signature')
  const badgeKey = product.badge ? `prod_${product.badge.toLowerCase().replace(' ', '_')}` : null;

  return (
    <div
      ref={ref}
      className={`
        group relative bg-ivory rounded-2xl overflow-hidden
        shadow-[0_2px_20px_rgba(62,39,35,0.06)]
        hover:shadow-[0_8px_40px_rgba(62,39,35,0.12)]
        transition-all duration-500 hover:-translate-y-1
        ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={t(product.name)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <span className={`
            absolute top-4 left-4 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase
            ${BADGE_STYLES[product.badge] || 'bg-espresso text-cream'}
          `}>
            {t(badgeKey)}
          </span>
        )}
      </div>

      {/* Content — informational only (no order buttons) */}
      <div className="p-5 md:p-6">
        <h3 className="font-display text-lg md:text-xl font-semibold text-espresso mb-2 group-hover:text-walnut-light transition-colors">
          {t(product.name)}
        </h3>
        <p className="text-warm-gray-dark text-sm leading-relaxed line-clamp-2">
          {t(product.description)}
        </p>
      </div>
    </div>
  );
}

export default function Products() {
  const { t } = useLanguage();

  return (
    <section id="products" className="py-24 md:py-32 bg-cream-light">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading
          eyebrow={t('prod_eyebrow')}
          title={t('prod_title')}
          subtitle={t('prod_sub')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {PRODUCTS.map((product, i) => (
            <ProductCard key={i} product={product} index={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
