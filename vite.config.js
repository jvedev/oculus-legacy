import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main/main.js'),
        session: path.resolve(__dirname, 'src/session/session.js')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name][extname]'
      }
    },
    outDir: 'dist'
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'shared'),
      '@src': path.resolve(__dirname, 'src')
    }
  }
})