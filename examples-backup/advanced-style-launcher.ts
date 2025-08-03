/**
 * Launcher for Advanced Style Demo
 * 
 * Run with: bun --conditions browser examples/advanced-style-launcher.ts
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals'
import { createRenderer } from '../src/renderer'
import AdvancedStyleDemo from './advanced-style-demo.svelte.mjs'

// Setup browser globals for Svelte 5
setupBrowserGlobals()

// Create the terminal renderer
const renderer = createRenderer({
  fullscreen: true,
  smartCSR: true,
  dockBorders: true,
  title: 'SvelTUI Advanced Style Demo',
  mouse: true
})

// Mount the component
renderer.mount(AdvancedStyleDemo, {})

// Handle cleanup
process.on('SIGINT', () => {
  renderer.destroy()
  process.exit(0)
})