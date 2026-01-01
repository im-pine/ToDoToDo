import colors from 'tailwindcss/colors'
import { createTheme } from '@mantine/core'

type ColorKey = keyof typeof colors

const arrange = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
const createColorArray = (colorObject: any) => arrange.map((value) => colorObject[value])
const defaultColor = (Object.keys(colors) as ColorKey[]).reduce(
  (acc, colorKey) => {
    if (typeof colors[colorKey] === 'object') acc[colorKey] = createColorArray(colors[colorKey])
    return acc
  },
  {} as Record<string, string[]>
)

const theme = createTheme({
  colors: {
    ...defaultColor,
    primary: [
      'var(--primary-colors-0)',
      'var(--primary-colors-1)',
      'var(--primary-colors-2)',
      'var(--primary-colors-3)',
      'var(--primary-colors-4)',
      'var(--primary-colors-5)',
      'var(--primary-colors-6)',
      'var(--primary-colors-7)',
      'var(--primary-colors-8)',
      'var(--primary-colors-9)',
    ],
    secondary: [
      'var(--secondary-colors-0)',
      'var(--secondary-colors-1)',
      'var(--secondary-colors-2)',
      'var(--secondary-colors-3)',
      'var(--secondary-colors-4)',
      'var(--secondary-colors-5)',
      'var(--secondary-colors-6)',
      'var(--secondary-colors-7)',
      'var(--secondary-colors-8)',
      'var(--secondary-colors-9)',
    ],
    black: [
      'var(--black-colors-0)',
      'var(--black-colors-1)',
      'var(--black-colors-2)',
      'var(--black-colors-3)',
      'var(--black-colors-4)',
      'var(--black-colors-5)',
      'var(--black-colors-6)',
      'var(--black-colors-7)',
      'var(--black-colors-8)',
      'var(--black-colors-9)',
    ],
  },
  shadows: {
    md: '1px 1px 3px rgba(0, 0, 0, .25)',
    xl: '5px 5px 3px rgba(0, 0, 0, .25)',
  },

  headings: {
    fontFamily: 'Roboto, sans-serif',
    sizes: {
      h1: { fontSize: '36px' },
    },
  },
})

export default theme
