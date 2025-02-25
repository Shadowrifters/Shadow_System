import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Load environment variables (e.g., VITE_SERVER_URL)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: env.VITE_SERVER_URL || 'http://localhost:5000',
          changeOrigin: true,
          rewrite: (path) => {
            return path.replace(/^\/api/, '');
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), 'src')
      }
    },
    base: './'
  };
});
