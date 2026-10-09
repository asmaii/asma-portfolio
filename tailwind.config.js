/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: { ink: '#17191f', electric: '#334a70', rose: '#c99598', ivory: '#f1efeb' },
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Playfair Display', 'serif'], mono: ['DM Mono', 'monospace'] },
      boxShadow: { premium: '0 24px 70px rgba(24,28,38,.10)' }
    }
  },
  plugins: []
};
