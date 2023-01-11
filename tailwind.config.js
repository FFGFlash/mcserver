/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = {
  content: ['./src/app/**/*.{html,js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        roboto: ['Roboto', 'sans-serif']
      }
    }
  },
  variants: {
    extend: {
      transform: ['group-hover', 'hover'],
      scale: ['group-hover', 'hover']
    }
  }
}
