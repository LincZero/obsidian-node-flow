import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData: `@import "./src/styles/global.scss";`
      }
    }
  },
  server: {
    port: 3000
  },
  root: path.resolve(__dirname, './'), // 确保 Vite 使用正确的根目录
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, './src/main.ts'),
      },
    },
  },
});
