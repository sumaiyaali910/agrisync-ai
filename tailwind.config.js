/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./*.html",
    "./*.js",
  ],
  theme: {
    extend: {
      colors: {
        soil: {
          900: "#27170e",
          800: "#3f2414",
        },
      },
    },
  },
  plugins: [],
};
