/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mali', 'ui-rounded', 'system-ui', 'sans-serif'],
      },
      colors: {
        milk: '#FFFDF8',
        berry: '#FF7EA8',
        mint: '#7FD9C4',
        sky: '#8FC6F5',
        ink: '#4A3B52',
      },
      boxShadow: {
        puff: '0 18px 40px -16px rgba(74, 59, 82, 0.35)',
      },
    },
  },
  plugins: [],
};
