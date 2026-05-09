import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const ThemeContext = createContext(null);
const STORAGE_KEY = 'gelatte_theme';

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
