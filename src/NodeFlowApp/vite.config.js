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
  base: '/obsidian-node-flow/', // [!code] 临时，需要根据你要部署的位置进行修改
  server: {
    port: 3060
  },
  root: path.resolve(__dirname, './'), // 确保 Vite 使用正确的根目录
  build: {
    outDir: 'dist',
    rollupOptions: {
      // input: {
      //   main: path.resolve(__dirname, './src/main.ts'),
      // },
      input: path.resolve(__dirname, './index.html'),
    },
  },
});
