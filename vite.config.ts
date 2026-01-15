import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false, // Don't open automatically in CI/CD or during generic builds
      gzipSize: true,
      filename: 'stats.html',
    }),
  ],
  resolve: {
    alias: {
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
