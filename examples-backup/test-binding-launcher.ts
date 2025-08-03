/**
 * Test Binding Launcher
 * 
 * Run with: bun --conditions browser examples/test-binding-launcher.ts
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals.ts';
import { createRenderer } from '../src/renderer/index.ts';
// @ts-ignore - compiled component
import TestBinding from './test-binding.svelte.mjs';

// Setup browser globals for Svelte 5
setupBrowserGlobals();

// Create renderer
const renderer = createRenderer({
  title: 'SvelTUI - Test Binding',
  screen: {
    fullscreen: true,
    options: {
      smartCSR: true,
      autoPadding: true,
      dockBorders: true
    }
  },
  reactive: true
});

// Mount the component
renderer.mount(TestBinding, {}).then(() => {
  console.log('Test Binding is running!');
  console.log('Press Tab to focus input, Enter to submit, q to quit');
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  renderer.unmount();
  process.exit(0);
});

process.on('SIGTERM', () => {
  renderer.unmount();
  process.exit(0);
});

// Keep the process alive
setInterval(() => {}, 1000);