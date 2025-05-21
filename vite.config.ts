import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';
import sveltuiPlugin from './src/compiler';

export default defineConfig(({ mode }) => {
  const isDevelopment = mode === 'development';
  
  return {
    plugins: [
      svelte({
        compilerOptions: {
          runes: true, // Enable Svelte 5 runes
          // Ensure we're using Svelte 5 component API
          compatibility: {
            componentApi: 5
          }
        },
        extensions: ['.svelte', '.svelte.ts'],
        // Add our custom SvelTUI plugin as a preprocessor
        preprocess: [
          {
            // Add a simple markup preprocessor to ensure our components are processed
            markup({ content, filename }) {
              // We'll leave the actual processing to the compiler plugin
              return { code: content };
            }
          }
        ]
      }),
      // Add the SvelTUI compiler plugin
      {
        name: 'vite-plugin-sveltui',
        transform(code, id) {
          // Only process Svelte files
          if (id.endsWith('.svelte') || id.endsWith('.svelte.ts')) {
            return sveltuiPlugin({
              debug: isDevelopment,
              sourcemap: true,
              customElements: {
                // Map HTML elements to terminal elements
                div: 'box',
                span: 'text',
                p: 'text',
                input: 'input',
                button: 'button',
                ul: 'list',
                // Add custom mappings for SvelTUI components
                box: 'box',
                text: 'text',
                list: 'list',
                checkbox: 'checkbox'
              }
            }).transform(code, id);
          }
        }
      }
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
        external: ['blessed', 'svelte', 'yoga-layout-prebuilt'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.DEBUG': JSON.stringify(isDevelopment),
    },
    // Optimize dependencies
    optimizeDeps: {
      exclude: ['svelte/internal'],
    },
    
    // Mark blessed optional dependencies as external
    // This prevents Vite from trying to bundle them
    ssr: {
      // List of packages that should not be bundled by Vite
      external: [
        'blessed', 
        'term.js', 
        'pty.js', 
        'yoga-layout-prebuilt'
      ],
      noExternal: ['svelte']
    },
  };
});