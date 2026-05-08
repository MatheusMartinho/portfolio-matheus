import React, { useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import translations from './translations';

const STORAGE_KEY = 'lang';
const DEFAULT_LANG = 'pt';
const LANG_EVENT = 'matheus:lang-change';

const isValidLang = value => value === 'pt' || value === 'en';

const readLang = () => {
  if (typeof window === 'undefined') return DEFAULT_LANG;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isValidLang(saved) ? saved : DEFAULT_LANG;
  } catch (err) {
    return DEFAULT_LANG;
  }
};

// Provider mantido como no-op pra preservar compatibilidade com imports antigos.
// O state real vem do hook useLang via localStorage + custom event.
export const LanguageProvider = ({ children }) => <>{children}</>;
LanguageProvider.propTypes = { children: PropTypes.node };

export const useLang = () => {
  const [lang, setLangState] = useState(readLang);

  useEffect(() => {
    const onChange = () => setLangState(readLang());
    window.addEventListener(LANG_EVENT, onChange);
    window.addEventListener('storage', onChange);
    // Sync inicial pós-hidratação caso localStorage tenha valor diferente do default.
    onChange();
    return () => {
      window.removeEventListener(LANG_EVENT, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const setLanguage = useCallback(next => {
    if (!isValidLang(next)) return;
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch (err) {
      /* noop */
    }
    window.dispatchEvent(new CustomEvent(LANG_EVENT));
  }, []);

  return {
    lang,
    setLanguage,
    t: translations[lang] || translations[DEFAULT_LANG],
  };
};
