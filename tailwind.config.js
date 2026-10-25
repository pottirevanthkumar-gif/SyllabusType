/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f5f7fb',
          100: '#e8ecf5',
          200: '#cdd5e6',
          300: '#a8b4d4',
          400: '#7c89b3',
          500: '#586598',
          600: '#3f4d80',
          700: '#2e3a66',
          800: '#1f2a4d',
          900: '#131a36',
          950: '#0b1024',
        },
        teal: {
          50: '#effcf9',
          100: '#c8f5ec',
          200: '#92ebda',
          300: '#56d9c4',
          400: '#26bea9',
          500: '#10a08f',
          600: '#0a7f73',
          700: '#0a655d',
          800: '#0c514b',
          900: '#0e4340',
        },
        cream: '#f7f6f1',
      },
      boxShadow: {
        soft: '0 4px 20px -8px rgba(19, 26, 54, 0.12)',
        card: '0 2px 12px -4px rgba(19, 26, 54, 0.08), 0 1px 3px -1px rgba(19, 26, 54, 0.06)',
        lift: '0 12px 40px -12px rgba(19, 26, 54, 0.25)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '60%': { opacity: '1', transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'caret-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out both',
        'pop-in': 'pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'caret-blink': 'caret-blink 1.1s ease-in-out infinite',
        'shake': 'shake 0.25s ease-in-out',
      },
    },
  },
  plugins: [],
};
