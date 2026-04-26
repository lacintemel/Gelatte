import { Link } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import { useScrollReveal } from '../hooks/useScrollReveal';
import SectionHeading from './SectionHeading';
import { useLanguage } from '../context/LanguageContext';

function CategoryCard({ category, index, t }) {
  const [ref, isVisible] = useScrollReveal(0.1);

  return (
    <Link
      to="/shop"
      ref={ref}
      className={`
        group relative overflow-hidden rounded-2xl cursor-pointer
        ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Image */}
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={category.image}
          alt={t(`cat_${category.title.toLowerCase()}`)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/30 to-transparent transition-all duration-500 group-hover:from-espresso/95" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
          <span className="inline-block w-8 h-[1px] bg-gold mb-4 transition-all duration-500 group-hover:w-12" />
          <h3 className="font-display text-2xl md:text-3xl text-ivory font-semibold mb-2">
            {t(`cat_${category.title.toLowerCase()}`)}
          </h3>
          <p className="text-cream/70 text-sm leading-relaxed opacity-0 translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
            {t(`cat_${category.title.toLowerCase()}_desc`)}
          </p>
        </div>
      </div>

      {/* Corner accent */}
      <div className="absolute top-4 right-4 w-8 h-8 border-t border-r border-mint/40 rounded-tr-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Link>
  );
}

export default function Categories() {
  const { t } = useLanguage();

  return (
    <section id="categories" className="py-24 md:py-32 bg-ivory">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading
          eyebrow={t('cat_eyebrow')}
          title={t('cat_title')}
          subtitle={t('cat_sub')}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {CATEGORIES.map((cat, i) => (
            <CategoryCard key={cat.title} category={cat} index={i} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
