/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./contexts/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D9488",
        "primary-dark": "#0F766E",
        "primary-light": "#14B8A6",
        "primary-container": "#CCFBF1",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#003D36",

        surface: "#F7F9FB",
        "surface-container": "#ECEEF0",
        "surface-container-low": "#F2F4F6",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-high": "#E6E8EA",
        "surface-bright": "#F7F9FB",
        "surface-dim": "#D8DADC",
        "surface-variant": "#E0E3E5",

        "on-surface": "#191C1E",
        "on-surface-variant": "#434655",
        "on-background": "#191C1E",
        background: "#F7F9FB",

        outline: "#737686",
        "outline-variant": "#C3C6D7",

        secondary: "#515F74",
        "secondary-container": "#D5E3FC",
        "on-secondary": "#FFFFFF",
        "on-secondary-container": "#57657A",

        error: "#BA1A1A",
        "error-container": "#FFDAD6",
        "on-error": "#FFFFFF",
        "on-error-container": "#93000A",

        "inverse-surface": "#2D3133",
        "inverse-on-surface": "#EFF1F3",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "System"],
      },
      fontSize: {
        display: ["32px", { lineHeight: "40px", fontWeight: "700", letterSpacing: "-0.02em" }],
        h1: ["24px", { lineHeight: "32px", fontWeight: "700", letterSpacing: "-0.01em" }],
        "h1-mobile": ["22px", { lineHeight: "28px", fontWeight: "700" }],
        h2: ["20px", { lineHeight: "28px", fontWeight: "600" }],
        h3: ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", fontWeight: "600", letterSpacing: "0.02em" }],
        "label-sm": ["11px", { lineHeight: "14px", fontWeight: "500" }],
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        gutter: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "container-margin": "20px",
      },
    },
  },
  plugins: [],
};