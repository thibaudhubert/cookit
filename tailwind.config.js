/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic color palette
        app: {
          DEFAULT: '#F9FAFB', // bg-app - main background
        },
        surface: {
          DEFAULT: '#FFFFFF', // bg-surface - cards, panels
          hover: '#F3F4F6',
        },
        text: {
          primary: '#111827', // Main text
          secondary: '#4B5563', // Secondary text
          muted: '#9CA3AF', // Muted/placeholder text
        },
        border: {
          DEFAULT: '#E5E7EB', // Default borders
          light: '#F3F4F6',
        },
        accent: {
          DEFAULT: '#2563EB', // Primary brand color
          hover: '#1D4ED8',
          light: '#DBEAFE',
        },
      },
    },
  },
  plugins: [],
}
