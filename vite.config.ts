import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

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
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'], // Exclude FFmpeg from dep optimization (worker issues)
  },
  resolve: {
    alias: {
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  worker: {
    format: 'es', // Use ES modules for workers
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
      },
    },
  },
});
