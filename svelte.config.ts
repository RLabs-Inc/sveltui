// svelte.config.ts
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
export default {
  // Tell svelte to process .svelte.ts files
  extensions: [".svelte", ".svelte.ts"],
  
  // Preprocessor for TypeScript
  preprocess: vitePreprocess(),
  
  // Enable Svelte 5 runes
  compilerOptions: {
    runes: true,
    hydratable: false
  }
};
