/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        violet: "#6E5CFF",
        activityColor: {
          none: "#ebedf0",
          low: "#9be9a8",
          mediumLow: "#40c463",
          mediumHigh: "#30a14e",
          high: "#216e39",
        },
        gray: {
          DEFAULT: "#141414", // Dark mode gray
          // DEFAULT: "#191D23", // Dark mode gray that I wanted
        },
      },
    },
  },
  plugins: [],
};
