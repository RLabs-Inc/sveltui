/**
 * SvelTUI Simple Counter Example
 */

import path from 'path';
// Import the render function from the svelte-renderer
// Bun can import TypeScript files directly
import { render } from '../../src/renderer/svelte-renderer';

// Enable debug mode
const DEBUG = true;

// Path to the App component
const appPath = new URL('./App.svelte', import.meta.url).pathname;

// Run the example
try {
  console.log('Starting SvelTUI Simple Counter Example...');
  
  // We're now passing the path directly
  // The renderer will handle loading and compiling the component
  console.log('Rendering component from path:', appPath);
  const result = render(appPath, {
    title: 'SvelTUI Counter',
    fullscreen: true,
    debug: DEBUG,
    // Blessed screen options
    blessed: {
      smartCSR: true,
      fullUnicode: false,
      fastCSR: true,
      useBCE: true,
    },
  });
  
  // Pull out the destroy function
  const { destroy } = result;
  
  // Handle exit keys
  process.stdin.on('keypress', (str, key) => {
    if (key.name === 'q' || key.name === 'escape' || (key.ctrl && key.name === 'c')) {
      // Clean up and exit
      try {
        destroy();
      } catch (err) {
        console.error('Error during cleanup:', err);
      }
      process.exit(0);
    }
  });
  
  // Handle clean exit
  process.on('SIGINT', () => {
    console.log('Received SIGINT, cleaning up...');
    try {
      destroy();
    } catch (err) {
      console.error('Error during cleanup:', err);
    }
    process.exit(0);
  });
  
  console.log('SvelTUI Simple Counter Example started. Press q or Ctrl+C to exit.');
} catch (error) {
  console.error('Error starting example:', error);
  process.exit(1);
}