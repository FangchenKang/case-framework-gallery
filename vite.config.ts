import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  base:
    command === 'build'
      ? process.env.VITE_BASE_PATH || (process.env.VERCEL ? '/' : '/case-framework-gallery/')
      : '/',
  plugins: [react()],
  optimizeDeps: {
    noDiscovery: true,
    include: ['lucide-react', 'react', 'react-dom/client', 'react/jsx-runtime'],
  },
}));
