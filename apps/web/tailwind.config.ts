import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand (existing)
        primary: '#065f46',           // V3 hijau tua (deep emerald)
        secondary: '#f5f5f5',         // light gray surface
        tertiary: '#E5BA73',          // V3 gold (canonical -- replaces `tersier`)
        // DEPRECATED -- remove once all `tersier` references are migrated to `tertiary`
        tersier: '#E5BA73',
        dark: '#171717',              // near-black

        // Semantic aliases
        ink: '#171717',               // semantic alias of dark (default text)
        'ink-mute': '#64748b',        // slate-500, error subtitle
        'ink-placeholder': '#94a3b8', // slate-400, search placeholder
        canvas: '#f5f5f5',            // semantic alias of secondary
        'male-icon': '#0c4a6e',       // sky-900, male count icon
        'female-icon': '#be185d',     // pink-700, female count icon
        'focus-ring': '#3b82f6',      // blue-500, search focus border/ring
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
