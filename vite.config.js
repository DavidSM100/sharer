import { defineConfig, Plugin } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  build: {
    assetsInlineLimit: 0
  },
  plugins: [
    createHtmlPlugin({
      minify: true
    })
  ],
})