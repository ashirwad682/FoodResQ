import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8004',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://127.0.0.1:8004',
        changeOrigin: true,
      },
      '/static/admin': {
        target: 'http://127.0.0.1:8004',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 3005,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8004',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://127.0.0.1:8004',
        changeOrigin: true,
      },
      '/static/admin': {
        target: 'http://127.0.0.1:8004',
        changeOrigin: true,
      },
    },
  },
});