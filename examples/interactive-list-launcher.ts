#!/usr/bin/env bun --conditions browser

/**
 * Launcher for Interactive List Demo
 * 
 * Demonstrates keyboard navigation and item selection
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals';
import { createRenderer } from '../src/renderer';
import InteractiveListComponent from './interactive-list.svelte.mjs';

// Setup browser globals
setupBrowserGlobals();

async function main() {
  // Create renderer with proper configuration
  const renderer = createRenderer({
    screen: {
      title: 'SvelTUI - Interactive List Demo',
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
    await renderer.mount(InteractiveListComponent, {});
    
    console.log('✅ Interactive List Demo is running!');
    console.log('Use arrow keys to navigate, Enter to select');
    
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