import { useScrollReveal } from '../hooks/useScrollReveal';
import SectionHeading from './SectionHeading';

export default function About() {
  const [refLeft, visLeft] = useScrollReveal(0.2);
  const [refRight, visRight] = useScrollReveal(0.2);

  return (
    <section id="about" className="py-24 md:py-32 bg-ivory">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading
          eyebrow="Our Story"
          title="The GELATTE Experience"
        />

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <div
            ref={refLeft}
            className={`relative ${visLeft ? 'animate-slide-left' : 'opacity-0'}`}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/store-interior.png"
                alt="GELATTE boutique interior"
                className="w-full h-[500px] object-cover"
              />
              {/* Overlay accent */}
              <div className="absolute inset-0 bg-gradient-to-t from-espresso/20 to-transparent" />
            </div>

            {/* Floating accent card */}
            <div className="absolute -bottom-6 -right-4 md:-right-8 bg-ivory rounded-xl p-6 shadow-xl border border-cream-dark/30 max-w-[200px]">
              <span className="font-display text-4xl font-bold text-espresso block">5+</span>
              <span className="text-warm-gray-dark text-sm mt-1 block">Years of Crafting Premium Desserts</span>
            </div>

            {/* Decorative mint border */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-mint/40 rounded-tl-2xl" />
          </div>

          {/* Text Side */}
          <div
            ref={refRight}
            className={`${visRight ? 'animate-slide-right' : 'opacity-0'}`}
          >
            <h3 className="font-accent text-lg tracking-[0.15em] uppercase text-gold mb-4">
              Founded in 2019
            </h3>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-espresso leading-tight mb-6">
              A Destination for Those Who Appreciate the Finer Things
            </h2>

            <div className="space-y-5 text-warm-gray-dark leading-relaxed">
              <p>
                GELATTE was born from a simple yet ambitious vision: to create a space where
                the art of dessert-making meets the warmth of Mediterranean hospitality. Every
                detail — from our hand-selected ingredients to our boutique interiors — reflects
                our unwavering commitment to excellence.
              </p>
              <p>
                Our artisan team crafts each gelato flavour, pastry, and coffee drink with
                the precision of a jeweller and the passion of a storyteller. We source
                Sicilian pistachios, Belgian chocolate, single-origin Ethiopian beans, and
                the freshest seasonal fruits to ensure every bite is extraordinary.
              </p>
              <p>
                Step into GELATTE and discover a world where cream-toned elegance, subtle
                mint accents, and the aroma of freshly baked croissants create an
                unforgettable sensory experience.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t border-cream-dark/40">
              {[
                { num: '50+', label: 'Artisan Flavours' },
                { num: '20K+', label: 'Happy Guests' },
                { num: '100%', label: 'Natural Ingredients' },
              ].map((stat) => (
                <div key={stat.label}>
                  <span className="font-display text-2xl md:text-3xl font-bold text-espresso block">
                    {stat.num}
                  </span>
                  <span className="text-warm-gray text-xs md:text-sm tracking-wide uppercase mt-1 block">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
