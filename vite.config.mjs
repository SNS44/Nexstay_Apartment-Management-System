import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config for NEXSTAY React frontend
// - Dev server runs on http://localhost:5173
// - API requests to /api/* are proxied to XAMPP at http://localhost/Apart

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/Apart',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
