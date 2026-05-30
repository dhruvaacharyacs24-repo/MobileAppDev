/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#050816",
        card: "#0F172A",
        muted: "#1E293B",
        primary: "#F59E0B",
        accent: "#22D3EE",
        text: "#F8FAFC",
        subtext: "#94A3B8",
        danger: "#FB7185",
        success: "#34D399",
      },
    },
  },
  plugins: [],
};
