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
        // Apple-inspired semantic color palette
        app: {
          DEFAULT: '#F5F5F7', // Subtle gray background (Apple-like)
        },
        surface: {
          DEFAULT: '#FFFFFF', // Pure white for cards
          hover: '#F9FAFB',
          elevated: '#FFFFFF', // Elevated cards with shadow
        },
        text: {
          primary: '#1D1D1F', // Apple dark gray
          secondary: '#6E6E73', // Apple medium gray
          muted: '#86868B', // Apple light gray
        },
        border: {
          DEFAULT: '#D2D2D7', // Apple border gray
          light: '#E5E5EA',
        },
        accent: {
          DEFAULT: '#007AFF', // Apple blue
          hover: '#0051D5',
          light: '#E5F0FF',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'apple': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'apple-lg': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'apple-xl': '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)',
      },
      backdropBlur: {
        'apple': '20px',
      },
    },
  },
  plugins: [],
}
