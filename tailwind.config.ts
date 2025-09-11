import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            h1: { fontWeight: "700" },
            h2: { fontWeight: "700" },
            // nicer spacing for headings
            "h1, h2, h3": { scrollMarginTop: theme("spacing.24") },
          },
        },
      }),
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
    // require("daisyui"), // optional
  ],
};
export default config;
