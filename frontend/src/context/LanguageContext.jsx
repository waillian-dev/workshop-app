import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('workshop_lang') || 'en';
  });

  function changeLanguage(lang) {
    if (lang === 'en' || lang === 'mm') {
      setLanguage(lang);
      localStorage.setItem('workshop_lang', lang);
    }
  }

  // Translation helper function
  const t = useMemo(() => {
    return (key) => {
      const dictionary = translations[language] || translations['en'];
      return dictionary[key] || key;
    };
  }, [language]);

  const value = useMemo(() => ({
    language,
    changeLanguage,
    t
  }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
