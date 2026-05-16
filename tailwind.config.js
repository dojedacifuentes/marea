/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        marea: {
          cream: '#FDF8F0',
          petal: '#FEF0F6',
          blush: '#FCE7F3',
          rose: '#F9A8D4',
          pinkdeep: '#F472B6',
          ocean: '#0C4A6E',
          deep: '#083655',
          mid: '#0369A1',
          sky: '#BAE6FD',
          lavender: '#EDE9FE',
          lilac: '#C4B5FD',
          coral: '#FECACA',
          peach: '#FED7AA',
          gold: '#FEF08A',
          sage: '#D1FAE5',
          mist: '#F1F5F9',
        },
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #0C4A6E 0%, #075985 30%, #0369A1 60%, #BAE6FD 100%)',
        'petal-gradient': 'linear-gradient(135deg, #FDF8F0 0%, #FEF0F6 50%, #FCE7F3 100%)',
        'dawn-gradient': 'linear-gradient(135deg, #FCE7F3 0%, #EDE9FE 50%, #BAE6FD 100%)',
        'cozy-gradient': 'linear-gradient(135deg, #FDF8F0 0%, #FCE7F3 40%, #EDE9FE 100%)',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(12, 74, 110, 0.08), 0 2px 8px rgba(12, 74, 110, 0.04)',
        'glass-hover': '0 16px 48px rgba(12, 74, 110, 0.12), 0 4px 16px rgba(12, 74, 110, 0.06)',
        'petal': '0 8px 32px rgba(249, 168, 212, 0.2), 0 2px 8px rgba(249, 168, 212, 0.1)',
        'soft': '0 4px 24px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'wave': 'wave 8s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'rain': 'rain 1.5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(3deg)' },
        },
        wave: {
          '0%, 100%': { transform: 'scaleX(1) scaleY(1)' },
          '50%': { transform: 'scaleX(1.05) scaleY(0.95)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        rain: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
