/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        kiss: {
          '0%': { transform: 'scale(0) rotate(-45deg)', opacity: 0 },
          '50%': { transform: 'scale(1.5) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'scale(0) rotate(45deg)', opacity: 0 },
        },
        float: {
          '0%': { transform: 'translateY(0px)', opacity: 0 },
          '50%': { transform: 'translateY(-20px)', opacity: 1 },
          '100%': { transform: 'translateY(-40px)', opacity: 0 },
        },
        'achievement-appear': {
          '0%': { transform: 'scale(0)', opacity: 0 },
          '50%': { transform: 'scale(1.2)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        rainbow: {
          '0%, 100%': { filter: 'hue-rotate(0deg)' },
          '50%': { filter: 'hue-rotate(360deg)' },
        },
        cosmic: {
          '0%': { transform: 'scale(1) rotate(0deg)', filter: 'hue-rotate(0deg)' },
          '50%': { transform: 'scale(1.1) rotate(180deg)', filter: 'hue-rotate(180deg)' },
          '100%': { transform: 'scale(1) rotate(360deg)', filter: 'hue-rotate(360deg)' },
        },
        universe: {
          '0%': { transform: 'scale(1) rotate(0deg)', filter: 'hue-rotate(0deg) brightness(1)' },
          '50%': { transform: 'scale(1.2) rotate(180deg)', filter: 'hue-rotate(180deg) brightness(1.5)' },
          '100%': { transform: 'scale(1) rotate(360deg)', filter: 'hue-rotate(360deg) brightness(1)' },
        },
        eternal: {
          '0%': { transform: 'scale(1) rotate(0deg)', filter: 'hue-rotate(0deg) brightness(1) contrast(1)' },
          '50%': { transform: 'scale(1.3) rotate(180deg)', filter: 'hue-rotate(180deg) brightness(2) contrast(1.5)' },
          '100%': { transform: 'scale(1) rotate(360deg)', filter: 'hue-rotate(360deg) brightness(1) contrast(1)' },
        },
      },
      animation: {
        'kiss': 'kiss 2s ease-in-out forwards',
        'float': 'float 2s ease-out forwards',
        'achievement-appear': 'achievement-appear 1s ease-out forwards',
        'rainbow': 'rainbow 3s linear infinite',
        'cosmic': 'cosmic 5s ease-in-out infinite',
        'universe': 'universe 8s ease-in-out infinite',
        'eternal': 'eternal 10s ease-in-out infinite',
      },
      boxShadow: {
        '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.5)',
        '4xl': '0 45px 80px -20px rgba(0, 0, 0, 0.6)',
        '5xl': '0 55px 100px -25px rgba(0, 0, 0, 0.7)',
      },
    },
  },
  plugins: [],
} 