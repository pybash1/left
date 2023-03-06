const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#222222",
        accent: "#ffffff",
        neutral: "#888888",
        basel: "#e1e1e1",
        accentl: "#000000",
        neutrall: "#848484",
      },
      fontFamily: {
        mono: ["'Space Mono'", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
};

module.exports = config;
