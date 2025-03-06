import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"], // Default font family
      }, fontSize: {
        "heading1-bold": [
          "28px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "heading2-semibold": [
          "24px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "heading3-medium": [
          "20px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "subtitle1-medium": [
          "18px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "subtitle2-regular": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "body1-regular": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "body2-regular": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "body3-regular": [
          "12px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "body-bold": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        caption: [
          "12px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "small-text": [
          "10px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "button-text": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "button-text-primary": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "button-text-secondary": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "link-text": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "error-text": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "success-text": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "warning-text": [
          "14px",
          {
            lineHeight: "140%",
            fontWeight: "500",
          },
        ],
        "appbar-title": [
          "20px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "card-title": [
          "18px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
        "card-subtitle": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "400",
          },
        ],
        "price-tag": [
          "16px",
          {
            lineHeight: "140%",
            fontWeight: "700",
          },
        ],
        "badge-text": [
          "12px",
          {
            lineHeight: "140%",
            fontWeight: "600",
          },
        ],
      },
      colors: {
        glassmorphism: "#dedef599",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        "primary-light": "var(--primary-light)",
        "primary-dark": "var(--primary-dark)",

        secondary: "var(--secondary)",
        "secondary-light": "var(--secondary-light)",
        "secondary-dark": "var(--secondary-dark)",
        "secondary-muted": "var(--secondary-muted)",

        "accent-green": "var(--accent-green)",
        "accent-red": "var(--accent-red)",
        "accent-orange": "var(--accent-orange)",

        grey: "var(--grey)",
        "light-grey": "var(--light-grey)",
        "dark-grey": "var(--dark-grey)",

        background: "var(--background)",
        "background-secondary": "var(--background-secondary)",
        surface: "var(--surface)",

        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-hint": "var(--text-hint)",

        "button-primary": "var(--button-primary)",
        "button-secondary": "var(--button-secondary)",
        "button-text": "var(--button-text)",

        error: "var(--error)",
        success: "var(--success)",
        warning: "var(--warning)",
        info: "var(--info)",

        divider: "var(--divider)",
      },
      opacity: {
        15: "0.15",
        25: "0.25",
        50: "0.5",
        75: "0.75",
        85: "0.85",
        90: "0.9",
        95: "0.95",
      },
      fontWeight: {
        thin: "100", // w100 - Thin
        "extra-light": "200", // w200 - Extra-light
        light: "300", // w300 - Light
        regular: "400", // w400 - Regular
        medium: "500", // w500 - Medium
        "semi-bold": "600", // w600 - Semi-bold
        bold: "700", // w700 - Bold
        "extra-bold": "800", // w800 - Extra-bold
        black: "900", // w900 - Black
      },
      screens: {
        xs: "400px",
      },
      keyframes: {
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
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
