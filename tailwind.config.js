/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow:     '#F5A623',
          'yellow-d': '#D4891A',
          teal:       '#1A9CB0',
          'teal-d':   '#0D7A9A',
          'teal-l':   '#29B6D2',
          dark:       '#0A3D4D',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #29B6D2 0%, #0D7A9A 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
