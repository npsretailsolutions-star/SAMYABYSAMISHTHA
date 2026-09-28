import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          teal: "#0b3d3a",
          "teal-dark": "#062522",
          "teal-light": "#124a45",
          cream: "#faf3e6",
          gold: "#c9a24a",
          "gold-light": "#e3c565",
          "gold-dark": "#a2822f",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px rgba(11, 61, 58, 0.08)",
        gold: "0 4px 18px rgba(201, 162, 74, 0.35)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #e3c565 0%, #c9a24a 50%, #a2822f 100%)",
        "teal-gradient": "linear-gradient(135deg, #0b3d3a 0%, #062522 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
