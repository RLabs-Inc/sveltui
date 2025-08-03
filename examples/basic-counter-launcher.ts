#!/usr/bin/env bun --conditions browser

/**
 * Launcher for Basic Counter Demo
 * 
 * Demonstrates reactive state with $state and $derived runes
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals';
import { createRenderer } from '../src/renderer';
import BasicCounterComponent from './basic-counter.svelte.mjs';

// Setup browser globals
setupBrowserGlobals();

async function main() {
  // Create renderer with proper configuration
  const renderer = createRenderer({
    debug: true,
    screen: {
      title: 'SvelTUI - Basic Counter Demo',
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
    await renderer.mount(BasicCounterComponent, {});
    
    console.log('✅ Basic Counter Demo is running!');
    console.log('Shows $state and $derived runes with automatic counter updates!');
    
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