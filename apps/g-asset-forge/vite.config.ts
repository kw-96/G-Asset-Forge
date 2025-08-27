import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), checker({ typescript: true })],
  base: './',
  server: {
    port: 6167,
    host: true,
  },
  build: {
    outDir: 'build',
    cssCodeSplit: false,
  },
  resolve: {
    alias: {
      '@g-asset-forge/core': resolve(__dirname, '../../packages/core/src'),
      '@g-asset-forge/common': resolve(__dirname, '../../packages/common/src'),
      '@g-asset-forge/geo': resolve(__dirname, '../../packages/geo/src'),
      '@g-asset-forge/icons': resolve(__dirname, '../../packages/icons/src'),
      '@g-asset-forge/components': resolve(__dirname, '../../packages/components/src'),
    },
  },
});
