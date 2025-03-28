/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "spotify-green": "#1DB954",
        "spotify-black": "#191414",
        "spotify-white": "#FFFFFF",
        "spotify-secondary": "#1ed760",
        "spotify-darkgray": "#121212",
        "spotify-lightgray": "#282828",
        "spotify-text": "#FFFFFF",
        "spotify-text-subdued": "#B3B3B3",
        "spotify-card": "rgba(30, 30, 30, 0.7)",
        "spotify-hover": "rgba(40, 40, 40, 0.8)",
      },
      boxShadow: {
        spotify: "0 2px 4px rgba(0,0,0,0.3)",
        "spotify-lg": "0 4px 8px rgba(0,0,0,0.4)",
        "spotify-xl": "0 8px 16px rgba(0,0,0,0.5)",
      },
      animation: {
        "spin-slow": "spin 20s linear infinite",
        "spin-slower": "spin 30s linear infinite",
        "spin-slowest": "spin 40s linear infinite",
        "land-mass": "land-mass 40s linear infinite",
        clouds: "clouds 30s linear infinite",
        shine: "shine 10s linear infinite",
        "satellite-1": "satellite-1 15s linear infinite",
        "satellite-2": "satellite-2 20s linear infinite",
      },
      keyframes: {
        "land-mass": {
          "0%, 100%": { transform: "translateX(0%)" },
          "50%": { transform: "translateX(-50%)" },
        },
        clouds: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        shine: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "satellite-1": {
          "0%": { transform: "rotate(0deg) translateX(150px)" },
          "100%": { transform: "rotate(360deg) translateX(150px)" },
        },
        "satellite-2": {
          "0%": { transform: "rotate(0deg) translateX(120px)" },
          "100%": { transform: "rotate(-360deg) translateX(120px)" },
        },
      },
    },
  },
  plugins: [require("tailwind-scrollbar")],
};
