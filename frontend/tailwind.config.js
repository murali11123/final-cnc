/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#1e40af",     // Royal Blue
          secondary: "#3b82f6",   // Blue
          light: "#dbeafe",       // Light Blue accent
          glow: "#60a5fa",        // Light glow blue
          dark: "#0f172a",        // Deep Navy (slate-900)
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
