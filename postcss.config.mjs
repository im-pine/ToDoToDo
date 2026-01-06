const config = {
  plugins: {
    'postcss-preset-mantine': {},
    'postcss-simple-vars': {
      variables: {
        'mantine-breakpoint-sm': '480px',
        'mantine-breakpoint-md': '768px',
        'mantine-breakpoint-lg': '1024px',
        'mantine-breakpoint-xl': '1280px',
      },
    },
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
export default config
