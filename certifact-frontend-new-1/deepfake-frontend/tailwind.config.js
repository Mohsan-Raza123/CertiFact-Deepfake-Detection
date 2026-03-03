/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-black': '#050505',    // Deep Bugatti Black
        'brand-dark': '#0a0a0a',     // Panel Grey
        'brand-blue': '#00AEEF',     // Electric Blue
        'brand-gray': '#888888',     // Muted Text
      },
      fontFamily: {
        'display': ['"Oswald"', 'sans-serif'],    // Headers
        'body': ['"Montserrat"', 'sans-serif'],   // Text
      },
      letterSpacing: {
        'luxury': '0.25em', // Wide spacing
      },
      animation: {
        'scan': 'scan 2s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { top: '0%', opacity: '0' },
          '10%, 90%': { opacity: '1' },
          '50%': { top: '100%' },
        }
      }
    },
  },
  plugins: [],
}