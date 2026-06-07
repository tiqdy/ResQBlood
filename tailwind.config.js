/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff1f1',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa1a1',
          400: '#ff6b6b',
          500: '#f83b3b',
          600: '#e51d1d',
          700: '#c01212',
          800: '#9f1313',
          900: '#821616',
          950: '#470707',
        },
        primary: {
          DEFAULT: '#e51d1d',
          50: '#fff1f1',
          100: '#ffe3e3',
          200: '#ffc9c9',
          300: '#ffa1a1',
          400: '#ff6b6b',
          500: '#f83b3b',
          600: '#e51d1d',
          700: '#c01212',
          800: '#9f1313',
          900: '#821616',
          950: '#470707',
        },
        secondary: {
          DEFAULT: '#fff1f1',
          50: '#fff9f9',
          100: '#fff1f1',
          200: '#ffe3e3',
          300: '#ffc9c9',
          400: '#ffa1a1',
          500: '#ff6b6b',
          600: '#e51d1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
