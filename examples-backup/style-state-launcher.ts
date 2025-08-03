/**
 * Launcher for Style State Demo
 * 
 * Run with: bun --conditions browser examples/style-state-launcher.ts
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals'
import { createRenderer } from '../src/renderer'
import StyleStateDemo from './style-state-demo.svelte.mjs'

// Setup browser globals for Svelte 5
setupBrowserGlobals()

// Create the terminal renderer
const renderer = createRenderer({
  fullscreen: true,
  smartCSR: true,
  dockBorders: true,
  title: 'SvelTUI Style State Demo'
})

// Mount the component
renderer.mount(StyleStateDemo, {})

// Handle cleanup
process.on('SIGINT', () => {
  renderer.destroy()
  process.exit(0)
})