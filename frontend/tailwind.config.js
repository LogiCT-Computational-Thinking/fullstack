/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(-2deg)' },
          '50%': { transform: 'translateY(-30px) rotate(1deg)' },
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
