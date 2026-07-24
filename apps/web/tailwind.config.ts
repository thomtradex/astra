import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        astra: {
          50: '#f4f7fb',
          100: '#e8eef6',
          200: '#ccd9ea',
          300: '#a1bad8',
          400: '#7096c2',
          500: '#4f78ab',
          600: '#3d608f',
          700: '#334e74',
          800: '#2d4361',
          900: '#293951',
          950: '#1a2536',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
