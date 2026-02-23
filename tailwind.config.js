/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./index.tsx",
    "./App.tsx",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      colors: {
        "dark-olive": "#3E442B",
        "dark-charcoal": "#1C1C1C",
        "light-tan": "#E4E0D4",
        "gradient-blue": "#2c5282",
        gold: {
          400: "#F6E05E",
          500: "#ECC94B",
          600: "#D69E2E",
        },
      },
    },
  },
  plugins: [],
}
