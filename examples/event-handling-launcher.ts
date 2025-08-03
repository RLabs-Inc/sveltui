#!/usr/bin/env bun --conditions browser

/**
 * Launcher for Event Handling Demo
 * 
 * Demonstrates click, keyboard, and custom events
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals';
import { createRenderer } from '../src/renderer';
import EventHandlingComponent from './event-handling.svelte.mjs';

// Setup browser globals
setupBrowserGlobals();

async function main() {
  // Create renderer with proper configuration
  const renderer = createRenderer({
    screen: {
      title: 'SvelTUI - Event Handling Demo',
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
    await renderer.mount(EventHandlingComponent, {});
    
    console.log('✅ Event Handling Demo is running!');
    console.log('Use keyboard and mouse to interact with elements');
    
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