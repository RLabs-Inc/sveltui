#!/usr/bin/env bun --conditions browser

import { setupBrowserGlobals } from '../src/utils/browser-globals';
import { createRenderer } from '../src/renderer';
import DebugMinimal from './debug-minimal.svelte.mjs';

setupBrowserGlobals();

async function main() {
  const renderer = createRenderer({
    screen: {
      title: 'Debug Minimal',
      fullscreen: true,
      mouse: true,
      options: {
        smartCSR: true,
        keys: true
      }
    },
    debug: true // Enable debug logging
  });

  try {
    await renderer.mount(DebugMinimal, {});
    
    console.log('✅ Debug Minimal is running!');
    
    if (!renderer.screen) {
      console.error('No screen available');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main().catch(console.error);