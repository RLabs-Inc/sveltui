#!/usr/bin/env bun --conditions browser

import { setupBrowserGlobals } from '../src/utils/browser-globals';
import { createRenderer } from '../src/renderer';
import WorkingBindingDemo from './working-binding-demo.svelte.mjs';

// Setup browser globals
setupBrowserGlobals();

async function main() {
  // Create renderer with proper configuration
  const renderer = createRenderer({
    screen: {
      title: 'SvelTUI - Working Binding Demo',
      fullscreen: true,
      mouse: true,
      options: {
        smartCSR: true,
        keys: true
      }
    }
  });

  try {
    // Mount the component and wait for it
    await renderer.mount(WorkingBindingDemo, {});
    
    console.log('✅ Working Binding Demo is running!');
    console.log('Press Tab to focus input, q to quit');
    
    // The renderer should handle keeping the process alive
    // but we'll add a failsafe
    if (!renderer.screen) {
      console.error('No screen available');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Start the app
main().catch(console.error);