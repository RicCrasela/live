/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vibe: {
          red: "#fe2c55",
          cyan: "#25f4ee",
          ink: "#0b0b0f",
          panel: "#16161d",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        floatUp: {
          "0%": { opacity: "0", transform: "translateY(20px) scale(0.8)" },
          "15%": { opacity: "1", transform: "translateY(0) scale(1)" },
          "80%": { opacity: "1", transform: "translateY(-160px) scale(1.05)" },
          "100%": { opacity: "0", transform: "translateY(-220px) scale(0.9)" },
        },
        heartbeat: {
          "0%,100%": { transform: "scale(1)" },
          "35%": { transform: "scale(1.35)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.9" },
          "70%": { transform: "scale(1.5)", opacity: "0" },
          "100%": { transform: "scale(1.5)", opacity: "0" },
        },
        slideIn: {
          "0%": { opacity: "0", transform: "translateX(-12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        giftPop: {
          "0%": { opacity: "0", transform: "scale(0.4) rotate(-12deg)" },
          "40%": { opacity: "1", transform: "scale(1.15) rotate(4deg)" },
          "70%": { transform: "scale(1) rotate(0deg)" },
          "100%": { opacity: "0", transform: "scale(1.1) translateY(-40px)" },
        },
        shine: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        floatUp: "floatUp 3s ease-out forwards",
        heartbeat: "heartbeat 0.45s ease-in-out",
        pulseRing: "pulseRing 1.8s ease-out infinite",
        slideIn: "slideIn 0.25s ease-out",
        giftPop: "giftPop 2.6s ease-out forwards",
        shine: "shine 3s linear infinite",
      },
    },
  },
  plugins: [],
};
