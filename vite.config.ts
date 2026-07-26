import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const gatewayTarget = (
    env.AI_API_URL ||
    env.GEMINI_GATEWAY_URL ||
    'https://python-backend-270384591051.europe-west3.run.app'
  ).replace(/\/$/, '');

  const apiKey = env.GATEWAY_CLIENT_API_KEY || env.CLIENT_API_KEY || '';

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        '/api/generate-map': {
          target: gatewayTarget,
          changeOrigin: true,
          secure: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (apiKey) {
                proxyReq.setHeader('X-API-Key', apiKey);
              }
            });
          },
        },
      },
    },
  };
});