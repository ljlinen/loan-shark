/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0b0b1e',
          900: '#12122b',
          800: '#181832',
          700: '#22223f',
          600: '#2d2d4d'
        },
        brand: {
          50: '#f0f0ff',
          100: '#e3e3ff',
          400: '#8b8bf5',
          500: '#6c63ff',
          600: '#5747f0',
          700: '#4636d6'
        },
        pending: '#f5a623',
        partial: '#3b82f6',
        paid: '#22c55e',
        overdue: '#ef4444'
      },
      fontFamily: {
        display: ['"Sora"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 15, 35, 0.06), 0 1px 6px rgba(15, 15, 35, 0.05)',
        panel: '0 4px 24px rgba(15, 15, 35, 0.08)'
      },
      borderRadius: {
        xl2: '1.25rem'
      }
    }
  },
  plugins: []
}
