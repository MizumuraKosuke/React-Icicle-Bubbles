module.exports = {
  purge: [ './src/**/*.{js,tsx}' ],
  darkMode: 'class', // 'media' or 'class'
  theme: {
    extend: {
      colors: {
        primary: '#783FF8',
        sub: '#ED02C0',
        sub2: '#FF76EF',
      },
    },
    fontFamily: {
      sans: [
        // Default Google Fonts
        'M PLUS 1p',
        // --- fallback
        // Safari for macOS and iOS (San Francisco)
        '-apple-system',
        // Chrome < 56 for macOS (San Francisco)
        'BlinkMacSystemFont',
        // Windows
        'Segoe UI',
        // Android
        'Roboto',
        // Basic web fallback
        'Helvetica Neue',
        // Basic Ja fallback
        'Hiragino Sans', 'Hiragino Kaku Gothic ProN',
        // Basic web fallback
        'Arial',
        // Windows Ja
        'Yu Gothic', 'Meiryo',
        // Linux
        'Noto Sans',
        'Liberation Sans',
        // Sans serif fallback
        'sans-serif',
        // Emoji fonts
        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji' ],
      serif: [
        'Times New Roman', 'YuMincho', 'Hiragino Mincho ProN',
        'Yu Mincho', 'MS PMincho',
        // Serif fallback
        'serif',
        // Emoji fonts
        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji',
      ],
    },
  },
  variants: {
    extend: {
      opacity: [ 'disabled' ],
    },
  },
  plugins: [],
}
