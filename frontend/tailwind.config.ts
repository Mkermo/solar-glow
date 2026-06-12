import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0B0F",
          soft: "#15151C",
          line: "#26262F",
        },
        paper: {
          DEFAULT: "#F5F1E8",
          soft: "#EDE7DA",
          line: "#D9D2C2",
        },
        solar: {
          DEFAULT: "#FFB527",
          deep: "#E8920C",
          ember: "#FF5C1F",
          glow: "#FFD66B",
        },
        // shadcn token mapping (paper-first, ink text)
        border: "#D9D2C2",
        input: "#D9D2C2",
        ring: "#FFB527",
        background: "#F5F1E8",
        foreground: "#0B0B0F",
        primary: { DEFAULT: "#0B0B0F", foreground: "#F5F1E8" },
        secondary: { DEFAULT: "#EDE7DA", foreground: "#0B0B0F" },
        muted: { DEFAULT: "#EDE7DA", foreground: "#5C594F" },
        accent: { DEFAULT: "#FFB527", foreground: "#0B0B0F" },
        destructive: { DEFAULT: "#C0341D", foreground: "#F5F1E8" },
        popover: { DEFAULT: "#F5F1E8", foreground: "#0B0B0F" },
        card: { DEFAULT: "#F5F1E8", foreground: "#0B0B0F" },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', "system-ui", "sans-serif"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
        mono: ['"Space Mono"', "monospace"],
      },
      fontSize: {
        "display-xl": ["clamp(3.5rem, 12vw, 11rem)", { lineHeight: "0.9", letterSpacing: "-0.02em" }],
        "display-lg": ["clamp(2.75rem, 8vw, 7rem)", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-md": ["clamp(2rem, 5vw, 4.5rem)", { lineHeight: "1", letterSpacing: "-0.01em" }],
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-14px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.55" },
          "50%": { opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "marquee-slow": "marquee 48s linear infinite",
        "spin-slow": "spin-slow 24s linear infinite",
        float: "float 7s ease-in-out infinite",
        "pulse-glow": "pulse-glow 5s ease-in-out infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
