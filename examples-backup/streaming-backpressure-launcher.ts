#!/usr/bin/env bun

import { setupBrowserGlobals } from '../src/utils/browser-globals';
import { createRenderer } from '../src/renderer';
import StreamingBackpressureDemo from './streaming-backpressure-demo.svelte.mjs';

// Setup browser globals first
setupBrowserGlobals();

// Create the renderer
const renderer = createRenderer();

// Mount the demo component
renderer.mount(StreamingBackpressureDemo, {
  props: {}
});

// Cleanup on exit
process.on('SIGINT', () => {
  renderer.unmount();
  process.exit(0);
});

process.on('SIGTERM', () => {
  renderer.unmount();
  process.exit(0);
});