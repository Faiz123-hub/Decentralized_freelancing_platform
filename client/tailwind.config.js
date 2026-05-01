/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f7ff",
          400: "#5b8cff",
          500: "#3d73f6",
          900: "#0d1b40"
        }
      },
      boxShadow: {
        panel: "0 20px 60px rgba(15, 23, 42, 0.25)"
      }
    }
  },
  plugins: []
};

