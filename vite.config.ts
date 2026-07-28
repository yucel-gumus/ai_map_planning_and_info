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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const withGatewayAuth = (proxy: any) => {
    proxy.on('proxyReq', (proxyReq: { setHeader: (k: string, v: string) => void }) => {
      if (apiKey) {
        proxyReq.setHeader('X-API-Key', apiKey);
      }
    });
  };

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      proxy: {
        // AI map generation
        '/api/generate-map': {
          target: gatewayTarget,
          changeOrigin: true,
          secure: true,
          configure: withGatewayAuth,
        },
        // Places photo + future Google Maps backend endpoints
        '/api/places': {
          target: gatewayTarget,
          changeOrigin: true,
          secure: true,
          configure: withGatewayAuth,
        },
        '/api/maps': {
          target: gatewayTarget,
          changeOrigin: true,
          secure: true,
          configure: withGatewayAuth,
        },
      },
    },
  };
});
