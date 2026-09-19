import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        surface: "#f8fafc",
        "surface-raised": "#ffffff",
        "surface-card": "#ffffff",
        primary: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
          700: "#b91c1c",
          800: "#991b1b",
          900: "#7f1d1d",
          950: "#450a0a",
        },
        navy: {
          50: "#f0f4f9",
          100: "#e1eaf3",
          200: "#c3d5e7",
          300: "#94b6d6",
          400: "#5e91c1",
          500: "#3872ab",
          600: "#27598f",
          700: "#1e4674",
          800: "#1b3c62",
          900: "#0B192C",
          950: "#060D17",
        },
        accent: {
          cyan: "#0ea5e9",
          violet: "#7c3aed",
          emerald: "#059669",
          amber: "#d97706",
          rose: "#e11d48",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-glow": "radial-gradient(circle at 50% 0%, rgba(14, 165, 233, 0.08) 0%, rgba(225, 29, 72, 0.05) 35%, transparent 75%)",
        "card-glow": "radial-gradient(circle at 50% 0%, rgba(11, 25, 44, 0.04) 0%, transparent 60%)",
      },
      keyframes: {
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
      animation: {
        "pulse-subtle": "pulse-subtle 3s ease-in-out infinite",
        shimmer: "shimmer 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
