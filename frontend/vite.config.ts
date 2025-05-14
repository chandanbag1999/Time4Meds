import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { copyFileSync } from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-redirect-file',
      closeBundle() {
        // Copy _redirects file to the build output
        try {
          copyFileSync(
            path.resolve(__dirname, 'public/_redirects'),
            path.resolve(__dirname, 'dist/_redirects')
          );
          console.log('Successfully copied _redirects file to build output');
        } catch (error) {
          console.error('Error copying _redirects file:', error);
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Don't rewrite the path, as the backend expects /api prefix
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})
