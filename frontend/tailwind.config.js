/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B8860B', // Dark golden amber - Nam An brand color
        secondary: '#1a1f3a', // Dark navy blue
        gold: '#D4AF37', // Brighter gold accent
        navy: '#0a0e1a', // Deep navy black
      }
    },
  },
  plugins: [],
}
