/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        civic: {
          dark: '#233B53',
          navy: '#233B53',
          blue: '#315F80',
          mutedBlue: '#547D99',
          bg: '#F4F6F8',
          card: '#FFFFFF',
          text: '#263442',
          mutedText: '#697786',
          border: '#DCE2E8',
          critical: '#B42318',
          high: '#C76B19',
          medium: '#B58A26',
          low: '#39734D',
          resolved: '#39734D',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

