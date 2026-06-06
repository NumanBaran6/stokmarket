import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite yapılandırması
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Geliştirmede /api isteklerini backend'e yönlendir (CORS'suz çalışma kolaylığı)
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
