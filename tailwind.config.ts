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
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        // Used by the gradient overlay layered over a white headline.
        // Fades the multi-color gradient in (revealing colored text) and
        // back out (revealing the white text underneath), while also
        // sweeping the background-position so the colors themselves move
        // when visible. White → moving gradient → white, on a loop.
        // The 40–60% plateau holds the gradient at full opacity through
        // the middle of the cycle (~1.2s at 6s duration) so the colors
        // get to land instead of just flicker through.
        gradientPulse: {
          "0%":   { opacity: "0", backgroundPosition: "0% 50%" },
          "40%":  { opacity: "1", backgroundPosition: "80% 50%" },
          "60%":  { opacity: "1", backgroundPosition: "120% 50%" },
          "100%": { opacity: "0", backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 6s ease-in-out infinite",
        "border-shimmer": "borderShimmer 4s ease-in-out infinite",
        gradient: "gradient 6s ease-in-out infinite",
        "gradient-pulse": "gradientPulse 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
