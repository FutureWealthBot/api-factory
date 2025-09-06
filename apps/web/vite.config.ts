import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/_api': {
        target: 'http://localhost:8787', // update if CLI rebinds
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/_api/, '')
      }
    }
  }
})
