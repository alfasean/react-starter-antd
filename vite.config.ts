/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 3000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // Tests never hit a real backend, and .env.development is not loaded in
    // test mode. Pin the values the config layer reads at import time.
    env: {
      VITE_API_MOCK: 'true',
      VITE_APP_NAME: 'React Starter',
      VITE_APP_API_URL: '',
    },
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
  },
});
