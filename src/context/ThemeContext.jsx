import React, { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../lib/api';
import { BUILT_IN_THEMES, FONT_FAMILIES, FONT_SIZES, BORDER_RADII } from '../lib/themes';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

const DEFAULT_PREFERENCES = {
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
    fontFamily: 'Inter'
  },
  layout: {
    density: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
    cardStyle: 'glass', // 'glass' | 'elevated' | 'flat' | 'minimal'
    borderRadius: 'medium'
  },
  animations: 'full', // 'full' | 'reduced' | 'disabled'
  ambientBackground: 'none',
  accessibility: {
    highContrast: false,
    dyslexiaFont: false
  }
};

export function ThemeProvider({ children }) {
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('mm_preferences');
      if (!saved) return DEFAULT_PREFERENCES;
      const parsed = JSON.parse(saved);
      // Deep-merge so nested objects like typography/layout/accessibility stay intact
      return {
        ...DEFAULT_PREFERENCES,
        ...parsed,
        typography: { ...DEFAULT_PREFERENCES.typography, ...parsed.typography },
        layout: { ...DEFAULT_PREFERENCES.layout, ...parsed.layout },
        accessibility: { ...DEFAULT_PREFERENCES.accessibility, ...parsed.accessibility },
        customTheme: { ...DEFAULT_PREFERENCES.customTheme, ...parsed.customTheme },
      };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // Sync with API when user logs in
  useEffect(() => {
    if (api.isLoggedIn()) {
      api.getMe().then(user => {
        if (user && user.preferences) {
          const p = user.preferences;
          const merged = {
            ...DEFAULT_PREFERENCES,
            ...p,
            typography: { ...DEFAULT_PREFERENCES.typography, ...p.typography },
            layout: { ...DEFAULT_PREFERENCES.layout, ...p.layout },
            accessibility: { ...DEFAULT_PREFERENCES.accessibility, ...p.accessibility },
            customTheme: { ...DEFAULT_PREFERENCES.customTheme, ...p.customTheme },
          };
          setPreferences(merged);
          localStorage.setItem('mm_preferences', JSON.stringify(merged));
        }
      }).catch(err => console.error("Failed to fetch preferences:", err));
    }
  }, []);

  // Apply preferences to DOM whenever they change
  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem('mm_preferences', JSON.stringify(preferences));

    // 1. Theme Colors
    const isCustom = preferences.theme === 'custom';
    const activeTheme = isCustom
      ? preferences.customTheme
      : (BUILT_IN_THEMES[preferences.theme] || BUILT_IN_THEMES['midnight']);

    root.style.setProperty('--color-bg', activeTheme.background);
    root.style.setProperty('--color-primary', activeTheme.primary);
    root.style.setProperty('--color-accent', activeTheme.accent);
    root.style.setProperty('--color-surface', activeTheme.surface);
    root.style.setProperty('--color-text', activeTheme.text);

    // 2. High Contrast overrides
    if (preferences.accessibility?.highContrast) {
      root.style.setProperty('--color-bg', '#000000');
      root.style.setProperty('--color-text', '#FFFFFF');
      root.style.setProperty('--color-surface', '#111111');
      root.style.setProperty('--color-primary', '#FFFF00');
    }

    // 3. Typography
    const fontFamily = preferences.accessibility?.dyslexiaFont
      ? 'OpenDyslexic, sans-serif'
      : (preferences.typography?.fontFamily || 'Inter');
    root.style.setProperty('--font-family', fontFamily);
    root.style.setProperty('--font-size-base', FONT_SIZES[preferences.typography?.fontSize] || FONT_SIZES['medium']);

    // 4. Layout - border radius & density
    root.style.setProperty('--border-radius', BORDER_RADII[preferences.layout?.borderRadius] || BORDER_RADII['medium']);
    const density = preferences.layout?.density || 'comfortable';
    root.style.setProperty('--padding-base', density === 'compact' ? '0.75rem' : density === 'spacious' ? '1.5rem' : '1rem');

    // 5. Card Style
    const cardStyle = preferences.layout?.cardStyle || 'glass';
    if (cardStyle === 'flat' || cardStyle === 'minimal') {
      root.style.setProperty('--surface-backdrop', 'none');
      root.style.setProperty('--surface-border', '1px solid rgba(255,255,255,0.05)');
      root.style.setProperty('--surface-shadow', 'none');
    } else if (cardStyle === 'elevated') {
      root.style.setProperty('--surface-backdrop', 'none');
      root.style.setProperty('--surface-border', 'transparent');
      root.style.setProperty('--surface-shadow', '0 4px 24px rgba(0,0,0,0.25)');
    } else {
      // Glass (default)
      root.style.setProperty('--surface-backdrop', 'blur(12px)');
      root.style.setProperty('--surface-border', '1px solid rgba(255, 255, 255, 0.08)');
      root.style.setProperty('--surface-shadow', 'none');
    }

    // 6. Animations
    const anim = preferences.animations || 'full';
    root.style.setProperty('--anim-duration', anim === 'disabled' ? '0s' : anim === 'reduced' ? '0.6s' : '0.35s');

  }, [preferences]);

  // updatePreferences: accepts a full preferences object
  const updatePreferences = async (newPrefs) => {
    const merged = {
      ...preferences,
      ...newPrefs,
      // Always deep-merge nested objects
      typography: { ...preferences.typography, ...newPrefs.typography },
      layout: { ...preferences.layout, ...newPrefs.layout },
      accessibility: { ...preferences.accessibility, ...newPrefs.accessibility },
      customTheme: { ...preferences.customTheme, ...newPrefs.customTheme },
    };
    setPreferences(merged);

    if (api.isLoggedIn()) {
      try {
        await api.updatePreferences(merged);
      } catch (e) {
        console.error("Failed to save preferences:", e);
      }
    }
  };

  /**
   * setPartialPreferences(category, key, value)
   *
   * Two calling modes:
   * 1. Top-level field:   setPartialPreferences('theme', null, 'midnight')
   *    → sets preferences.theme = 'midnight'
   * 2. Nested field:      setPartialPreferences('typography', 'fontFamily', 'Poppins')
   *    → sets preferences.typography.fontFamily = 'Poppins'
   */
  const setPartialPreferences = (category, key, value) => {
    let updated;
    if (key === null || key === undefined) {
      // Top-level field (theme, animations, colorMode, ambientBackground)
      updated = { ...preferences, [category]: value };
    } else {
      // Nested field (typography.fontFamily, layout.density, etc.)
      updated = {
        ...preferences,
        [category]: {
          ...(preferences[category] || {}),
          [key]: value,
        },
      };
    }
    updatePreferences(updated);
  };

  return (
    <ThemeContext.Provider value={{ preferences, updatePreferences, setPartialPreferences, DEFAULT_PREFERENCES }}>
      {children}
    </ThemeContext.Provider>
  );
}
