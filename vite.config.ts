import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [VantResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: ['h5.panalow.cc'],
    proxy: {
      '/front': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://my_service:8000',
        changeOrigin: true,
        timeout: 600_000,
        proxyTimeout: 600_000,
      },
      '/static': {
        target: process.env.VITE_DEV_PROXY_TARGET || 'http://my_service:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
})
