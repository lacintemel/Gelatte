import { ShoppingBag } from 'lucide-react';
import { PRODUCTS, SHOP_URL } from '../constants';
import { useScrollReveal } from '../hooks/useScrollReveal';
import SectionHeading from './SectionHeading';

const BADGE_STYLES = {
  'Signature': 'bg-espresso text-cream',
  'Best Seller': 'bg-gold text-espresso',
  'Fresh Daily': 'bg-mint text-espresso',
};

function ProductCard({ product, index }) {
  const [ref, isVisible] = useScrollReveal(0.1);

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
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badge */}
        {product.badge && (
          <span className={`
            absolute top-4 left-4 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wider uppercase
            ${BADGE_STYLES[product.badge] || 'bg-espresso text-cream'}
          `}>
            {product.badge}
          </span>
        )}

        {/* Quick order overlay */}
        <a
          href={SHOP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            absolute bottom-4 right-4 w-12 h-12 rounded-full bg-ivory flex items-center justify-center
            shadow-lg opacity-0 translate-y-4 transition-all duration-400
            group-hover:opacity-100 group-hover:translate-y-0
            hover:bg-cream hover:scale-110
          "
          aria-label={`Order ${product.name}`}
        >
          <ShoppingBag className="w-5 h-5 text-espresso" />
        </a>
      </div>

      {/* Content */}
      <div className="p-5 md:p-6">
        <h3 className="font-display text-lg md:text-xl font-semibold text-espresso mb-2 group-hover:text-walnut-light transition-colors">
          {product.name}
        </h3>
        <p className="text-warm-gray-dark text-sm leading-relaxed mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="font-display text-xl font-semibold text-espresso">
            {product.price}
          </span>
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              text-sm font-medium text-gold-dark hover:text-espresso
              tracking-wide uppercase transition-colors duration-300
              border-b border-gold-light/40 hover:border-espresso/40 pb-0.5
            "
          >
            Order Now
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  return (
    <section id="products" className="py-24 md:py-32 bg-cream-light">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading
          eyebrow="Signature Collection"
          title="Our Finest Creations"
          subtitle="Each item is meticulously crafted by our artisan team, using premium ingredients sourced from the world's finest producers."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {PRODUCTS.map((product, i) => (
            <ProductCard key={product.name} product={product} index={i} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            id="products-order-cta"
            className="
              inline-flex items-center gap-3 px-10 py-4 rounded-full
              bg-espresso text-cream font-medium text-sm tracking-wider uppercase
              hover:bg-walnut-light hover:shadow-xl transition-all duration-300
              group
            "
          >
            <ShoppingBag className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            View Full Menu & Order
          </a>
        </div>
      </div>
    </section>
  );
}
