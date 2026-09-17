/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F6F7FA',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#101A33',
          soft: '#4B5670',
          faint: '#8791A8',
        },
        line: '#E2E5EE',
        navy: {
          50: '#EEF2FB',
          100: '#D7E0F5',
          300: '#93A9DC',
          500: '#3E5C9A',
          700: '#1D3163',
          900: '#0E1B3D',
        },
        brand: {
          sky: '#8FB8F2',
          blue: '#3E6FD9',
          deep: '#16244C',
        },
        signal: {
          red: '#C84B4B',
          redSoft: '#F6E4E2',
          amber: '#C68A2E',
          amberSoft: '#F5ECDB',
          green: '#3D8361',
          greenSoft: '#E2EFE7',
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
        card: '0 1px 2px rgba(16, 26, 51, 0.04), 0 8px 24px -12px rgba(16, 26, 51, 0.12)',
        lift: '0 4px 8px rgba(16, 26, 51, 0.06), 0 16px 32px -16px rgba(16, 26, 51, 0.18)',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgba(16,26,51,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,26,51,0.035) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};