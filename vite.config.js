import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        apod: resolve(__dirname, 'apod.html'),
        portfolio: resolve(__dirname, 'portfolio.html'),
        chickens: resolve(__dirname, 'Chickens.html'),
      },
    },
  },
})