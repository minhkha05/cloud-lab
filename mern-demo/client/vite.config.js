import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

// Vite preview reads this at container startup, so Render can supply the URL.
const apiTarget = (process.env.VITE_API_URL || 'http://backend:5000').replace(/\/+$/, '')
const apiProxy = {
  '/api': {
    target: apiTarget,
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: apiProxy,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    proxy: apiProxy,
  },
})
