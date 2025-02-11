import { defineConfig } from 'vite';
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
  }
});
