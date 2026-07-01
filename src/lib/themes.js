// ─── Theme Definitions ──────────────────────────────────────────────────────
// Adding a new theme only requires a new entry in BUILT_IN_THEMES.
// ThemeContext reads these and injects them as CSS variables automatically.

export const BUILT_IN_THEMES = {
  midnight: {
    id: 'midnight',
    name: 'Midnight',
    icon: '🌙',
    description: 'Perfect for late-night journaling.',
    primary: '#7F77DD',
    accent: '#5DCAA5',
    background: '#0f0f13',
    surface: 'rgba(255, 255, 255, 0.04)',
    surfaceSolid: '#1a1825',
    text: '#e8e6f0',
    textMuted: 'rgba(232,230,240,0.5)',
    gradient: 'linear-gradient(135deg, #0f0f13 0%, #1a1225 100%)',
  },
  calm: {
    id: 'calm',
    name: 'Calm',
    icon: '🌊',
    description: 'Soft blues for a peaceful experience.',
    primary: '#4A90E2',
    accent: '#50E3C2',
    background: '#141E30',
    surface: 'rgba(255, 255, 255, 0.06)',
    surfaceSolid: '#1d2d47',
    text: '#E0E5EC',
    textMuted: 'rgba(224,229,236,0.5)',
    gradient: 'linear-gradient(135deg, #141E30 0%, #1a2c47 100%)',
  },
  cozy: {
    id: 'cozy',
    name: 'Cozy',
    icon: '☕',
    description: 'Warm earthy tones for comfort.',
    primary: '#E07A5F',
    accent: '#F4A261',
    background: '#2A2421',
    surface: 'rgba(255, 255, 255, 0.05)',
    surfaceSolid: '#3a3028',
    text: '#F2E8CF',
    textMuted: 'rgba(242,232,207,0.5)',
    gradient: 'linear-gradient(135deg, #2A2421 0%, #3a2f28 100%)',
  },
  nature: {
    id: 'nature',
    name: 'Nature',
    icon: '🌿',
    description: 'Inspired by forests and natural greens.',
    primary: '#5DCAA5',
    accent: '#A8D5BA',
    background: '#0B1F15',
    surface: 'rgba(255, 255, 255, 0.04)',
    surfaceSolid: '#142b1f',
    text: '#D8F3E5',
    textMuted: 'rgba(216,243,229,0.5)',
    gradient: 'linear-gradient(135deg, #0B1F15 0%, #122a1d 100%)',
  },
  sunrise: {
    id: 'sunrise',
    name: 'Sunrise',
    icon: '🌅',
    description: 'Bright and energetic, great for mornings.',
    primary: '#F4A261',
    accent: '#E9C46A',
    background: '#2B1A10',
    surface: 'rgba(255, 255, 255, 0.05)',
    surfaceSolid: '#3d2415',
    text: '#FDF0D5',
    textMuted: 'rgba(253,240,213,0.5)',
    gradient: 'linear-gradient(135deg, #2B1A10 0%, #3d2415 100%)',
  },
  lavender: {
    id: 'lavender',
    name: 'Lavender',
    icon: '🪻',
    description: 'Elegant purple pastel palette.',
    primary: '#9B5DE5',
    accent: '#F15BB5',
    background: '#1A0B2E',
    surface: 'rgba(255, 255, 255, 0.05)',
    surfaceSolid: '#261040',
    text: '#EADCF8',
    textMuted: 'rgba(234,220,248,0.5)',
    gradient: 'linear-gradient(135deg, #1A0B2E 0%, #261040 100%)',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    icon: '💼',
    description: 'Minimal and distraction-free.',
    primary: '#3A3A3C',
    accent: '#007AFF',
    background: '#F5F5F7',
    surface: 'rgba(0, 0, 0, 0.04)',
    surfaceSolid: '#EBEBED',
    text: '#1D1D1F',
    textMuted: 'rgba(29,29,31,0.5)',
    gradient: 'linear-gradient(135deg, #F5F5F7 0%, #EBEBED 100%)',
  },
};

// ─── Typography ──────────────────────────────────────────────────────────────
export const FONT_FAMILIES = [
  { id: 'Inter', name: 'Inter', sample: 'Aa' },
  { id: 'Poppins', name: 'Poppins', sample: 'Aa' },
  { id: 'Nunito', name: 'Nunito', sample: 'Aa' },
  { id: 'Roboto', name: 'Roboto', sample: 'Aa' },
];

export const FONT_SIZES = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

// ─── Layout ───────────────────────────────────────────────────────────────────
export const BORDER_RADII = {
  small: '0.375rem',
  medium: '0.75rem',
  large: '1.25rem',
};

// ─── Accent Color Presets ─────────────────────────────────────────────────────
export const ACCENT_PRESETS = [
  { id: 'purple', label: 'Purple', color: '#7F77DD' },
  { id: 'blue',   label: 'Blue',   color: '#4A90E2' },
  { id: 'teal',   label: 'Teal',   color: '#5DCAA5' },
  { id: 'orange', label: 'Orange', color: '#F4A261' },
  { id: 'pink',   label: 'Pink',   color: '#F15BB5' },
  { id: 'red',    label: 'Red',    color: '#E07A5F' },
];
