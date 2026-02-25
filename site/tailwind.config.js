/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{njk,md,html,js}",
    "./content/**/*.{njk,md,html}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: "#e07850",
          light: "#f09070",
          dark: "#c5623a",
          50: "#fdf3ef",
          100: "#fae4d8",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "sans-serif",
        ],
        mono: ['"Courier New"', "Courier", "monospace"],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.300"),
            a: {
              color: theme("colors.coral.DEFAULT"),
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            },
            "h1, h2, h3, h4": { color: theme("colors.gray.100") },
            strong: { color: theme("colors.gray.100") },
            code: {
              backgroundColor: theme("colors.gray.800"),
              padding: "0.2em 0.4em",
              borderRadius: "3px",
              fontWeight: "400",
              color: theme("colors.coral.light"),
            },
            "code::before": { content: '""' },
            "code::after": { content: '""' },
            blockquote: {
              borderLeftColor: theme("colors.coral.DEFAULT"),
              color: theme("colors.gray.400"),
            },
            hr: { borderColor: theme("colors.gray.800") },
            "thead th": { color: theme("colors.gray.100") },
            "tbody tr": { borderBottomColor: theme("colors.gray.800") },
            pre: {
              backgroundColor: "#0f172a",
              color: theme("colors.gray.200"),
            },
            "pre code": {
              backgroundColor: "transparent",
              padding: "0",
              borderRadius: "0",
              color: "inherit",
              fontWeight: "inherit",
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
