/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coquette: {
          pinkLight: '#f9cbd6',
          pink: '#f4b6c6',
          pinkDeep: '#d84b75',
          roseDark: '#70102b',
          cream: '#fdfbf7',
          creamDark: '#f5ede8',
          paper: '#fffdf9',
        },
      },
      fontFamily: {
        script: ['Pinyon Script', 'cursive'],
        alex: ['Alex Brush', 'cursive'],
        serifTitle: ['Playfair Display', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
