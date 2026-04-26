import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS } from '../constants';
import { useScrollReveal } from '../hooks/useScrollReveal';
import SectionHeading from './SectionHeading';
import { useLanguage } from '../context/LanguageContext';

function TestimonialCard({ testimonial, index }) {
  const [ref, isVisible] = useScrollReveal(0.1);

  return (
    <div
      ref={ref}
      className={`
        relative bg-ivory rounded-2xl p-8 md:p-10
        shadow-[0_2px_20px_rgba(62,39,35,0.05)]
        hover:shadow-[0_8px_40px_rgba(62,39,35,0.1)]
        transition-all duration-500 hover:-translate-y-1
        border border-cream-dark/20
        ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}
      `}
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      {/* Quote icon */}
      <div className="absolute -top-4 right-8 w-10 h-10 rounded-full bg-mint-subtle flex items-center justify-center">
        <Quote className="w-4 h-4 text-mint-dark" />
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-6">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-gold text-gold" />
        ))}
      </div>

      {/* Text */}
      <p className="text-walnut-light leading-relaxed mb-8 text-[15px] italic font-light">
        "{testimonial.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4 pt-6 border-t border-cream-dark/30">
        {/* Avatar placeholder */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-mint-light to-mint flex items-center justify-center">
          <span className="font-display text-lg font-semibold text-espresso">
            {testimonial.name.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-display text-base font-semibold text-espresso">
            {testimonial.name}
          </p>
          <p className="text-warm-gray text-sm">{testimonial.role}</p>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { t } = useLanguage();

  return (
    <section id="testimonials" className="py-24 md:py-32 bg-cream-light">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading
          eyebrow={t('test_eyebrow')}
          title={t('test_title')}
          subtitle={t('test_sub')}
        />

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {TESTIMONIALS.map((testimonial, i) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
