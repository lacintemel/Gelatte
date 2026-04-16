import { GALLERY } from '../constants';
import { useScrollReveal } from '../hooks/useScrollReveal';
import SectionHeading from './SectionHeading';

function GalleryItem({ item, index, className = '' }) {
  const [ref, isVisible] = useScrollReveal(0.1);

  return (
    <div
      ref={ref}
      className={`
        img-hover-zoom rounded-2xl overflow-hidden shadow-lg group cursor-pointer
        ${className}
        ${isVisible ? 'animate-scale-in' : 'opacity-0'}
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="relative w-full h-full">
        <img
          src={item.src}
          alt={item.alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-espresso/0 group-hover:bg-espresso/40 transition-all duration-500 flex items-center justify-center">
          <span className="font-accent text-ivory text-lg tracking-widest uppercase opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            {item.alt}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Gallery() {
  return (
    <section id="gallery" className="py-24 md:py-32 bg-espresso relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-mint/5 blur-3xl" />

      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <SectionHeading
          eyebrow="Our Space"
          title="A Luxury Store Experience"
          subtitle="Step inside our boutique where cream surfaces, mint accents, warm lighting, and artisan displays create an atmosphere of refined indulgence."
          light
        />

        {/* Masonry-like grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[250px]">
          {/* Large item - spans 2 cols and 2 rows */}
          <GalleryItem
            item={GALLERY[0]}
            index={0}
            className="col-span-2 row-span-2"
          />

          {/* Regular items */}
          <GalleryItem
            item={GALLERY[1]}
            index={1}
            className="col-span-1 row-span-1"
          />
          <GalleryItem
            item={GALLERY[2]}
            index={2}
            className="col-span-1 row-span-1"
          />
          <GalleryItem
            item={GALLERY[3]}
            index={3}
            className="col-span-1 row-span-1"
          />
          <GalleryItem
            item={GALLERY[4]}
            index={4}
            className="col-span-1 row-span-1"
          />
        </div>
      </div>
    </section>
  );
}
