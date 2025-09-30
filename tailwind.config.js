/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Custom colors for diff visualization
        diff: {
          added: '#22c55e',
          removed: '#ef4444',
          modified: '#f59e0b',
          'added-bg': '#dcfce7',
          'removed-bg': '#fee2e2',
          'modified-bg': '#fef3c7',
          'added-dark-bg': '#14532d',
          'removed-dark-bg': '#7f1d1d',
          'modified-dark-bg': '#78350f',
        },
      },
      fontFamily: {
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Menlo',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};
