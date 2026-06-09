/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "2rem",
        lg: "4rem",
        xl: "5rem",
        "2xl": "6rem",
      },
    },
    extend: {
      colors: {
        museum: {
          wall: "#1a3a3a",
          wallDark: "#122a2a",
          wallLight: "#254d4d",
          gold: "#c9a962",
          goldLight: "#d9bf85",
          goldDark: "#a88a4a",
          paper: "#f5f0e6",
          paperDark: "#e8e0d0",
          ink: "#2c2416",
          inkLight: "#5a4e3a",
          warning: "#b4543d",
          warningLight: "#cc7662",
        },
      },
      fontFamily: {
        display: [
          '"Noto Serif SC"',
          '"Source Han Serif SC"',
          '"Songti SC"',
          'SimSun',
          "serif",
        ],
        body: [
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          "sans-serif",
        ],
      },
      boxShadow: {
        exhibit:
          "0 4px 6px -1px rgba(26, 58, 58, 0.15), 0 2px 4px -2px rgba(26, 58, 58, 0.1), 0 0 0 1px rgba(201, 169, 98, 0.2)",
        "exhibit-hover":
          "0 20px 25px -5px rgba(26, 58, 58, 0.25), 0 8px 10px -6px rgba(26, 58, 58, 0.15), 0 0 0 1px rgba(201, 169, 98, 0.4)",
        "inner-paper":
          "inset 0 2px 4px 0 rgba(26, 58, 58, 0.08), inset 0 -1px 2px 0 rgba(26, 58, 58, 0.04)",
      },
      backgroundImage: {
        "noise-texture":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E\")",
        "gold-gradient":
          "linear-gradient(135deg, #c9a962 0%, #d9bf85 50%, #c9a962 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};
