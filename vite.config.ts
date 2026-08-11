import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Base path for GitHub Pages deployment.
// Bolt's hosted preview runs at "/", and GitHub Pages runs at "/<repo-name>/".
// Using a relative base ("./") makes the build work in both environments.
export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
