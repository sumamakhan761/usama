/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FCFCF9',
          100: '#F7F8F4',
          200: '#EFF1E9',
          300: '#E2E6DA',
        },
        sage: {
          50: '#F3F8F5',
          100: '#E4F0E9',
          200: '#C7E1D2',
          300: '#9DC8AF',
          500: '#2D6A4F',
          600: '#245942',
          700: '#1B4332',
          800: '#143427',
        },
        slateText: {
          900: '#141D19',
          700: '#25352E',
          500: '#4D6257',
          400: '#758C81',
          300: '#A4B8AE',
        },
        calmAmber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#D97706',
          700: '#B45309',
        }
      },
    },
  },
  plugins: [],
};
