import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        runes: true, // Enable Svelte 5 runes
      },
    }),
  ],
  build: {
    target: 'node18',
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'index.ts'),
      name: 'sveltui',
      fileName: 'sveltui',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['blessed'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});