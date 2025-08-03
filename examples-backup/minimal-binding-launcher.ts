/**
 * Launcher for Minimal Binding Test
 * 
 * Run with: bun --conditions browser examples/minimal-binding-launcher.ts
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals.ts';
import { createRenderer } from '../src/renderer/index.ts';
// @ts-ignore - compiled component
import MinimalBindingTest from './minimal-binding-test.svelte.mjs';

// Setup browser globals for Svelte 5
setupBrowserGlobals({ debug: true });

async function main() {
  console.log('Starting Minimal Binding Test...');
  
  // Create renderer
  const renderer = createRenderer({
    title: 'SvelTUI - Minimal Binding Test',
    fullscreen: true,
    smartCSR: true,
    autoPadding: false,
    debug: true
  });
  
  try {
    // Mount the component
    console.log('Mounting Minimal Binding Test component...');
    await renderer.mount(MinimalBindingTest, {});
    
    console.log('Minimal Binding Test is running!');
    console.log('Press q or Ctrl+C to quit');
    
    // Get the screen and ensure it's rendered
    const screen = renderer.screen;
    if (screen) {
      screen.render();
      
      // Add key handler for quit
      screen.key(['q', 'C-c'], () => {
        console.log('\nExiting...');
        renderer.unmount();
        process.exit(0);
      });
    }
    
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