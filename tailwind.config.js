/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy:   { DEFAULT: '#061828', 2: '#0A2238', 3: '#0F2D47' },
        orange: { DEFAULT: '#E8671A', 2: '#FF8A3D' },
        green:  { DEFAULT: '#00D68F' },
        red:    { DEFAULT: '#FF4D6D' },
        gold:   { DEFAULT: '#F5A623' },
        purple: { DEFAULT: '#9B6DFF' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
