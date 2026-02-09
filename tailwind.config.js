/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        marker: ['"Permanent Marker"', 'cursive'],
        display: ['"Bebas Neue"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-pulse': 'scale-pulse 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'flip-reveal': 'flip-reveal 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { transform: 'translateX(-50%) translateY(-100px)', opacity: '0' },
          '100%': { transform: 'translateX(-50%) translateY(0)', opacity: '1' },
        },
        'scale-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-30px)' },
        },
        'flip-reveal': {
          '0%': { transform: 'rotateY(0deg)', opacity: '1' },
          '50%': { transform: 'rotateY(90deg)', opacity: '0.5' },
          '100%': { transform: 'rotateY(0deg)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
