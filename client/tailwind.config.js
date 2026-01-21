/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF385C',
        'primary-hover': '#E31C5F',
        secondary: '#222222',
        muted: '#717171',
        border: '#DDDDDD',
        surface: '#F7F7F7',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'card': '0 2px 16px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 4px 24px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
}
