/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F7F5F0',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#201F1B',
          soft: '#57534A',
          faint: '#96907F',
        },
        line: '#E6E2D6',
        navy: {
          50: '#F0F3EE',
          100: '#DFE8DC',
          300: '#A2C1A9',
          500: '#3E7C59',
          700: '#275740',
          900: '#153626',
        },
        brand: {
          sky: '#EFC78C',
          blue: '#B4541A',
          deep: '#1F3A2C',
        },
        signal: {
          red: '#BE4B3B',
          redSoft: '#F5E4E0',
          amber: '#B97E26',
          amberSoft: '#F4EAD4',
          green: '#4A7D5F',
          greenSoft: '#E3EEE6',
        },
      },
      fontFamily: {
        display: [
          'Iowan Old Style', 'Palatino Linotype', 'URW Palladio L',
          'P052', 'serif',
        ],
        sans: [
          '-apple-system', 'Segoe UI', 'system-ui', 'Helvetica Neue', 'Arial', 'sans-serif',
        ],
        mono: [
          'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(32, 31, 27, 0.04), 0 8px 24px -12px rgba(32, 31, 27, 0.12)',
        lift: '0 4px 8px rgba(32, 31, 27, 0.06), 0 16px 32px -16px rgba(32, 31, 27, 0.18)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(32,31,27,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(32,31,27,0.035) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
