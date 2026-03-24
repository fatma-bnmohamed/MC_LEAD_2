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
  50:  "#E6F4F8",   // très clair
  100: "#D1E8EF",   // light background
  200: "#A9D5E3",
  300: "#7EC1D6",
  400: "#4DAAC5",
  500: "#0E84A5",   // PRIMARY
  600: "#0A6C87",   // hover
  700: "#085E74",   // sidebar
  800: "#064B5C",
  900: "#033845",
},

        surface: {
          DEFAULT: "#FFFFFF",
          muted: "#F8FAFC",
        },

        border: {
          light: "#E2E8F0",
        },

        text: {
          primary: "#0F172A",
          secondary: "#334155",
          muted: "#64748B",
        },

        success: "#0EA5E9",
        warning: "#F59E0B",
        danger: "#EF4444",
      }
    },
  },
  plugins: [],
}

