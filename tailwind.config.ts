import type { Config } from 'tailwindcss'

const config: Config = {
  // content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
    extend: {
      colors: {
        'default-text': 'var(--default-text-color)',
        primary: {
          50: 'var(--primary-colors-0)',
          100: 'var(--primary-colors-1)',
          200: 'var(--primary-colors-2)',
          300: 'var(--primary-colors-3)',
          400: 'var(--primary-colors-4)',
          500: 'var(--primary-colors-5)',
          600: 'var(--primary-colors-6)',
          700: 'var(--primary-colors-7)',
          800: 'var(--primary-colors-8)',
          900: 'var(--primary-colors-9)',
        },
        secondary: {
          50: 'var(--secondary-colors-0)',
          100: 'var(--secondary-colors-1)',
          200: 'var(--secondary-colors-2)',
          300: 'var(--secondary-colors-3)',
          400: 'var(--secondary-colors-4)',
          500: 'var(--secondary-colors-5)',
          600: 'var(--secondary-colors-6)',
          700: 'var(--secondary-colors-7)',
          800: 'var(--secondary-colors-8)',
          900: 'var(--secondary-colors-9)',
        },
        black: {
          50: 'var(--black-colors-0)',
          100: 'var(--black-colors-1)',
          200: 'var(--black-colors-2)',
          300: 'var(--black-colors-3)',
          400: 'var(--black-colors-4)',
          500: 'var(--black-colors-5)',
          600: 'var(--black-colors-6)',
          700: 'var(--black-colors-7)',
          800: 'var(--black-colors-8)',
          900: 'var(--black-colors-9)',
        },
      },
    },
  },
  plugins: [],
}
export default config
