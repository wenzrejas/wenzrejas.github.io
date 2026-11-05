import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'

const VENDOR_CHUNK_LIMIT_KB = 900

export default defineConfig({
  plugins: [react(), glsl({ root: '/src' })],
  resolve: {
    alias: { '@': '/src' },
  },
  server: {
    host: true,
  },
  build: {
    chunkSizeWarningLimit: VENDOR_CHUNK_LIMIT_KB,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three', test: /node_modules[\\/]three[\\/]/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler|zustand)[\\/]/ },
            { name: 'react-three', test: /node_modules[\\/]@react-(three|spring)[\\/]/ },
          ],
        },
      },
    },
  },
})
