/**
 * Launcher for Two-Way Binding Demo
 * 
 * Run with: bun --conditions browser examples/two-way-binding-launcher.ts
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals.ts';
import { createRenderer } from '../src/renderer/index.ts';
// @ts-ignore - compiled component
import TwoWayBindingDemo from './two-way-binding-demo.svelte.mjs';

// Setup browser globals for Svelte 5
setupBrowserGlobals();

async function main() {
  console.log('Starting Two-Way Binding Demo...');
  
  // Create renderer
  const renderer = createRenderer({
    title: 'SvelTUI - Two-Way Binding Demo',
    fullscreen: true,
    smartCSR: true,
    autoPadding: false
  });
  
  try {
    // Mount the component
    console.log('Mounting Two-Way Binding Demo component...');
    await renderer.mount(TwoWayBindingDemo, {});
    
    console.log('Two-Way Binding Demo is running!');
    console.log('Use arrow keys to navigate, Enter to select, Tab to move between inputs');
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

// Run the demo
main().catch(console.error);