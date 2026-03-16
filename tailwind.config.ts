import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FEF0EC",
          100: "#FDDDD2",
          200: "#FBBBA4",
          300: "#F8907A",
          400: "#F36D4C",
          500: "#E8572E",
          600: "#D85A30",
          700: "#B84828",
          800: "#92381E",
          900: "#6B2913",
          950: "#451A0A",
        },
        accent: {
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        // Inverted warm palette: dark-950 = cream white bg, dark-50 = dark brown text
        dark: {
          50: "#3D1509",
          100: "#5C2214",
          200: "#7A3828",
          300: "#98584A",
          400: "#B07868",
          500: "#C49890",
          600: "#D8BAB5",
          700: "#E8D5D0",
          800: "#F5ECE8",
          900: "#FAF4F1",
          950: "#FFFAF8",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "hero-gradient": "linear-gradient(135deg, #FFFAF8 0%, #FEF0EC 50%, #FFFAF8 100%)",
        "card-gradient": "linear-gradient(135deg, #F5ECE8 0%, #FEF0EC 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
