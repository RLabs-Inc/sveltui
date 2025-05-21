/**
 * SvelTUI Minimal Demo Entry Point
 */

import { render } from '../src/renderer/index.js'
const App = './minimal-demo.svelte'

// Enable debug mode
const DEBUG = true

;(async () => {
  try {
    console.log('Starting SvelTUI Minimal Demo...')

    // Render the demo application to the terminal
    const cleanup = render(App, {
      title: 'SvelTUI Minimal Demo',
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

    console.log('SvelTUI Minimal Demo started. Press q or Ctrl+C to exit.')
  } catch (error) {
    console.error('Error starting SvelTUI Minimal Demo:', error)
    process.exit(1)
  }
})()