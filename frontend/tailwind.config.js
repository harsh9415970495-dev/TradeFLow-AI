/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        // Core Surfaces (DESIGN.md Midnight Dark)
        surface: {
          DEFAULT: '#10131a',
          dim: '#10131a',
          bright: '#363940',
          'container-lowest': '#0b0e14',
          'container-low': '#191c22',
          container: '#1e222b',
          'container-high': '#2a2e38',
          'container-highest': '#363940',
        },
        'on-surface': '#ffffff',
        'on-surface-variant': '#a1a7b3',
        outline: '#444b59',
        'outline-variant': '#2e333d',
        // Brand Colors
        primary: {
          DEFAULT: '#00d2ff',
          container: '#004d5f',
          'on-primary': '#003542',
          'on-container': '#bdeaff',
        },
        secondary: {
          DEFAULT: '#a582ff',
          container: '#4d2da6',
          'on-secondary': '#36108f',
          'on-container': '#e6deff',
        },
        tertiary: {
          DEFAULT: '#00f29b',
          container: '#005234',
          'on-tertiary': '#003822',
          'on-container': '#7effc3',
        },
        success: {
          DEFAULT: '#00f29b',
          'on-success': '#003822',
        },
        error: {
          DEFAULT: '#ffb4ab',
          'on-error': '#690005',
        },
        // Legacy (keep for backward compat)
        background: {
          DEFAULT: '#0b0e14',
          surface: '#10131a',
        },
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'aurora': 'aurora 12s ease-in-out infinite alternate',
        'spin-slow': 'spin 8s linear infinite',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'count-up': 'countUp 0.5s ease-out forwards',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', boxShadow: '0 0 12px 2px rgba(0,210,255,0.3)' },
          '50%': { opacity: '1', boxShadow: '0 0 24px 6px rgba(0,210,255,0.6)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        aurora: {
          '0%': { transform: 'translate(0%, 0%) scale(1)', opacity: '0.6' },
          '33%': { transform: 'translate(3%, -4%) scale(1.05)', opacity: '0.8' },
          '66%': { transform: 'translate(-2%, 3%) scale(0.97)', opacity: '0.5' },
          '100%': { transform: 'translate(1%, -2%) scale(1.03)', opacity: '0.7' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        countUp: {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.95)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      boxShadow: {
        'neon-primary': '0 0 20px rgba(0, 210, 255, 0.4)',
        'neon-secondary': '0 0 20px rgba(165, 130, 255, 0.4)',
        'neon-tertiary': '0 0 20px rgba(0, 242, 155, 0.4)',
        'neon-sm': '0 0 8px rgba(0, 210, 255, 0.3)',
        'card-hover': '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(0, 210, 255, 0.15)',
      },
    },
  },
  plugins: [],
}
