import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { updateLanguage as updateLanguageApi } from '../lib/api';
import { SUPPORTED_LANGUAGES } from '../i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('mm_language') || 'en';
  });

  const setLanguage = async (newLang) => {
    try {
      await i18n.changeLanguage(newLang);
      setLanguageState(newLang);
      localStorage.setItem('mm_language', newLang);
      
      // Try to sync with backend if user is logged in
      const token = localStorage.getItem('token');
      if (token) {
        await updateLanguageApi(newLang).catch(err => console.error('Failed to sync language to backend:', err));
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  useEffect(() => {
    // If the i18n language is somehow different from state, sync it (e.g. initial load)
    if (i18n.language !== language && SUPPORTED_LANGUAGES.some(l => l.code === language)) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, supportedLanguages: SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
