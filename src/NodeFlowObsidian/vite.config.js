import { defineConfig } from 'vite';
import { resolve } from 'path';
import builtins from 'builtin-modules';
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue()
  ],
  outDir: '/dist/vite/',
  build: {
    lib: {
      entry: resolve(__dirname, './main.ts'),
      name: 'ExpressApp',
      fileName: 'index',
      formats: ['cjs'],
    },
    rollupOptions: {
      external: [ // 将 obsidian 标记为外部依赖
        'obsidian',
        'electron',
        '@codemirror/autocomplete',
        '@codemirror/closebrackets',
        '@codemirror/collab',
        '@codemirror/commands',
        '@codemirror/comment',
        '@codemirror/fold',
        '@codemirror/gutter',
        '@codemirror/highlight',
        '@codemirror/history',
        '@codemirror/language',
        '@codemirror/lint',
        '@codemirror/matchbrackets',
        '@codemirror/panel',
        '@codemirror/rangeset',
        '@codemirror/rectangular-selection',
        '@codemirror/search',
        '@codemirror/state',
        '@codemirror/stream-parser',
        '@codemirror/text',
        '@codemirror/tooltip',
        '@codemirror/view',
        ...builtins,
      ],
    },
  },
});
