#!/usr/bin/env bun --conditions browser

/**
 * Launcher for Text Input Demo
 * 
 * Demonstrates two-way binding and form handling
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals';
import { createRenderer } from '../src/renderer';
import TextInputComponent from './text-input.svelte.mjs';

// Setup browser globals
setupBrowserGlobals();

async function main() {
  // Create renderer with proper configuration
  const renderer = createRenderer({
    screen: {
      title: 'SvelTUI - Text Input Demo',
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
    await renderer.mount(TextInputComponent, {});
    
    console.log('✅ Text Input Demo is running!');
    console.log('Type in the input field, press Enter to submit');
    
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