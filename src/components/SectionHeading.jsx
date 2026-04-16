import { useScrollReveal } from '../hooks/useScrollReveal';

export default function SectionHeading({ eyebrow, title, subtitle, light = false, className = '' }) {
  const [ref, isVisible] = useScrollReveal();

  return (
    <div ref={ref} className={`text-center mb-16 md:mb-20 ${className}`}>
      {eyebrow && (
        <span
          className={`
            inline-block font-accent text-lg md:text-xl tracking-[0.2em] uppercase mb-4
            ${light ? 'text-mint-light' : 'text-gold'}
            ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}
          `}
        >
          {eyebrow}
        </span>
      )}

      <h2
        className={`
          font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-semibold leading-tight mb-5
          ${light ? 'text-cream' : 'text-espresso'}
          ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}
        `}
      >
        {title}
      </h2>

      <div
        className={`flex justify-center ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}
      >
        <div className="luxury-divider-wide" />
      </div>

      {subtitle && (
        <p
          className={`
            mt-6 max-w-2xl mx-auto text-base md:text-lg leading-relaxed
            ${light ? 'text-cream/80' : 'text-warm-gray-dark'}
            ${isVisible ? 'animate-fade-in-up delay-300' : 'opacity-0'}
          `}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
