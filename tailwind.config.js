/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B35",
        warmWhite: "#FDFAF6",
      },
      borderRadius: {
        '16': '16px',
        '32': '32px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.06)',
      },
      maxWidth: {
        'mobile': '480px',
      }
    },
  },
  plugins: [],
}
