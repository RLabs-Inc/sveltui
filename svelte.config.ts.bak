// svelte.config.ts
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import sveltuiPlugin from './src/compiler';

/** @type {import('@sveltejs/kit').Config} */
export default {
  // Tell svelte to process .svelte files
  extensions: [".svelte", ".svelte.ts"],
  
  // Preprocessor for TypeScript
  preprocess: vitePreprocess(),
  
  // Enable Svelte 5 runes and our custom compiler plugin
  compilerOptions: {
    runes: true,
    hydratable: false,
    // Ensure we're using Svelte 5 component API
    compatibility: {
      componentApi: 5
    }
  },
  
  // Custom plugins
  plugins: [
    // Add our custom SvelTUI plugin
    sveltuiPlugin({
      debug: process.env.NODE_ENV === 'development',
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
    })
  ]
};