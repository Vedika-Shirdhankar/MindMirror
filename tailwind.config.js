/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        text: 'var(--color-text)',
        
        // Keep original colors for backwards compatibility during refactor
        purple: {
          50: '#EEEDFE', 100: '#CECBF6', 200: '#AFA9EC',
          400: '#7F77DD', 600: '#534AB7', 800: '#3C3489', 900: '#26215C'
        },
        teal: {
          50: '#E1F5EE', 100: '#9FE1CB', 200: '#5DCAA5',
          400: '#1D9E75', 600: '#0F6E56', 800: '#085041', 900: '#04342C'
        },
        coral: {
          50: '#FAECE7', 100: '#F5C4B3', 200: '#F0997B',
          400: '#D85A30', 600: '#993C1D', 800: '#712B13', 900: '#4A1B0C'
        },

        // ── Journal Studio tokens ──────────────────────────────────────
        ink:       { DEFAULT: '#3A3040', soft: '#5E5466', mute: '#9E97A8' },
        cream:     '#FBF5E9',
        blush: {
          50: '#FEF0F1', 100: '#FDEDEE', 200: '#F8CDD0',
          300: '#F0A8AD', 400: '#DD8590', 500: '#C4616B',
        },
        lav: {
          50: '#F7F4FD', 100: '#F1ECFA', 200: '#E2D9F5',
          300: '#C8B9EC', 400: '#9C8BCF', 500: '#6B4E97',
        },
        sage: {
          50: '#EBF1E4', 100: '#D3E3C4', 200: '#C8D8BC',
          300: '#93B87A', 600: '#4A7040',
        },
      },
      fontFamily: {
        sans:  ['var(--font-family)', 'Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        standard: 'var(--border-radius)',
      },
      animationDuration: {
        standard: 'var(--anim-duration)',
      },
      boxShadow: {
        soft:  '0 2px 12px rgba(120,90,110,.10)',
        paper: '0 4px 24px rgba(120,90,110,.18)',
      },
      keyframes: {
        pop: { '0%': { opacity: 0, transform: 'scale(.88)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        pop: 'pop .22s cubic-bezier(.2,1.3,.4,1) both',
      },
    },
  },
  plugins: [],
}
