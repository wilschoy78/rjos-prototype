/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      boxShadow: {
        panel: '0 0 0 1px rgba(228, 228, 231, 0.85), 0 18px 40px rgba(24, 24, 27, 0.08)',
      },
      colors: {
        brand: {
          50: '#fff5f5',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa8a8',
          400: '#ff6b6b',
          500: '#f20505',
          600: '#d90404',
          700: '#b10303',
          800: '#8c0303',
          900: '#5f0202',
        },
        signal: {
          500: '#0f6a4b',
          600: '#0b5239',
        },
      },
    },
  },
  plugins: [],
};
