import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gotham: "#050505",
        indigo: { brand: "#4F46E5" },
        cyan: { brand: "#06B6D4" },
        green: { brand: "#10B981" },
      },
      fontFamily: {
        sans: [
          "Space Grotesk",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Space Grotesk",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(45deg, #4F46E5 0%, #06B6D4 50%, #10B981 100%)",
        "brand-gradient-cyan-emerald":
          "linear-gradient(90deg, #06B6D4 0%, #10B981 100%)",
      },
      keyframes: {
        pulseGlow: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.05)" },
        },
        borderShimmer: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 6s ease-in-out infinite",
        "border-shimmer": "borderShimmer 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
