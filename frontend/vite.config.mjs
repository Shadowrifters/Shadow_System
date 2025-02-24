import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load all environment variables from your .env file (including REACT_APP_SERVER_URL)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    // Setup a proxy for API calls (adjust as needed)
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.REACT_APP_SERVER_URL || 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src')
      }
    },
    // Use a relative base path if you plan to deploy to a subdirectory
    base: './'
  }
});