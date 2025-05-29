/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'notion-black': '#191919',
        'notion-gray': '#f7f6f3',
        'notion-light-gray': '#eae8e3',
        'notion-blue': '#0b76ef',
        'notion-purple': '#6940a5',
        'notion-red': '#e03e3e',
        'notion-yellow': '#dfab01',
        'notion-green': '#0b7544',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'notion': '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        'notion-hover': '0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)',
      },
    },
  },
  plugins: [],
}
