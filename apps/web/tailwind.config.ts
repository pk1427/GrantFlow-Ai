import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "#070A12",
        panel: "#101521",
        line: "#242B3D",
        violet: "#7C3AED",
        cyan: "#22D3EE",
        success: "#22C55E"
      },
      boxShadow: {
        glow: "0 0 32px rgba(34, 211, 238, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
