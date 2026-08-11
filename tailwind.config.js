/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Sonic dark-first palette
        ink: {
          950: '#0a0a0b',
          900: '#101013',
          850: '#16161a',
          800: '#1c1c21',
          750: '#232329',
          700: '#2a2a31',
          600: '#3a3a43',
          500: '#4a4a55',
          400: '#6a6a76',
          300: '#8a8a96',
          200: '#aaaab4',
          100: '#c8c8d0',
        },
        // Sonic accent — a warm amber/gold, distinctive and premium
        sonic: {
          50: '#fff8eb',
          100: '#feeac7',
          200: '#fdd28a',
          300: '#fcb84d',
          400: '#fb9e24',
          500: '#f5820d',
          600: '#d96408',
          700: '#b24a0a',
          800: '#8f3c10',
          900: '#763311',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'eq-bar': 'eqBar 0.8s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        eqBar: {
          '0%': { height: '20%' },
          '100%': { height: '100%' },
        },
      },
    },
  },
  plugins: [],
};
