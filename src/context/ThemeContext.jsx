import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as api from '../lib/api';
import { BUILT_IN_THEMES, FONT_FAMILIES, FONT_SIZES, BORDER_RADII } from '../lib/themes';

const ThemeContext = createContext(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export const DEFAULT_PREFERENCES = {
  theme: 'midnight',
  customTheme: {
    primary: '#7F77DD',
    accent: '#5DCAA5',
    background: '#0f0f13',
    surface: 'rgba(255, 255, 255, 0.04)',
    text: '#e8e6f0',
  },
  colorMode: 'dark', // 'light' | 'dark' | 'system'
  typography: {
    fontSize: 'medium', // 'small' | 'medium' | 'large'
    fontFamily: 'Inter',
  },
  layout: {
    density: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
    cardStyle: 'glass', // 'glass' | 'elevated' | 'flat' | 'minimal'
    borderRadius: 'medium',
  },
  animations: 'full', // 'full' | 'reduced' | 'disabled'
  ambientBackground: 'none',
  accessibility: {
    highContrast: false,
    dyslexiaFont: false,
  },
};

/** Deep merges saved/incoming preferences onto default structure safely */
function mergePreferences(incoming = {}) {
  return {
    ...DEFAULT_PREFERENCES,
    ...incoming,
    typography: { ...DEFAULT_PREFERENCES.typography, ...(incoming.typography || {}) },
    layout: { ...DEFAULT_PREFERENCES.layout, ...(incoming.layout || {}) },
    accessibility: { ...DEFAULT_PREFERENCES.accessibility, ...(incoming.accessibility || {}) },
    customTheme: { ...DEFAULT_PREFERENCES.customTheme, ...(incoming.customTheme || {}) },
  };
}

export function ThemeProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('mm_preferences');
      return saved ? mergePreferences(JSON.parse(saved)) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // Sync with API when user logs in
  useEffect(() => {
    let isMounted = true;

    if (api.isLoggedIn && api.isLoggedIn()) {
      api
        .getMe()
        .then((user) => {
          if (isMounted && user?.preferences) {
            const merged = mergePreferences(user.preferences);
            setPreferences(merged);
            localStorage.setItem('mm_preferences', JSON.stringify(merged));
          }
        })
        .catch((err) => console.error('Failed to fetch preferences from server:', err));
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Apply CSS custom variables to root DOM node
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('mm_preferences', JSON.stringify(preferences));

    // 1. Resolve Active Theme
    const isCustom = preferences.theme === 'custom';
    const activeTheme = isCustom
      ? preferences.customTheme
      : BUILT_IN_THEMES[preferences.theme] || BUILT_IN_THEMES.midnight;

    // 2. High Contrast Mode Overrides
    const isHighContrast = preferences.accessibility?.highContrast;
    const bg = isHighContrast ? '#000000' : activeTheme.background;
    const text = isHighContrast ? '#FFFFFF' : activeTheme.text;
    const surface = isHighContrast ? '#111111' : activeTheme.surface;
    const primary = isHighContrast ? '#FFFF00' : activeTheme.primary;

    root.style.setProperty('--color-bg', bg);
    root.style.setProperty('--color-text', text);
    root.style.setProperty('--color-surface', surface);
    root.style.setProperty('--color-primary', primary);
    root.style.setProperty('--color-accent', activeTheme.accent || primary);

    // Derived text tones — computed from the theme's textMuted or synthesized
    const textMuted = isHighContrast
      ? 'rgba(255,255,255,0.7)'
      : (activeTheme.textMuted || (text + '99'));
    // Generate a faint version: use textMuted but more transparent
    const textFaint = isHighContrast
      ? 'rgba(255,255,255,0.45)'
      : (activeTheme.textMuted
          ? activeTheme.textMuted.replace(/[\d.]+\)$/, '0.35)')
          : (text + '55'));
    root.style.setProperty('--color-text-muted', textMuted);
    root.style.setProperty('--color-text-faint', textFaint);

    // Surface border — adapts for light vs dark themes
    const isLight = activeTheme.background && activeTheme.background.startsWith('#F');
    root.style.setProperty('--color-surface-border',
      isHighContrast ? '1px solid rgba(255,255,255,0.3)'
      : isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)');

    // 3. Typography
    const fontFamily = preferences.accessibility?.dyslexiaFont
      ? 'OpenDyslexic, sans-serif'
      : preferences.typography?.fontFamily || 'Inter';
    const fontSize = FONT_SIZES?.[preferences.typography?.fontSize] || FONT_SIZES?.medium || '1rem';

    root.style.setProperty('--font-family', fontFamily);
    root.style.setProperty('--font-size-base', fontSize);

    // 4. Layout
    const borderRadius = BORDER_RADII?.[preferences.layout?.borderRadius] || BORDER_RADII?.medium || '12px';
    const density = preferences.layout?.density || 'comfortable';
    const paddingBase = density === 'compact' ? '0.75rem' : density === 'spacious' ? '1.5rem' : '1rem';

    root.style.setProperty('--border-radius', borderRadius);
    root.style.setProperty('--padding-base', paddingBase);

    // 5. Card Style Configuration — borders adapt to light vs dark themes
    const cardStyle = preferences.layout?.cardStyle || 'glass';
    const borderBase = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.08)';
    const borderStrong = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.05)';
    const cardConfigs = {
      flat:     { backdrop: 'none', border: `1px solid ${borderStrong}`, shadow: 'none' },
      minimal:  { backdrop: 'none', border: `1px solid ${borderStrong}`, shadow: 'none' },
      elevated: { backdrop: 'none', border: 'transparent', shadow: '0 4px 24px rgba(0,0,0,0.15)' },
      glass:    { backdrop: 'blur(12px)', border: `1px solid ${borderBase}`, shadow: 'none' },
    };
    const currentCard = cardConfigs[cardStyle] || cardConfigs.glass;

    root.style.setProperty('--surface-backdrop', currentCard.backdrop);
    root.style.setProperty('--surface-border', currentCard.border);
    root.style.setProperty('--surface-shadow', currentCard.shadow);

    // 6. Animations
    const anim = preferences.animations || 'full';
    const animDuration = anim === 'disabled' ? '0s' : anim === 'reduced' ? '0.6s' : '0.35s';
    root.style.setProperty('--anim-duration', animDuration);
  }, [preferences]);

  // Update preferences state & persist to API
  const updatePreferences = useCallback(async (newPrefs) => {
    setPreferences((prev) => {
      const merged = mergePreferences({ ...prev, ...newPrefs });

      if (api.isLoggedIn && api.isLoggedIn()) {
        api.updatePreferences(merged).catch((e) => {
          console.error('Failed to persist preferences to server:', e);
        });
      }

      return merged;
    });
  }, []);

  // Update specific top-level or nested preference key
  const setPartialPreferences = useCallback((category, key, value) => {
    setPreferences((prev) => {
      let updated;
      if (key === null || key === undefined) {
        updated = { ...prev, [category]: value };
      } else {
        updated = {
          ...prev,
          [category]: {
            ...(prev[category] || {}),
            [key]: value,
          },
        };
      }
      
      const merged = mergePreferences(updated);

      if (api.isLoggedIn && api.isLoggedIn()) {
        api.updatePreferences(merged).catch((e) => {
          console.error('Failed to persist preferences to server:', e);
        });
      }

      return merged;
    });
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        preferences,
        updatePreferences,
        setPartialPreferences,
        DEFAULT_PREFERENCES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}