#!/usr/bin/env bun --conditions browser

/**
 * Launcher for Layout Demo
 * 
 * Demonstrates flexbox-style positioning and sizing
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals';
import { createRenderer } from '../src/renderer';
import LayoutDemoComponent from './layout-demo.svelte.mjs';

// Setup browser globals
setupBrowserGlobals();

async function main() {
  // Create renderer with proper configuration
  const renderer = createRenderer({
    screen: {
      title: 'SvelTUI - Layout Demo',
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
    await renderer.mount(LayoutDemoComponent, {});
    
    console.log('✅ Layout Demo is running!');
    console.log('Shows positioning, percentages, and center alignment');
    
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