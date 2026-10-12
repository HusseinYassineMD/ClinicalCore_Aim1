import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "metric-value-ytd",
    "metric-value-prior",
    "metric-value-unknown",
    "text-emerald-800",
    "text-neutral-950",
  ],
  theme: {
    extend: {
      colors: {
        cpbh: {
          navy: "#1a2744",
          deep: "#2d3a6e",
          purple: "#5b4b8a",
          lavender: "#8b7cb8",
          soft: "#c4b8e0",
          mist: "#e8e4f3",
          sky: "#4a90c4",
          teal: "#3d8b8b",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      backgroundImage: {
        "hero-pattern":
          "linear-gradient(90deg, #1a2744 0%, #2d3a6e 45%, #4a3f6e 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
