import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiPort = env.API_PORT || 4000;

  return {
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        // Frontend -> API while running locally (dev & e2e tests).
        '/api': {
          target: `http://localhost:${apiPort}`,
          changeOrigin: true,
        },
      },
    },
    preview: { port: 4173, strictPort: true },
    build: { outDir: 'dist', emptyOutDir: true },
  };
});