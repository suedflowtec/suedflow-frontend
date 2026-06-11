/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy:    { DEFAULT: '#0A1F35', 50: '#EBF0F6', 100: '#C2D2E3', 200: '#94B3CC', 600: '#081929', 700: '#060F1A' },
        orange:  { DEFAULT: '#E8671A', 50: '#FEF0E7', 100: '#FBCFA6', 200: '#F7A96A', 600: '#C9570F', 700: '#A84508' },
        teal:    { DEFAULT: '#148F77', 50: '#E8F6F3', 100: '#B3E5DC', 600: '#0E7060' },
        gold:    { DEFAULT: '#D97706', 50: '#FEFCE8', 100: '#FDE68A' },
        surface: { DEFAULT: '#F7F8FA', card: '#FFFFFF', border: '#E2E6ED', hover: '#F0F2F5' },
        ink:     { primary: '#0A1F35', secondary: '#4A5568', muted: '#8A96A8', light: '#B0BAC9' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.05em' }],
      },
      boxShadow: {
        card: '0 1px 3px rgba(10,31,53,0.08), 0 1px 2px rgba(10,31,53,0.04)',
        'card-hover': '0 4px 12px rgba(10,31,53,0.12), 0 2px 4px rgba(10,31,53,0.06)',
        sidebar: '1px 0 0 #E2E6ED',
      },
      borderRadius: {
        DEFAULT: '6px',
      },
    },
  },
  plugins: [],
}
