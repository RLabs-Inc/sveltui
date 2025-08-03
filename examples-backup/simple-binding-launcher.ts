/**
 * Launcher for Simple Binding Test
 * 
 * Run with: bun --conditions browser examples/simple-binding-launcher.ts
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals.ts';
import { createRenderer } from '../src/renderer/index.ts';
import { mount } from 'svelte';
// @ts-ignore - compiled component
import SimpleBindingTest from './simple-binding-test.svelte.mjs';

// Setup browser globals for Svelte 5
setupBrowserGlobals();

async function main() {
  console.log('Starting Simple Binding Test...');
  
  // Create renderer
  const renderer = createRenderer({
    title: 'SvelTUI - Simple Binding Test',
    fullscreen: true,
    smartCSR: true,
    autoPadding: false
  });
  
  try {
    // Mount the component
    console.log('Mounting Simple Binding Test component...');
    await renderer.mount(SimpleBindingTest, {});
    
    console.log('Simple Binding Test is running!');
    console.log('Press Tab to switch focus, Enter to submit input, Space to toggle checkbox');
    console.log('Press q or Ctrl+C to quit');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nExiting...');
      renderer.unmount();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      renderer.unmount();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error:', error);
    renderer.unmount();
    process.exit(1);
  }
}

// Run the test
main().catch(console.error);