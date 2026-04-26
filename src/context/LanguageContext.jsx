import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

const SUPPORTED_LANGS = ['tr', 'en', 'de', 'ru'];

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const saved = localStorage.getItem('gelatte-lang');
    return SUPPORTED_LANGS.includes(saved) ? saved : 'tr';
  });

  const setLang = useCallback((l) => {
    if (SUPPORTED_LANGS.includes(l)) {
      setLangState(l);
      localStorage.setItem('gelatte-lang', l);
    }
  }, []);

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, SUPPORTED_LANGS }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
