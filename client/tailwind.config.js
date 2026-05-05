/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'clay-bg': '#f0f4f8',
        'clay-surface': '#e2e8f0',
        'clay-primary': '#60a5fa',
        'clay-red': '#f87171',
        'clay-green': '#4ade80',
        'clay-yellow': '#facc15',
        'clay-blue': '#3b82f6',
      },
      boxShadow: {
        'clay': 'inset 2px 2px 6px rgba(255, 255, 255, 0.7), inset -2px -2px 6px rgba(0, 0, 0, 0.15), 8px 16px 32px rgba(0, 0, 0, 0.2)',
        'clay-pressed': 'inset 4px 4px 8px rgba(0, 0, 0, 0.15), inset -4px -4px 8px rgba(255, 255, 255, 0.7)',
        'clay-token': 'inset 2px 2px 4px rgba(255, 255, 255, 0.8), inset -2px -2px 4px rgba(0, 0, 0, 0.3), 4px 4px 8px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        'clay': '24px',
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
