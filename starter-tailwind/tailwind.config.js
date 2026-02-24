/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{njk,md,html,js}",
    "./content/**/*.{njk,md,html}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8",
          light: "#60a5fa",
        },
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", "sans-serif"],
      },
      typography: {
        DEFAULT: {
          css: {
            a: {
              color: "#2563eb",
              "&:hover": { color: "#1d4ed8" },
            },
            "code::before": { content: '""' },
            "code::after": { content: '""' },
          },
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
  ],
};
