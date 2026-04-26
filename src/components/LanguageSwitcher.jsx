import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

const LANG_OPTIONS = [
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' }
];

export default function LanguageSwitcher({ scrolled, isMobile = false }) {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = LANG_OPTIONS.find(o => o.code === lang) || LANG_OPTIONS[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setLang(code);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <div className="flex gap-2 mt-4 pt-4 border-t border-cream-dark/30">
        {LANG_OPTIONS.map(option => (
          <button
            key={option.code}
            onClick={() => handleSelect(option.code)}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300
              ${lang === option.code 
                ? 'bg-espresso shadow-md ring-2 ring-gold/50' 
                : 'bg-ivory/50 border border-cream-dark/30 hover:bg-cream'}
            `}
            title={option.label}
          >
            {option.flag}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium tracking-wider
          transition-all duration-300 border
          ${scrolled
            ? 'bg-ivory/50 text-espresso border-cream-dark/40 hover:bg-cream'
            : 'bg-black/10 text-ivory border-ivory/30 hover:bg-black/20 hover:border-ivory/50'
          }
        `}
      >
        <span className="text-base leading-none">{currentLang.flag}</span>
        <span className="uppercase">{currentLang.code}</span>
      </button>

      <div
        className={`
          absolute right-0 top-full mt-2 w-36 rounded-xl overflow-hidden shadow-xl
          bg-ivory/95 backdrop-blur-md border border-cream-dark/30
          transform transition-all duration-300 origin-top-right z-50
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
        `}
      >
        <div className="py-1">
          {LANG_OPTIONS.map(option => (
            <button
              key={option.code}
              onClick={() => handleSelect(option.code)}
              className={`
                w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors
                ${lang === option.code ? 'bg-mint/15 text-espresso font-semibold' : 'text-walnut-light hover:bg-cream-light hover:text-espresso'}
              `}
            >
              <span className="text-base leading-none">{option.flag}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
