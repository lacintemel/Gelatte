import { useScrollReveal } from '../hooks/useScrollReveal';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const [ref, isVisible] = useScrollReveal(0.2);
  const { t } = useLanguage();

  return (
    <section id="about" className="py-24 md:py-32 bg-ivory relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cream-light/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-mint-light/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

      <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* Text Content */}
          <div className={`
            max-w-2xl
            transition-all duration-1000 transform
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}
          `}>
            <div className="flex items-center gap-4 mb-6">
              <span className="w-12 h-[1px] bg-gold" />
              <span className="text-gold-dark font-accent text-sm tracking-[0.2em] uppercase">
                {t('about_eyebrow')}
              </span>
            </div>

            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-espresso font-bold leading-[1.1] mb-8">
              {t('about_title')}
            </h2>

            <div className="space-y-6 text-warm-gray-dark font-body leading-relaxed">
              <p className="text-lg md:text-xl text-espresso font-medium italic">
                "{t('about_heading')}"
              </p>
              <p>{t('about_p1')}</p>
              <p>{t('about_p2')}</p>
              <p>{t('about_p3')}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-cream-dark/30">
              <div>
                <span className="block font-display text-4xl text-espresso font-bold mb-2">5+</span>
                <span className="text-xs tracking-wider uppercase text-warm-gray-dark">{t('about_years')}</span>
              </div>
              <div>
                <span className="block font-display text-4xl text-espresso font-bold mb-2">50+</span>
                <span className="text-xs tracking-wider uppercase text-warm-gray-dark">{t('about_stat1')}</span>
              </div>
              <div>
                <span className="block font-display text-4xl text-espresso font-bold mb-2">10k+</span>
                <span className="text-xs tracking-wider uppercase text-warm-gray-dark">{t('about_stat2')}</span>
              </div>
            </div>
          </div>

          {/* Image grid */}
          <div className={`
            grid grid-cols-2 gap-4 md:gap-6
            transition-all duration-1000 delay-300 transform
            ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}
          `}>
            <div className="space-y-4 md:space-y-6 mt-12">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <img src="/images/gallery-display.png" alt="Gelatte crafting process" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img src="/images/bakery.png" alt="Gelatte fresh ingredients" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
            <div className="space-y-4 md:space-y-6">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img src="/images/store-interior.png" alt="Gelatte store interior" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl relative">
                <img src="/images/dessert.png" alt="Gelatte signature desserts" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-espresso/20" />
                <div className="absolute bottom-6 left-6 right-6 p-6 glass rounded-xl text-ivory">
                  <span className="font-display text-2xl font-semibold mb-1 block">{t('about_founded')}</span>
                  <span className="text-sm text-cream/80">{t('about_stat3')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
