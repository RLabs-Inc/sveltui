#!/usr/bin/env bun --conditions browser

/**
 * Launcher for Style States Demo
 * 
 * Demonstrates hover, focus, and pressed styling
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals';
import { createRenderer } from '../src/renderer';
import StyleStatesComponent from './style-states.svelte.mjs';

// Setup browser globals
setupBrowserGlobals();

async function main() {
  // Create renderer with proper configuration
  const renderer = createRenderer({
    screen: {
      title: 'SvelTUI - Style States Demo',
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
    await renderer.mount(StyleStatesComponent, {});
    
    console.log('✅ Style States Demo is running!');
    console.log('Move cursor over elements to see hover, focus, pressed states');
    
    // The renderer should handle keeping the process alive
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