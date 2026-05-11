import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gotham: "#06060c",
        // Legacy brand (kept for emails + admin)
        indigo: { brand: "#4F46E5" },
        cyan: { brand: "#06B6D4" },
        green: { brand: "#10B981" },
        // Funnel v2 palette
        funnel: {
          bg: "#06060c",
          surface: "#0f0f1a",
          purple: "#8b5cf6",
          purpleLight: "#a78bfa",
          pink: "#ec4899",
          teal: "#22d3ee",
          green: "#10b981",
          text: "#f0eeff",
          muted: "#8880aa",
          mutedDark: "#4a4860",
          error: "#f43f5e",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "Bebas Neue",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
        hero: [
          "Bebas Neue",
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "funnel-hero":
          "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
        "funnel-cta":
          "linear-gradient(135deg, #22d3ee 0%, #8b5cf6 100%)",
        "funnel-divider":
          "linear-gradient(90deg, #8b5cf6 0%, #ec4899 50%, #22d3ee 100%)",
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
        gradientPulse: {
          "0%": { opacity: "0", backgroundPosition: "0% 50%" },
          "40%": { opacity: "1", backgroundPosition: "80% 50%" },
          "60%": { opacity: "1", backgroundPosition: "120% 50%" },
          "100%": { opacity: "0", backgroundPosition: "200% 50%" },
        },
        orbFloat1: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(-60px, 80px) scale(1.08)" },
        },
        orbFloat2: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(70px, -60px) scale(1.12)" },
        },
        orbFloat3: {
          "0%": { transform: "translate(0, 0) scale(1)" },
          "100%": { transform: "translate(40px, 50px) scale(0.92)" },
        },
        ctaPulse: {
          "0%, 100%": {
            boxShadow: "0 8px 32px rgba(139,92,246,0.3)",
          },
          "50%": {
            boxShadow:
              "0 8px 32px rgba(139,92,246,0.55), 0 0 32px rgba(34,211,238,0.35)",
          },
        },
      },
      animation: {
        "pulse-glow": "pulseGlow 6s ease-in-out infinite",
        "border-shimmer": "borderShimmer 4s ease-in-out infinite",
        gradient: "gradient 6s ease-in-out infinite",
        "gradient-pulse": "gradientPulse 6s ease-in-out infinite",
        "orb-1": "orbFloat1 8s ease-in-out infinite alternate",
        "orb-2": "orbFloat2 10s ease-in-out infinite alternate-reverse",
        "orb-3": "orbFloat3 12s ease-in-out infinite alternate",
        "cta-pulse": "ctaPulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
