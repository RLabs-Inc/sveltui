#!/usr/bin/env bun --conditions browser

import { setupBrowserGlobals } from '../src/utils/browser-globals';
import { mount } from 'svelte';
import blessed from 'blessed';
import { document } from '../src/dom';
import WorkingBindingDemo from './working-binding-demo.svelte.mjs';

// Setup browser globals
setupBrowserGlobals();

// Create screen 
const screen = blessed.screen({
  smartCSR: true,
  title: 'Debug Render'
});

// Debug: log screen children after setup
console.log('Initial screen children:', screen.children.length);

// Store the screen on document
(document as any).screen = screen;

// Create a root box manually to see if it shows
const debugBox = blessed.box({
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  content: 'Debug: If you see this, blessed is working',
  border: {
    type: 'line'
  }
});

screen.append(debugBox);
screen.render();

console.log('After manual box - screen children:', screen.children.length);

// Now try mounting the Svelte component
setTimeout(() => {
  console.log('Mounting Svelte component...');
  try {
    const app = mount(WorkingBindingDemo, {
      target: document.body
    });
    
    console.log('After mount - screen children:', screen.children.length);
    console.log('Document body children:', document.body.childNodes.length);
    
    // Render again
    screen.render();
    
  } catch (error) {
    console.error('Mount error:', error);
  }
}, 1000);

// Quit handler
screen.key(['q', 'C-c'], () => {
  process.exit(0);
});