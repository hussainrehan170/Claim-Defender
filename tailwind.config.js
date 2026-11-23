/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F8F7F4', card: '#FFFFFF', ink: '#111827', ink2: '#4B5563', line: '#E5E3DD',
        trust: { DEFAULT: '#1E3A8A', dark: '#172E6E', soft: '#E8EDF7' },
        ok: { DEFAULT: '#15803D', soft: '#E7F4EC' },
        warn: { DEFAULT: '#B45309', soft: '#FDF1E3' },
        bad: { DEFAULT: '#B91C1C', soft: '#FBE9E9' },
      },
      fontFamily: { sans: ['"Noto Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgba(17,24,39,.06), 0 4px 14px rgba(17,24,39,.06)' },
      borderRadius: { card: '16px' },
    },
  },
  plugins: [],
}
