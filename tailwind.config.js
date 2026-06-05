/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#061828', 900: '#061018', 800: '#0A2A48', 700: '#0F1E2E', 600: '#13314F' },
        orange:  { DEFAULT: '#E8671A', 600: '#D45A14', 500: '#E8671A', 400: '#FF7A2E', 300: '#FFA060', 100: '#FDF5EF' },
        purple:  { DEFAULT: '#9B6DFF', 600: '#7C3AED', 500: '#9B6DFF', 100: '#F5F3FF' },
        green:   { DEFAULT: '#00D68F', 600: '#059669', 500: '#00D68F', 100: '#D1FAE5' },
        red:     { DEFAULT: '#FF4D6D', 600: '#DC2626', 500: '#FF4D6D', 100: '#FEE2E2' },
        blue:    { DEFAULT: '#4D9FFF', 600: '#2563EB', 500: '#4D9FFF', 100: '#DBEAFE' },
        gold:    { DEFAULT: '#F59E0B', 600: '#D97706', 100: '#FEF3C7' },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: { xs: '2px' },
      animation: {
        'fade-in':  'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-orange': 'pulseOrange 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        pulseOrange: { '0%, 100%': { boxShadow: '0 0 0 0 rgba(232,103,26,.4)' }, '50%': { boxShadow: '0 0 0 8px rgba(232,103,26,0)' } },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
