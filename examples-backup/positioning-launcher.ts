/**
 * Launcher for Positioning Demo
 * Tests blessed-compatible positioning in SvelTUI
 */

import { setupBrowserGlobals } from '../src/utils/browser-globals'
import { render } from '../src/renderer'

// Setup browser globals for Svelte 5
setupBrowserGlobals()

// Import compiled component
// @ts-ignore - dynamic import
import PositioningDemo from './positioning-demo.svelte.mjs'

// Render the positioning demo
const cleanup = render(PositioningDemo)

// Handle graceful exit
process.on('SIGINT', () => {
  cleanup()
  process.exit(0)
})

process.on('exit', () => {
  cleanup()
})

console.log('Positioning demo started. Press q or Ctrl+C to quit.')