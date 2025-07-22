/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'custom': ['CustomFont', 'monospace'],
        'custom2':['CustomFont2','monospace'],
        'poppins': ['Poppins', 'sans-serif'],
        'mono': ['CustomFont', 'Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
