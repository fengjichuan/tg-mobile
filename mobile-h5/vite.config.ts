import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target =
    env.VITE_DEV_API_TARGET || 'http://192.168.44.3:8080';

  return {
    plugins: [react()],
    server: {
      port: 5174,
      host: true,
      proxy: {
        '/v1': {
          target,
          changeOrigin: true,
        },
      },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-echarts': ['echarts'],
            'vendor-ui': ['antd-mobile'],
          },
        },
      },
    },
  };
});
