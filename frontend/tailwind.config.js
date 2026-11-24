/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plum: {
          600: '#8e1b54',
          700: '#7e1d52',
          800: '#701a45',
          900: '#581537',
        },
        pill: {
          DEFAULT: '#f3f4f6',
          hover: '#e5e7eb',
          active: '#111827',
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'clean': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 4px 12px 0 rgba(0, 0, 0, 0.03)',
      }
    },
  },
  plugins: [],
}
