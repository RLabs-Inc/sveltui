#!/usr/bin/env bun --conditions browser

import { setupBrowserGlobals } from '../src/utils/browser-globals';
import { mount } from 'svelte';
import { getScreen } from '../src/renderer/screen';
import { document } from '../src/dom';
import WorkingBindingDemo from './working-binding-demo.svelte.mjs';

// Setup browser globals
setupBrowserGlobals();

// Get or create screen
const screen = getScreen({
  title: 'SvelTUI Working Binding Demo',
  fullscreen: true
});

// Mount the component directly to document body
try {
  const app = mount(WorkingBindingDemo, {
    target: document.body
  });
  
  // Initial render
  screen.render();
  
  console.log('Working Binding Demo is running!');
  console.log('Press q to quit');
  
  // Add quit handler
  screen.key(['q', 'C-c'], () => {
    console.log('\nQuitting...');
    screen.destroy();
    process.exit(0);
  });
  
} catch (error) {
  console.error('Error:', error);
  screen.destroy();
  process.exit(1);
}