/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'auto': '#4FC3F7',
        'transition': '#BA68C8',
        'active': '#E57373',
        'inactive': '#64B5F6',
        'endgame': '#AED581',
      },
    },
  },
  plugins: [],
}

