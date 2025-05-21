/**
 * SvelTUI Basic Example
 *
 * This example demonstrates a simple counter app with
 * a list selection using SvelTUI.
 */

import { render } from '../../src/renderer/index.js'
// Use the compiled component to avoid server-side rendering issues
const App = '/Users/rusty/Documents/Projects/TUI/sveltui/examples/basic/SimpleApp.svelte.mjs'

// Enable debug mode
const DEBUG = true

;(async () => {
  try {
    console.log('Starting SvelTUI Basic Demo...')

    // Render the demo application to the terminal
    const cleanup = render(App, {
      title: 'SvelTUI Basic Demo',
      fullscreen: true,
      debug: DEBUG,
      // Additional blessed config to help with terminal issues
      blessed: {
        fullUnicode: false, // Disable Unicode to avoid issues
        smartCSR: true, // Enable smart CSR for better rendering
        fastCSR: true, // Use fast CSR mode
        forceUnicode: false, // Don't force Unicode
        useBCE: true, // Use BCE for drawing
      },
    })

    // Add global key handlers
    process.stdin.on('keypress', (str, key) => {
      // Handle quit keys
      if (
        key.name === 'q' ||
        key.name === 'escape' ||
        (key.ctrl && key.name === 'c')
      ) {
        cleanup();
        process.exit(0)
      }
    })

    // Handle clean exit
    process.on('SIGINT', () => {
      console.log('Received SIGINT, cleaning up...')
      try {
        cleanup()
      } catch (err) {
        console.error('Error during cleanup:', err)
      }
      process.exit(0)
    })

    console.log('SvelTUI Basic Demo started. Press q or Ctrl+C to exit.')
  } catch (error) {
    console.error('Error starting SvelTUI Basic Demo:', error)
    process.exit(1)
  }
})()
