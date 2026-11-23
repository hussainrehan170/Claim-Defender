/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAF8F5', surface: '#FFFFFF', line: '#ECE8E1', ink: '#14161A', ink2: '#6B6F76', soft: '#F3F0EA',
        em: { DEFAULT: '#0F766E', dark: '#0B5C56', tint: '#E6F4F1' },
        amber: { DEFAULT: '#D97706', tint: '#FEF3E2', ink: '#9A5205' },
        red: { DEFAULT: '#DC2626', tint: '#FDECEC', ink: '#B11F1F' },
        green: { DEFAULT: '#16A34A', tint: '#E8F6EC', ink: '#11793A' },
      },
      fontFamily: {
        sans: ['Inter', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', '"Noto Sans Devanagari"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,22,26,.04), 0 2px 8px rgba(20,22,26,.04)',
        lift: '0 2px 4px rgba(20,22,26,.05), 0 12px 28px rgba(20,22,26,.08)',
      },
      borderRadius: { card: '20px' },
    },
  },
  plugins: [],
}
