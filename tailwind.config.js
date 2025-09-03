// /** @type {import('tailwindcss').Config} */
// export default {
//   content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };



/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'theme-green-dark': '#0f766e',
        'theme-green-light': '#34d399',
        'theme-teal-dark': '#0d9488',
        'theme-teal-light': '#14b8a6',
      },
    },
  },
  plugins: [],
};
