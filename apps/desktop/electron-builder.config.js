const { defineConfig } = require('electron-vite')

module.exports = defineConfig({
  main: {
    entry: 'src/main/index.js',
    resolve: {
      alias: {
        '@desktop': 'src/main',
        '@preload': 'src/preload',
      },
    },
  },
  preload: {
    entry: 'src/preload/index.js',
  },
  renderer: {
    // The renderer is not a standalone app — it loads from the DSH web server.
    // This config is kept for potential local dev overrides.
    resolve: {
      alias: {
        '@desktop': 'src/main',
      },
    },
  },
})
