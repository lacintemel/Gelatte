import { ArrowRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BRAND } from '../constants';

export default function Hero() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.png"
          alt="GELATTE luxury boutique interior"
          className="w-full h-full object-cover"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-espresso/80 via-espresso/50 to-espresso/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-espresso/20" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-mint/10 blur-3xl animate-float" />
      <div className="absolute bottom-32 left-10 w-48 h-48 rounded-full bg-gold/10 blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-8 pt-32 pb-20">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          <div className="animate-fade-in-up mb-6">
            <span className="inline-flex items-center gap-3 text-gold-light font-accent text-base md:text-lg tracking-[0.25em] uppercase">
              <span className="w-8 h-[1px] bg-gold-light" />
              {BRAND.tagline}
              <span className="w-8 h-[1px] bg-gold-light" />
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up delay-200 font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-ivory leading-[0.95] mb-8">
            Where Every
            <br />
            <span className="text-mint-light italic font-medium">Flavour</span>
            <br />
            Tells a Story
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-in-up delay-400 font-body text-base md:text-lg text-cream/80 leading-relaxed max-w-xl mb-10">
            Discover an exquisite world of artisan gelato, specialty coffees, fresh-baked pastries,
            and luxurious desserts — all crafted with passion in our Mediterranean-inspired boutique.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-in-up delay-500 flex flex-col sm:flex-row gap-4">
            <a
              href="#categories"
              id="hero-explore-cta"
              className="
                group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full
                bg-ivory text-espresso font-medium text-sm tracking-wider uppercase
                hover:bg-cream hover:shadow-2xl hover:shadow-ivory/20
                transition-all duration-300
              "
            >
              Explore Menu
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            <Link
              to="/shop"
              id="hero-order-cta"
              className="
                group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full
                bg-transparent text-ivory font-medium text-sm tracking-wider uppercase
                border border-ivory/40 hover:bg-ivory/10 hover:border-ivory/70
                transition-all duration-300
              "
            >
              Order Online
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="animate-fade-in delay-700 mt-14 flex items-center gap-8 text-cream/50 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-mint" />
              <span>Premium Ingredients</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gold" />
              <span>Handcrafted Daily</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-mint-light" />
              <span>Since 2019</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#categories"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-cream/40 hover:text-cream/70 transition-colors animate-float"
      >
        <span className="text-xs tracking-[0.2em] uppercase font-light">Scroll</span>
        <ChevronDown className="w-5 h-5" />
      </a>
    </section>
  );
}
