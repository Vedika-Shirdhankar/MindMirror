/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
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
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
