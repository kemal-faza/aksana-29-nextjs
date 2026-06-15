import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#065f46',      // V3 hijau tua
        secondary: '#f5f5f5',
        tersier: '#E5BA73',      // V3 gold
        dark: '#171717',
      },
      fontFamily: {
        heading: ['var(--font-bebas)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
