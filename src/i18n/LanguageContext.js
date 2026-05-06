import React, { createContext, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import translations from './translations';

const STORAGE_KEY = 'lang';
const DEFAULT_LANG = 'pt';

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  setLanguage: () => {},
  t: translations[DEFAULT_LANG],
});

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(DEFAULT_LANG);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'pt' || saved === 'en') setLang(saved);
  }, []);

  const setLanguage = next => {
    if (next !== 'pt' && next !== 'en') return;
    setLang(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  };

  const value = {
    lang,
    setLanguage,
    t: translations[lang],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

LanguageProvider.propTypes = {
  children: PropTypes.node,
};

export const useLang = () => useContext(LanguageContext);
