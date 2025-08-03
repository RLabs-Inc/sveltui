#!/usr/bin/env bun --conditions browser

import { setupBrowserGlobals } from '../src/utils/browser-globals';
import { mount } from 'svelte';
import blessed from 'blessed';
import { document } from '../src/dom';
import WorkingBindingDemo from './working-binding-demo.svelte.mjs';

// Setup browser globals
setupBrowserGlobals();

// Create screen directly
const screen = blessed.screen({
  smartCSR: true,
  title: 'Test No Clear',
  fullscreen: false,  // Try without fullscreen
  height: '100%',
  width: '100%'
});

// Store the screen on document for the renderer to find
(document as any).screen = screen;

// Mount the component
try {
  const app = mount(WorkingBindingDemo, {
    target: document.body
  });
  
  // Initial render
  screen.render();
  
  console.log('Test running - press q to quit');
  
  // Simple quit handler
  screen.key(['q', 'C-c'], () => {
    // Don't destroy screen, just exit
    process.exit(0);
  });
  
} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}