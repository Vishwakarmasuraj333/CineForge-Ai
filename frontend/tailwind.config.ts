import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cine: {
          950: "#090A0C", // Deep obsidian cinematic background
          900: "#101216", // Primary surface
          850: "#15181F", // Raised surface
          800: "#1B2028", // Surface border & subtle card
          700: "#2B323F", // Muted border
          600: "#444F63", // Subtle text
          400: "#8E9BB0", // Secondary text
          200: "#D6DEEB", // Primary light text
          100: "#F0F4FA", // Crisp white highlight
        },
        gold: {
          400: "#E5B869", // Warm film highlight
          500: "#D4A349", // Accent CTA
          600: "#B88628", // Hover highlight
        },
        ember: {
          400: "#FB923C", // Forge flame
          500: "#F97316", // Accent ember
          600: "#EA580C",
        },
        electric: {
          400: "#38BDF8", // Anamorphic flare
          500: "#0EA5E9",
          600: "#0284C7",
        },
        teal: {
          400: "#2DD4BF", // AI Status accent
          500: "#14B8A6", // Active state
          900: "#042F2E", // Subtle teal badge background
        },
        film: {
          red: "#EF4444",
          amber: "#F59E0B",
          emerald: "#10B981",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "cinema-glow": "radial-gradient(circle at 50% 0%, rgba(229, 184, 105, 0.15), transparent 70%)",
        "forge-glow": "radial-gradient(circle at 50% 50%, rgba(249, 115, 22, 0.12), transparent 60%)",
      },
      keyframes: {
        shimmer: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 15px rgba(229, 184, 105, 0.3)" },
          "50%": { boxShadow: "0 0 30px rgba(229, 184, 105, 0.6)" },
        },
      },
      animation: {
        shimmer: "shimmer 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2.5s infinite",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        cine: "0.5rem",
      },
    },
  },
  plugins: [],
};

export default config;

