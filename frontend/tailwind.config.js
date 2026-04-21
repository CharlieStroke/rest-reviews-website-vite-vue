/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
      },
      colors: {
        anahuac: {
          orange: '#ff9153',
        },
        "primary-fixed": "#ff7a23",
        "on-primary-container": "#3f1700",
        "primary-fixed-dim": "#f06c0b",
        "on-tertiary": "#5b2c00",
        "tertiary-container": "#fd933d",
        "tertiary-fixed": "#ff9742",
        "on-secondary-fixed-variant": "#5c5b5e",
        "on-secondary": "#525155",
        "surface": {
          DEFAULT: '#0e0e10',
          "tint": "#ff9153",
          "dim": "#0e0e10",
          "bright": "#2c2c2f",
          "variant": "#262528",
          'container-lowest': '#000000',
          'container-low': '#131315',
          'container': '#19191c',
          'container-high': '#1f1f22',
          'container-highest': '#262528',
        },
        "on-tertiary-fixed-variant": "#5d2c00",
        "error-container": "#b92902",
        "inverse-on-surface": "#565457",
        "inverse-surface": "#fcf8fb",
        "on-primary": "#511f00",
        "tertiary-fixed-dim": "#f08934",
        "on-error-container": "#ffd2c8",
        "outline": {
          DEFAULT: "#767577",
          variant: "#48474a"
        },
        "on": {
          "background": "#f9f5f8",
          "surface": "#f9f5f8",
          "surface-variant": "#adaaad",
        },
        "on-background": "#f9f5f8",
        "on-surface": "#f9f5f8",
        "on-surface-variant": "#adaaad",
        "on-tertiary-container": "#4c2300",
        "secondary-dim": "#d6d3d7",
        "on-secondary-container": "#d2cfd3",
        "on-secondary-fixed": "#3f3f42",
        "secondary-fixed": "#e4e1e5",
        "on-tertiary-fixed": "#2b1100",
        "error": "#ff7351",
        "secondary-fixed-dim": "#d6d3d7",
        "outline-variant": "#48474a",
        "inverse-primary": "#9e4400",
        "on-error": "#450900",
        "error-dim": "#d53d18",
        "tertiary": "#ffa765",
        "secondary": "#e4e1e5",
        "primary-dim": "#fd761a",
        "tertiary-dim": "#ec8731",
        "primary": {
          DEFAULT: "#ff9153",
          container: "#ff7a23"
        },
        "on-primary-fixed": "#000000",
        "secondary-container": "#47464a",
        "background": "#0e0e10",
        "on-primary-fixed-variant": "#4e1e00",
      },
      boxShadow: {
        'ambient': '0 20px 40px rgba(0, 0, 0, 0.4)',
        'btn-primary': '0 10px 20px rgba(255, 145, 83, 0.2)',
      },
      backdropBlur: {
        'glass': '30px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
