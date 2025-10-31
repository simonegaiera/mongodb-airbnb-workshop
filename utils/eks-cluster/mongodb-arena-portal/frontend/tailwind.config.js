/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        mongodb: {
          green: '#00684A',
          dark: '#023430',
          light: '#E3FCF7'
        },
        arena: {
          dark: '#0A1F1C',
          'dark-light': '#0F2925',
          'dark-lighter': '#15332E',
          'teal': '#134E4A',
          'teal-light': '#1A5F58',
          'neon-green': '#00FF6B',
          'bright-green': '#00ED64',
          'circuit': '#1A3F3B',
        }
      },
      backgroundImage: {
        'circuit-pattern': 'linear-gradient(90deg, rgba(0,255,107,0.05) 1px, transparent 1px), linear-gradient(rgba(0,255,107,0.05) 1px, transparent 1px)',
      },
      backgroundSize: {
        'circuit': '50px 50px',
      }
    },
  },
  plugins: [],
}
