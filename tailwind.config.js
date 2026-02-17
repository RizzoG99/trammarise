/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary': 'var(--color-bg-tertiary)',
        'bg-glass': 'var(--color-bg-glass)',
        'bg-surface': 'var(--color-bg-surface)',
        'bg-surface-hover': 'var(--color-bg-surface-hover)',
        'border': 'var(--color-border)',
        'border-glass': 'var(--color-border-glass)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'primary': 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        'primary-hover': 'var(--color-primary-hover)',
        'accent-success': 'var(--color-accent-success)',
        'accent-error': 'var(--color-accent-error)',
        'accent-warning': 'var(--color-accent-warning)',
      },
      borderRadius: {
        'lg': 'var(--radius-lg)',
        'md': 'var(--radius-md)',
      },
    },
  },
  plugins: [],
}
