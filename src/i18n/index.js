// src/i18n/index.js
// Initializes i18next with react-i18next.
// Language packs are imported statically (all are small JSON files).
// The active language is loaded from localStorage on startup.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import bn from './locales/bn.json';
import gu from './locales/gu.json';
import ml from './locales/ml.json';
import pa from './locales/pa.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English',    nativeLabel: 'English',    flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi',      nativeLabel: 'हिन्दी',      flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi',    nativeLabel: 'मराठी',       flag: '🇮🇳' },
  { code: 'ta', label: 'Tamil',      nativeLabel: 'தமிழ்',       flag: '🇮🇳' },
  { code: 'te', label: 'Telugu',     nativeLabel: 'తెలుగు',       flag: '🇮🇳' },
  { code: 'kn', label: 'Kannada',    nativeLabel: 'ಕನ್ನಡ',       flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali',    nativeLabel: 'বাংলা',        flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati',   nativeLabel: 'ગુજરાતી',      flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam',  nativeLabel: 'മലയാളം',      flag: '🇮🇳' },
  { code: 'pa', label: 'Punjabi',    nativeLabel: 'ਪੰਜਾਬੀ',       flag: '🇮🇳' },
];

i18n
  .use(initReactI18next)
  .init({
    resources: { en, hi, mr, ta, te, kn, bn, gu, ml, pa },
    lng: localStorage.getItem('mm_language') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    ns: ['translation'],
    defaultNS: 'translation',
  });

export default i18n;
