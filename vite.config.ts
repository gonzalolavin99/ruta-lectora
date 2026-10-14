import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Ruta Lectora',
        short_name: 'Ruta Lectora',
        description: 'Juegos para practicar la lectura',
        lang: 'es-CL',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#E9E6E0',
        theme_color: '#146B69',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Phaser pesa ~1,5 MB: hay que permitir archivos grandes para que funcione sin conexión.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json,mp3,m4a}'],
      },
    }),
  ],
  build: { chunkSizeWarningLimit: 2000 },
  test: { environment: 'node' },
});
