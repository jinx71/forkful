/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        tomato: {
          50:  '#fff4f2',
          100: '#ffe4e0',
          200: '#ffc6bd',
          300: '#ff9e8d',
          400: '#ff7361',
          500: '#ef4d3c', // primary
          600: '#d23a2a',
          700: '#a82c20',
          800: '#7d2218',
          900: '#5a1811',
        },
        ink: {
          50:  '#f7f7f8',
          100: '#eeeef0',
          200: '#d8d8dc',
          300: '#b2b3b9',
          400: '#7d7f87',
          500: '#5b5d65',
          600: '#404249',
          700: '#2d2e34',
          800: '#1d1e22',
          900: '#101114',
        },
      },
      boxShadow: {
        soft: '0 4px 16px -2px rgba(0,0,0,0.06), 0 2px 4px -1px rgba(0,0,0,0.04)',
        lift: '0 12px 32px -8px rgba(239,77,60,0.25)',
      },
      keyframes: {
        fadein: { '0%': { opacity: 0, transform: 'translateY(4px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        fadein: 'fadein 220ms ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
};
